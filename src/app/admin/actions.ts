"use server";

import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentAdmin, endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { walletEntry } from "@/lib/wallet";
import { buildManifest } from "@/lib/manifest";
import { DEFAULT_SETTINGS, HOME_SECTIONS, getSettings, num } from "@/lib/settings";
import { getHolidays } from "@/lib/holidays";
import { addDays, istNow } from "@/lib/dates";
import { nextDeliveryDate } from "@/lib/schedule";
import { normalizeRole, type Role } from "@/lib/permissions";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string, d = 0) => {
  const n = Number(String(f.get(k) ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && String(f.get(k) ?? "").trim() !== "" ? Math.round(n) : d;
};
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

// ───────── Auth ─────────

export async function adminLogin(_: unknown, f: FormData) {
  const admin = await db.admin.findUnique({ where: { email: str(f, "email").toLowerCase() } });
  if (!admin || !(await bcrypt.compare(str(f, "password"), admin.password))) return { error: "Email or password is incorrect." };
  await startAdminSession(admin.id);
  await audit(admin, "Signed in");
  redirect("/admin");
}

export async function adminLogout() {
  await endAdminSession();
  redirect("/admin/login");
}

export async function changePassword(_: unknown, f: FormData) {
  const admin = await currentAdmin();
  if (!admin) return { error: "Sign in again." };
  if (!(await bcrypt.compare(str(f, "current"), admin.password))) return { error: "Current password is wrong." };
  const next = str(f, "next");
  if (next.length < 10) return { error: "Use at least 10 characters." };
  await db.admin.update({ where: { id: admin.id }, data: { password: await bcrypt.hash(next, 10) } });
  await audit(admin, "Changed own password");
  return { ok: "Password changed." };
}

// ───────── Staff ─────────

const ROLES: Role[] = ["OWNER", "OPS", "CONTENT"];

export async function createStaff(_: unknown, f: FormData) {
  const admin = await requireAdmin("staff");
  const email = str(f, "email").toLowerCase();
  const name = str(f, "name");
  const role = normalizeRole(str(f, "role"));
  const password = str(f, "password");
  if (!/^\S+@\S+\.\S+$/.test(email) || !name) return { error: "Enter a name and a valid email." };
  if (password.length < 10) return { error: "Temporary password needs at least 10 characters." };
  if (await db.admin.findUnique({ where: { email } })) return { error: "Someone already uses that email." };
  await db.admin.create({ data: { email, name, role, password: await bcrypt.hash(password, 10) } });
  await audit(admin, "Added staff", email, role);
  revalidatePath("/admin/staff");
  return { ok: `${name} can now sign in with ${email}.` };
}

export async function updateStaff(f: FormData) {
  const admin = await requireAdmin("staff");
  const id = str(f, "id");
  const target = await db.admin.findUniqueOrThrow({ where: { id } });
  const action = str(f, "action");
  const owners = (await db.admin.findMany()).filter((a) => normalizeRole(a.role) === "OWNER");
  const isLastOwner = normalizeRole(target.role) === "OWNER" && owners.length === 1;

  if (action === "delete") {
    if (target.id === admin.id || isLastOwner) return;
    await db.admin.delete({ where: { id } });
    await audit(admin, "Removed staff", target.email);
  } else if (action === "role") {
    const role = normalizeRole(str(f, "role"));
    if (!ROLES.includes(role) || (isLastOwner && role !== "OWNER")) return;
    await db.admin.update({ where: { id }, data: { role } });
    await audit(admin, "Changed role", target.email, role);
  } else if (action === "reset") {
    const password = str(f, "password");
    if (password.length < 10) return;
    await db.admin.update({ where: { id }, data: { password: await bcrypt.hash(password, 10) } });
    await audit(admin, "Reset password", target.email);
  }
  revalidatePath("/admin/staff");
}

// ───────── Orders ─────────

export async function setOrderStatus(f: FormData) {
  const admin = await requireAdmin("orders");
  const id = str(f, "id");
  const status = str(f, "status");
  const order = await db.order.update({ where: { id }, data: { status } });
  if (status === "DELIVERED" && order.payment === "COD") await db.order.update({ where: { id }, data: { paymentStatus: "PAID" } });
  await audit(admin, "Order status", order.number, status);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

/** Finds a customer by mobile number for the phone-order form. */
export async function lookupCustomer(phone: string) {
  await requireAdmin("orders");
  const p = phone.replace(/\D/g, "").slice(-10);
  if (p.length !== 10) return null;
  const u = await db.user.findUnique({ where: { phone: p }, include: { addresses: { orderBy: { createdAt: "desc" } } } });
  if (!u) return { found: false as const };
  const pins = new Set((await db.pincode.findMany({ where: { active: true }, select: { code: true } })).map((x) => x.code));
  return {
    found: true as const,
    name: u.name,
    wallet: u.wallet,
    addresses: u.addresses.map((a) => ({ id: a.id, text: `${a.label}: ${a.line1}${a.line2 ? ", " + a.line2 : ""}, ${a.city} ${a.pincode}`, fresh: pins.has(a.pincode) })),
  };
}

/** Creates an order taken over the phone or WhatsApp, on the customer's behalf. */
export async function createPhoneOrder(_: unknown, f: FormData) {
  const admin = await requireAdmin("orders");
  const phone = str(f, "phone").replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) return { error: "Enter the customer's 10-digit mobile number." };
  let lines: { variantId: string; qty: number }[] = [];
  try {
    lines = JSON.parse(str(f, "lines"));
  } catch {}
  lines = lines.filter((l) => l.variantId && l.qty > 0);
  if (!lines.length) return { error: "Add at least one product." };

  let user = await db.user.findUnique({ where: { phone } });
  if (!user) user = await db.user.create({ data: { phone, name: str(f, "name") } });
  else if (!user.name && str(f, "name")) user = await db.user.update({ where: { id: user.id }, data: { name: str(f, "name") } });

  let addressId = str(f, "addressId");
  if (!addressId || addressId === "new") {
    if (!str(f, "line1") || !str(f, "city") || !/^\d{6}$/.test(str(f, "pincode"))) return { error: "Enter the delivery address with a 6-digit pincode." };
    const a = await db.address.create({
      data: { userId: user.id, label: "Home", name: user.name || str(f, "name") || "Customer", line1: str(f, "line1"), line2: str(f, "line2"), city: str(f, "city"), pincode: str(f, "pincode") },
    });
    addressId = a.id;
  }
  const address = await db.address.findFirst({ where: { id: addressId, userId: user.id } });
  if (!address) return { error: "Choose one of this customer's addresses." };

  const variants = await db.variant.findMany({ where: { id: { in: lines.map((l) => l.variantId) } }, include: { product: true } });
  const items = lines.map((l) => ({ l, v: variants.find((x) => x.id === l.variantId)! })).filter((x) => x.v);
  const subtotal = items.reduce((t, x) => t + x.v.price * x.l.qty, 0);
  const s = await getSettings();
  const pin = await db.pincode.findUnique({ where: { code: address.pincode } });
  const local = !!pin?.active;
  if (items.some((x) => x.v.product.delivery === "FRESH") && !local) return { error: "Fresh items only deliver in the Tricity. Remove them or use a Tricity address." };
  const fee = str(f, "waiveFee") === "on" ? 0 : local ? (subtotal >= num(s.freeDeliveryAbove) ? 0 : num(s.deliveryFee)) : subtotal >= num(s.freeShipAbove) ? 0 : num(s.shipFee);
  const total = subtotal + fee;
  const payment = ["COD", "WALLET", "UPI_MANUAL"].includes(str(f, "payment")) ? str(f, "payment") : "COD";
  if (payment === "WALLET" && user.wallet < total) return { error: `Wallet has only ₹${user.wallet}.` };

  const holidays = await getHolidays();
  const requested = str(f, "deliverOn");
  const deliverOn = local ? (isDate(requested) && !holidays.set.has(requested) ? requested : nextDeliveryDate(num(s.cutoffHour), holidays.set)) : null;
  const number = "GG" + istNow().date.replaceAll("-", "").slice(2) + String(randomInt(100, 1000)) + String(Date.now()).slice(-3);

  const order = await db.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        number, userId: user.id, payment: payment === "UPI_MANUAL" ? "RAZORPAY" : payment,
        paymentStatus: payment === "COD" ? "PENDING" : "PAID", status: "CONFIRMED",
        subtotal, deliveryFee: fee, total, address: JSON.stringify(address), deliverOn,
        slot: deliverOn ? `${deliverOn} · 6–8 AM` : "Courier · 3–6 days",
        note: str(f, "note"), source: "PHONE", createdBy: admin.name,
        items: { create: items.map((x) => ({ variantId: x.v.id, name: x.v.product.name, label: x.v.label, price: x.v.price, qty: x.l.qty })) },
      },
    });
    for (const x of items) await tx.variant.update({ where: { id: x.v.id }, data: { stock: { decrement: x.l.qty } } });
    if (payment === "WALLET") await walletEntry(tx, user.id, -total, "DEBIT", `Order ${number} (phone)`);
    return o;
  });
  await audit(admin, "Phone order", order.number, `₹${total} · ${payment}`);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders?q=${order.number}&created=1`);
}

// ───────── Manifest / deliveries ─────────

export async function markDelivered(f: FormData) {
  const admin = await requireAdmin("manifest");
  const date = str(f, "date");
  const only = new Set(f.getAll("key").map(String).filter(Boolean));
  const { stops } = await buildManifest(date);
  let n = 0;
  for (const st of stops) {
    if (st.delivered || (only.size && !only.has(st.key))) continue;
    n++;
    if (st.kind === "SUB" && st.subscriptionId) {
      const item = st.items[0];
      await db.$transaction(async (tx) => {
        await tx.delivery.create({ data: { date, userId: st.userId, subscriptionId: st.subscriptionId, variantId: item.variantId, qty: item.qty, amount: item.amount, status: "DELIVERED", deliveredAt: new Date() } });
        await walletEntry(tx, st.userId, -item.amount, "DEBIT", `${item.name} ${item.label} × ${item.qty} · ${date}`);
      });
    } else if (st.orderId) {
      const o = await db.order.update({ where: { id: st.orderId }, data: { status: "DELIVERED" } });
      if (o.payment === "COD") await db.order.update({ where: { id: o.id }, data: { paymentStatus: "PAID" } });
    }
  }
  await audit(admin, "Marked delivered", date, `${n} drop${n === 1 ? "" : "s"}`);
  revalidatePath("/admin/manifest");
  revalidatePath("/admin");
}

// ───────── Delivery holidays ─────────

export async function saveHoliday(f: FormData) {
  const admin = await requireAdmin("holidays");
  const from = str(f, "date");
  const to = str(f, "to") || from;
  if (!isDate(from) || !isDate(to) || to < from) return;
  const note = str(f, "note").slice(0, 80);
  for (let d = from, i = 0; d <= to && i < 31; d = addDays(d, 1), i++) {
    await db.holiday.upsert({ where: { date: d }, create: { date: d, note }, update: { note } });
  }
  await audit(admin, "Added delivery holiday", from === to ? from : `${from} → ${to}`, note);
  revalidatePath("/", "layout");
}

export async function deleteHoliday(f: FormData) {
  const admin = await requireAdmin("holidays");
  const date = str(f, "date");
  await db.holiday.delete({ where: { date } }).catch(() => null);
  await audit(admin, "Removed delivery holiday", date);
  revalidatePath("/", "layout");
}

// ───────── Products & stock ─────────

export async function saveProduct(f: FormData) {
  const admin = await requireAdmin("products");
  const id = str(f, "id");
  const data = {
    name: str(f, "name"),
    slug: str(f, "slug").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
    hindi: str(f, "hindi"),
    tagline: str(f, "tagline"),
    description: str(f, "description"),
    categoryId: str(f, "categoryId"),
    delivery: str(f, "delivery") === "SHIP" ? "SHIP" : "FRESH",
    subscribable: bool(f, "subscribable"),
    pack: str(f, "pack") || "jar",
    liquid: str(f, "liquid") || "#e2a93b",
    label: str(f, "label") || "#1c1a15",
    image: str(f, "image") || null,
    video: str(f, "video") || null,
    gallery: JSON.stringify(str(f, "gallery").split("\n").map((x) => x.trim()).filter(Boolean)),
    highlights: JSON.stringify(str(f, "highlights").split("\n").map((x) => x.trim()).filter(Boolean)),
    ingredients: str(f, "ingredients"),
    shelfLife: str(f, "shelfLife"),
    storage: str(f, "storage"),
    gstRate: Math.max(0, Math.min(28, int(f, "gstRate", 5))),
    badge: str(f, "badge") || null,
    active: bool(f, "active"),
    featured: bool(f, "featured"),
  };
  if (!data.name || !data.slug || !data.categoryId) throw new Error("Name, slug and category are required.");

  const product = id ? await db.product.update({ where: { id }, data }) : await db.product.create({ data: { ...data, sort: 999 } });

  // Variants: rows named v_<index>_<field>; blank label removes the row
  const rows = new Map<string, Record<string, string>>();
  for (const [k, v] of f.entries()) {
    const m = k.match(/^v_(\w+)_(id|label|price|mrp|subPrice|stock)$/);
    if (!m) continue;
    const r = rows.get(m[1]) ?? {};
    r[m[2]] = String(v).trim();
    rows.set(m[1], r);
  }
  let sort = 0;
  for (const r of rows.values()) {
    const payload = {
      label: r.label, price: Number(r.price) || 0, mrp: Number(r.mrp) || Number(r.price) || 0,
      subPrice: r.subPrice ? Number(r.subPrice) : null, stock: Number(r.stock) || 0, sort: sort++,
    };
    if (r.id && !r.label) {
      const used = await db.orderItem.count({ where: { variantId: r.id } }) + (await db.subscription.count({ where: { variantId: r.id } }));
      if (!used) await db.variant.delete({ where: { id: r.id } });
      continue;
    }
    if (!r.label) continue;
    if (r.id) await db.variant.update({ where: { id: r.id }, data: payload });
    else await db.variant.create({ data: { ...payload, productId: product.id, sku: `${product.slug}-${r.label.replace(/[^a-z0-9]+/gi, "").toLowerCase()}-${Date.now().toString(36)}` } });
  }
  await audit(admin, id ? "Edited product" : "Added product", product.name);
  revalidatePath("/", "layout");
  redirect(`/admin/products/${product.id}?saved=1`);
}

export async function toggleProduct(f: FormData) {
  const admin = await requireAdmin("products");
  const p = await db.product.findUniqueOrThrow({ where: { id: str(f, "id") } });
  await db.product.update({ where: { id: p.id }, data: { active: !p.active } });
  await audit(admin, p.active ? "Hid product" : "Showed product", p.name);
  revalidatePath("/", "layout");
}

/** Sets stock to an exact count, or adds a delivery of new stock. */
export async function updateStock(f: FormData) {
  const admin = await requireAdmin("stock");
  const id = str(f, "id");
  const mode = str(f, "mode");
  const value = int(f, "value");
  const v = await db.variant.findUniqueOrThrow({ where: { id }, include: { product: true } });
  const stock = Math.max(0, mode === "add" ? v.stock + value : value);
  await db.variant.update({ where: { id }, data: { stock } });
  await audit(admin, mode === "add" ? "Restocked" : "Set stock", `${v.product.name} ${v.label}`, `${v.stock} → ${stock}`);
  revalidatePath("/admin/stock");
  revalidatePath("/admin");
}

// ───────── Making stories ─────────

export async function saveStory(f: FormData) {
  const admin = await requireAdmin("making");
  const steps: { at: number; title: string; body: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const title = str(f, `s_${i}_title`);
    if (!title) continue;
    steps.push({ at: int(f, `s_${i}_at`), title, body: str(f, `s_${i}_body`) });
  }
  steps.sort((a, b) => a.at - b.at);
  await db.makingStory.update({
    where: { id: str(f, "id") },
    data: { title: str(f, "title"), hindi: str(f, "hindi"), intro: str(f, "intro"), video: str(f, "video"), poster: str(f, "poster"), active: bool(f, "active"), steps: JSON.stringify(steps) },
  });
  await audit(admin, "Edited making video", str(f, "title"));
  revalidatePath("/", "layout");
}

// ───────── Homepage, banners, festival ─────────

export async function saveHomeSections(f: FormData) {
  const admin = await requireAdmin("homepage");
  let order: { key: string; visible: boolean }[] = [];
  try {
    order = JSON.parse(str(f, "sections"));
  } catch {}
  const known = new Set<string>(HOME_SECTIONS.map((x) => x.key));
  const value = JSON.stringify(order.filter((x) => known.has(x.key)).map((x) => ({ key: x.key, visible: !!x.visible })));
  await db.setting.upsert({ where: { key: "homeSections" }, create: { key: "homeSections", value }, update: { value } });
  await audit(admin, "Rearranged homepage");
  revalidatePath("/", "layout");
}

export async function saveFestival(f: FormData) {
  const admin = await requireAdmin("homepage");
  const value = ["none", "diwali", "holi", "lohri"].includes(str(f, "festival")) ? str(f, "festival") : "none";
  await db.setting.upsert({ where: { key: "festival" }, create: { key: "festival", value }, update: { value } });
  await audit(admin, "Festival theme", value);
  revalidatePath("/", "layout");
}

export async function saveBanner(f: FormData) {
  const admin = await requireAdmin("homepage");
  const id = str(f, "id");
  const data = {
    placement: str(f, "placement") === "BAR" ? "BAR" : "HOME",
    title: str(f, "title").slice(0, 120),
    subtitle: str(f, "subtitle").slice(0, 200),
    cta: str(f, "cta").slice(0, 40),
    href: str(f, "href").slice(0, 200),
    image: str(f, "image") || null,
    tone: ["ghee", "tulsi", "clay", "ink"].includes(str(f, "tone")) ? str(f, "tone") : "ghee",
    startsOn: isDate(str(f, "startsOn")) ? str(f, "startsOn") : null,
    endsOn: isDate(str(f, "endsOn")) ? str(f, "endsOn") : null,
    active: bool(f, "active"),
  };
  if (!data.title) return;
  if (id) await db.banner.update({ where: { id }, data });
  else await db.banner.create({ data });
  await audit(admin, id ? "Edited banner" : "Added banner", data.title, [data.startsOn, data.endsOn].filter(Boolean).join(" → "));
  revalidatePath("/", "layout");
}

export async function deleteBanner(f: FormData) {
  const admin = await requireAdmin("homepage");
  const b = await db.banner.delete({ where: { id: str(f, "id") } });
  await audit(admin, "Deleted banner", b.title);
  revalidatePath("/", "layout");
}

// ───────── Pop-ups ─────────

export async function savePopup(f: FormData) {
  const admin = await requireAdmin("popups");
  const id = str(f, "id");
  const data = { kind: str(f, "kind") || "INFO", badge: str(f, "badge").slice(0, 6), title: str(f, "title"), subtitle: str(f, "subtitle"), active: bool(f, "active") };
  if (!data.title) return;
  if (id) await db.popup.update({ where: { id }, data });
  else await db.popup.create({ data: { ...data, sort: 99 } });
  await audit(admin, id ? "Edited pop-up" : "Added pop-up", data.title);
  revalidatePath("/", "layout");
}

export async function deletePopup(f: FormData) {
  const admin = await requireAdmin("popups");
  const p = await db.popup.delete({ where: { id: str(f, "id") } });
  await audit(admin, "Deleted pop-up", p.title);
  revalidatePath("/", "layout");
}

// ───────── Reviews ─────────

export async function moderateReview(f: FormData) {
  const admin = await requireAdmin("reviews");
  const id = str(f, "id");
  const action = str(f, "action");
  if (action === "delete") await db.review.delete({ where: { id } });
  else await db.review.update({ where: { id }, data: action === "approve" ? { approved: true } : action === "hide" ? { approved: false, featured: false } : { featured: action === "feature" } });
  await audit(admin, `Review: ${action}`, id);
  revalidatePath("/", "layout");
}

// ───────── Batches ─────────

export async function saveBatch(f: FormData) {
  const admin = await requireAdmin("batches");
  const data = {
    code: str(f, "code").toUpperCase(),
    productId: str(f, "productId"),
    madeOn: new Date(str(f, "madeOn") + "T06:00:00+05:30"),
    milkedOn: str(f, "milkedOn") ? new Date(str(f, "milkedOn") + "T04:00:00+05:30") : null,
    expiresOn: isDate(str(f, "expiresOn")) ? new Date(str(f, "expiresOn") + "T23:59:00+05:30") : null,
    quantity: str(f, "quantity"),
    fat: str(f, "fat") || null,
    moisture: str(f, "moisture") || null,
    lab: str(f, "lab"),
    reportUrl: str(f, "reportUrl") || null,
    result: str(f, "result") || "PASS",
    notes: str(f, "notes"),
  };
  if (!data.code || !data.productId || !str(f, "madeOn")) return;
  const id = str(f, "id");
  if (id) await db.batch.update({ where: { id }, data });
  else await db.batch.create({ data });
  await audit(admin, id ? "Edited batch" : "Added batch", data.code);
  revalidatePath("/", "layout");
}

// ───────── Coupons ─────────

export async function saveCoupon(f: FormData) {
  const admin = await requireAdmin("coupons");
  const code = str(f, "code").toUpperCase().replace(/\s+/g, "");
  if (!code) return;
  const data = { kind: str(f, "kind") === "FLAT" ? "FLAT" : "PERCENT", value: int(f, "value"), minOrder: int(f, "minOrder"), note: str(f, "note"), active: bool(f, "active") };
  await db.coupon.upsert({ where: { code }, create: { code, ...data }, update: data });
  await audit(admin, "Saved coupon", code, data.active ? "active" : "off");
  revalidatePath("/admin/coupons");
}

// ───────── Delivery zones ─────────

export async function savePincode(f: FormData) {
  const admin = await requireAdmin("zones");
  const code = str(f, "code");
  if (!/^\d{6}$/.test(code)) return;
  const data = { area: str(f, "area"), city: str(f, "city"), active: bool(f, "active") };
  await db.pincode.upsert({ where: { code }, create: { code, ...data }, update: data });
  await audit(admin, "Saved pincode", code, `${data.area}, ${data.city}`);
  revalidatePath("/admin/zones");
}

export async function togglePincode(f: FormData) {
  const admin = await requireAdmin("zones");
  const p = await db.pincode.findUniqueOrThrow({ where: { code: str(f, "code") } });
  await db.pincode.update({ where: { code: p.code }, data: { active: !p.active } });
  await audit(admin, p.active ? "Paused pincode" : "Enabled pincode", p.code);
  revalidatePath("/admin/zones");
}

// ───────── Customers & subscriptions ─────────

export async function adjustWallet(f: FormData) {
  const admin = await requireAdmin("customers");
  const amount = int(f, "amount");
  if (!amount) return;
  const userId = str(f, "userId");
  const note = str(f, "note") || (amount > 0 ? "Credit from Gaurgram" : "Adjustment");
  await walletEntry(db, userId, amount, amount > 0 ? "CREDIT" : "DEBIT", note);
  const u = await db.user.findUnique({ where: { id: userId } });
  await audit(admin, "Wallet adjustment", u?.phone ?? userId, `${amount > 0 ? "+" : ""}${amount} · ${note}`);
  revalidatePath("/admin/customers");
}

export async function adminSubscription(f: FormData) {
  const admin = await requireAdmin("subscriptions");
  const id = str(f, "id");
  const action = str(f, "action");
  const data =
    action === "pause" ? { status: "PAUSED", pauseFrom: null, pauseTo: null }
    : action === "resume" ? { status: "ACTIVE", pauseFrom: null, pauseTo: null }
    : { status: "CANCELLED", cancelledAt: new Date() };
  await db.subscription.update({ where: { id }, data });
  await audit(admin, `Subscription: ${action}`, id);
  revalidatePath("/admin/subscriptions");
}

/** Changes a customer's plan on their behalf (for phone and WhatsApp requests). */
export async function adminEditSubscription(f: FormData) {
  const admin = await requireAdmin("subscriptions");
  const id = str(f, "id");
  const pattern = ["DAILY", "ALTERNATE", "CUSTOM"].includes(str(f, "pattern")) ? str(f, "pattern") : "DAILY";
  const week = [0, 1, 2, 3, 4, 5, 6].map((i) => Math.max(0, Math.min(10, int(f, `w${i}`))));
  const qty = Math.max(1, Math.min(10, int(f, "qty", 1)));
  const pauseFrom = isDate(str(f, "pauseFrom")) ? str(f, "pauseFrom") : null;
  const pauseTo = isDate(str(f, "pauseTo")) ? str(f, "pauseTo") : null;
  await db.subscription.update({
    where: { id },
    data: { pattern, qty, weekQty: JSON.stringify(week), slot: str(f, "slot") === "5–7 AM" ? "5–7 AM" : "6–8 AM", pauseFrom, pauseTo: pauseFrom ? pauseTo : null, status: "ACTIVE" },
  });
  await audit(admin, "Edited subscription", id, `${pattern} · qty ${qty}${pauseFrom ? ` · paused ${pauseFrom}→${pauseTo ?? "…"}` : ""}`);
  revalidatePath(`/admin/subscriptions/${id}`);
  revalidatePath("/admin/subscriptions");
}

export async function adminSetDay(f: FormData) {
  const admin = await requireAdmin("subscriptions");
  const id = str(f, "id");
  const date = str(f, "date");
  if (!isDate(date)) return;
  const qty = Math.max(0, Math.min(10, int(f, "qty")));
  if (str(f, "clear") === "1") await db.dayOverride.deleteMany({ where: { subscriptionId: id, date } });
  else await db.dayOverride.upsert({ where: { subscriptionId_date: { subscriptionId: id, date } }, create: { subscriptionId: id, date, qty }, update: { qty } });
  await audit(admin, "Changed a delivery day", id, `${date} → ${str(f, "clear") === "1" ? "plan" : qty}`);
  revalidatePath(`/admin/subscriptions/${id}`);
}

// ───────── Settings ─────────

export async function saveSettings(f: FormData) {
  const admin = await requireAdmin("settings");
  const changed: string[] = [];
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!f.has(key)) continue;
    const value = str(f, key);
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    changed.push(key);
  }
  await audit(admin, "Saved site settings", "", changed.join(", "));
  revalidatePath("/", "layout");
}
