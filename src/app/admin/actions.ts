"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentAdmin, endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { walletEntry } from "@/lib/wallet";
import { buildManifest } from "@/lib/manifest";
import { DEFAULT_SETTINGS } from "@/lib/settings";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string, d = 0) => {
  const n = Number(String(f.get(k) ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && String(f.get(k) ?? "").trim() !== "" ? Math.round(n) : d;
};
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

// ───────── Auth ─────────

export async function adminLogin(_: unknown, f: FormData) {
  const admin = await db.admin.findUnique({ where: { email: str(f, "email").toLowerCase() } });
  if (!admin || !(await bcrypt.compare(str(f, "password"), admin.password))) return { error: "Email or password is incorrect." };
  await startAdminSession(admin.id);
  redirect("/admin");
}

export async function adminLogout() {
  await endAdminSession();
  redirect("/admin/login");
}

// ───────── Orders ─────────

export async function setOrderStatus(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const status = str(f, "status");
  const order = await db.order.update({ where: { id }, data: { status } });
  if (status === "DELIVERED" && order.payment === "COD") await db.order.update({ where: { id }, data: { paymentStatus: "PAID" } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// ───────── Manifest / deliveries ─────────

export async function markDelivered(f: FormData) {
  await requireAdmin();
  const date = str(f, "date");
  const only = new Set(f.getAll("key").map(String).filter(Boolean));
  const { stops } = await buildManifest(date);
  for (const st of stops) {
    if (st.delivered || (only.size && !only.has(st.key))) continue;
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
  revalidatePath("/admin/manifest");
  revalidatePath("/admin");
}

// ───────── Products ─────────

export async function saveProduct(f: FormData) {
  await requireAdmin();
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
  revalidatePath("/", "layout");
  redirect(`/admin/products/${product.id}?saved=1`);
}

export async function toggleProduct(f: FormData) {
  await requireAdmin();
  const p = await db.product.findUniqueOrThrow({ where: { id: str(f, "id") } });
  await db.product.update({ where: { id: p.id }, data: { active: !p.active } });
  revalidatePath("/", "layout");
}

// ───────── Making stories ─────────

export async function saveStory(f: FormData) {
  await requireAdmin();
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
  revalidatePath("/", "layout");
}

// ───────── Pop-ups ─────────

export async function savePopup(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const data = { kind: str(f, "kind") || "INFO", badge: str(f, "badge").slice(0, 6), title: str(f, "title"), subtitle: str(f, "subtitle"), active: bool(f, "active") };
  if (!data.title) return;
  if (id) await db.popup.update({ where: { id }, data });
  else await db.popup.create({ data: { ...data, sort: 99 } });
  revalidatePath("/", "layout");
}

export async function deletePopup(f: FormData) {
  await requireAdmin();
  await db.popup.delete({ where: { id: str(f, "id") } });
  revalidatePath("/", "layout");
}

// ───────── Reviews ─────────

export async function moderateReview(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const action = str(f, "action");
  if (action === "delete") await db.review.delete({ where: { id } });
  else await db.review.update({ where: { id }, data: action === "approve" ? { approved: true } : action === "hide" ? { approved: false, featured: false } : { featured: action === "feature" } });
  revalidatePath("/", "layout");
}

// ───────── Batches ─────────

export async function saveBatch(f: FormData) {
  await requireAdmin();
  const data = {
    code: str(f, "code").toUpperCase(),
    productId: str(f, "productId"),
    madeOn: new Date(str(f, "madeOn") + "T06:00:00+05:30"),
    milkedOn: str(f, "milkedOn") ? new Date(str(f, "milkedOn") + "T04:00:00+05:30") : null,
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
  revalidatePath("/", "layout");
}

// ───────── Coupons ─────────

export async function saveCoupon(f: FormData) {
  await requireAdmin();
  const code = str(f, "code").toUpperCase().replace(/\s+/g, "");
  if (!code) return;
  const data = { kind: str(f, "kind") === "FLAT" ? "FLAT" : "PERCENT", value: int(f, "value"), minOrder: int(f, "minOrder"), note: str(f, "note"), active: bool(f, "active") };
  await db.coupon.upsert({ where: { code }, create: { code, ...data }, update: data });
  revalidatePath("/admin/coupons");
}

// ───────── Delivery zones ─────────

export async function savePincode(f: FormData) {
  await requireAdmin();
  const code = str(f, "code");
  if (!/^\d{6}$/.test(code)) return;
  const data = { area: str(f, "area"), city: str(f, "city"), active: bool(f, "active") };
  await db.pincode.upsert({ where: { code }, create: { code, ...data }, update: data });
  revalidatePath("/admin/zones");
}

export async function togglePincode(f: FormData) {
  await requireAdmin();
  const p = await db.pincode.findUniqueOrThrow({ where: { code: str(f, "code") } });
  await db.pincode.update({ where: { code: p.code }, data: { active: !p.active } });
  revalidatePath("/admin/zones");
}

// ───────── Customers ─────────

export async function adjustWallet(f: FormData) {
  await requireAdmin();
  const amount = int(f, "amount");
  if (!amount) return;
  await walletEntry(db, str(f, "userId"), amount, amount > 0 ? "CREDIT" : "DEBIT", str(f, "note") || (amount > 0 ? "Credit from Gaurgram" : "Adjustment"));
  revalidatePath("/admin/customers");
}

export async function adminSubscription(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const action = str(f, "action");
  const data = action === "pause" ? { status: "PAUSED", pauseFrom: null, pauseTo: null } : action === "resume" ? { status: "ACTIVE", pauseFrom: null, pauseTo: null } : { status: "CANCELLED" };
  await db.subscription.update({ where: { id }, data });
  revalidatePath("/admin/subscriptions");
}

// ───────── Settings ─────────

export async function saveSettings(f: FormData) {
  await requireAdmin();
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!f.has(key)) continue;
    const value = str(f, key);
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  revalidatePath("/", "layout");
}

export async function changePassword(_: unknown, f: FormData) {
  const admin = await currentAdmin();
  if (!admin) return { error: "Sign in again." };
  if (!(await bcrypt.compare(str(f, "current"), admin.password))) return { error: "Current password is wrong." };
  const next = str(f, "next");
  if (next.length < 10) return { error: "Use at least 10 characters." };
  await db.admin.update({ where: { id: admin.id }, data: { password: await bcrypt.hash(next, 10) } });
  return { ok: "Password changed." };
}
