"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentUser, endUserSession, startUserSession } from "@/lib/auth";
import { getSettings, num } from "@/lib/settings";
import { addDays, istNow } from "@/lib/dates";
import { firstEditableDate, isEditable, planQty } from "@/lib/schedule";
import { walletEntry } from "@/lib/wallet";
import { createRazorpayOrder, fetchRazorpayOrder, razorpayEnabled, razorpayKeyId, verifyRazorpaySignature } from "@/lib/razorpay";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const PHONE = /^[6-9]\d{9}$/;

async function mustUser() {
  const u = await currentUser();
  if (!u) throw new Error("Please sign in first.");
  return u;
}

// ───────────────────────── Login ─────────────────────────

export async function sendOtp(phone: string): Promise<Result<{ devCode?: string }>> {
  phone = phone.replace(/\D/g, "").slice(-10);
  if (!PHONE.test(phone)) return { ok: false, error: "Enter a valid 10-digit mobile number." };
  const recent = await db.otpCode.count({ where: { phone, expiresAt: { gt: new Date(Date.now() + 9 * 60000) } } });
  if (recent >= 3) return { ok: false, error: "Too many codes requested. Wait a minute and try again." };
  const code = String(randomInt(100000, 1000000));
  await db.otpCode.create({ data: { phone, code, expiresAt: new Date(Date.now() + 10 * 60000) } });
  // No SMS provider is connected yet, so the code is shown on screen (development mode).
  const devMode = !process.env.SMS_PROVIDER;
  return { ok: true, devCode: devMode ? code : undefined };
}

export async function verifyOtp(phone: string, code: string, name?: string): Promise<Result<{ isNew: boolean }>> {
  phone = phone.replace(/\D/g, "").slice(-10);
  const otp = await db.otpCode.findFirst({
    where: { phone, code: code.trim(), used: false, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });
  if (!otp) return { ok: false, error: "That code is wrong or has expired." };
  await db.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  let user = await db.user.findUnique({ where: { phone } });
  const isNew = !user;
  if (!user) user = await db.user.create({ data: { phone, name: name?.trim() ?? "" } });
  else if (name?.trim() && !user.name) user = await db.user.update({ where: { id: user.id }, data: { name: name.trim() } });
  await startUserSession(user.id);
  return { ok: true, isNew };
}

export async function updateProfile(name: string, email: string): Promise<Result> {
  const u = await mustUser();
  await db.user.update({ where: { id: u.id }, data: { name: name.trim().slice(0, 80), email: email.trim().slice(0, 120) } });
  revalidatePath("/account");
  return { ok: true };
}

export async function logout() {
  await endUserSession();
  revalidatePath("/", "layout");
}

// ───────────────────────── Addresses ─────────────────────────

export type AddressInput = { label: string; name: string; line1: string; line2?: string; landmark?: string; city: string; state?: string; pincode: string };

export async function saveAddress(a: AddressInput): Promise<Result<{ id: string; fresh: boolean }>> {
  const u = await mustUser();
  if (!a.name?.trim() || !a.line1?.trim() || !a.city?.trim()) return { ok: false, error: "Name, address and city are required." };
  if (!/^\d{6}$/.test(a.pincode)) return { ok: false, error: "Enter a 6-digit pincode." };
  const addr = await db.address.create({
    data: {
      userId: u.id, label: a.label || "Home", name: a.name.trim(), line1: a.line1.trim(), line2: a.line2?.trim() ?? "",
      landmark: a.landmark?.trim() ?? "", city: a.city.trim(), state: a.state?.trim() ?? "", pincode: a.pincode,
    },
  });
  const pin = await db.pincode.findUnique({ where: { code: a.pincode } });
  revalidatePath("/account");
  return { ok: true, id: addr.id, fresh: !!pin?.active };
}

// ───────────────────────── Checkout ─────────────────────────

type Line = { variantId: string; qty: number };

async function priceCart(lines: Line[], pincode: string | null, couponCode?: string) {
  const s = await getSettings();
  const variants = await db.variant.findMany({
    where: { id: { in: lines.map((l) => l.variantId) } },
    include: { product: true },
  });
  const items = lines
    .map((l) => {
      const v = variants.find((x) => x.id === l.variantId);
      if (!v || !v.product.active || l.qty < 1) return null;
      return { v, qty: Math.min(20, Math.floor(l.qty)) };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const subtotal = items.reduce((t, i) => t + i.v.price * i.qty, 0);
  const hasFresh = items.some((i) => i.v.product.delivery === "FRESH");
  const pin = pincode ? await db.pincode.findUnique({ where: { code: pincode } }) : null;
  const local = !!pin?.active;
  const fee = local
    ? subtotal >= num(s.freeDeliveryAbove) ? 0 : num(s.deliveryFee)
    : subtotal >= num(s.freeShipAbove) ? 0 : num(s.shipFee);

  let discount = 0;
  let coupon: string | null = null;
  let couponError = "";
  if (couponCode?.trim()) {
    const c = await db.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    if (!c || !c.active) couponError = "That coupon isn't valid.";
    else if (subtotal < c.minOrder) couponError = `Add items worth ₹${c.minOrder - subtotal} more to use ${c.code}.`;
    else {
      discount = c.kind === "PERCENT" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
      coupon = c.code;
    }
  }
  return { items, subtotal, fee, discount, coupon, couponError, total: subtotal + fee - discount, hasFresh, local, pin };
}

export async function quoteCart(lines: Line[], pincode: string | null, coupon?: string) {
  const q = await priceCart(lines, pincode, coupon);
  return { subtotal: q.subtotal, fee: q.fee, discount: q.discount, coupon: q.coupon, couponError: q.couponError, total: q.total, local: q.local, hasFresh: q.hasFresh };
}

export type PlaceOrderResult = Result<{
  number: string;
  demo?: boolean;
  razorpay?: { key: string; orderId: string; amount: number; name: string; phone: string };
}>;

export async function placeOrder(input: { lines: Line[]; addressId: string; payment: "RAZORPAY" | "COD" | "WALLET"; coupon?: string; note?: string }): Promise<PlaceOrderResult> {
  const u = await mustUser();
  const address = await db.address.findFirst({ where: { id: input.addressId, userId: u.id } });
  if (!address) return { ok: false, error: "Choose a delivery address." };
  const q = await priceCart(input.lines, address.pincode, input.coupon);
  if (q.items.length === 0) return { ok: false, error: "Your cart is empty." };
  if (q.hasFresh && !q.local) return { ok: false, error: "Fresh milk, dahi, lassi and kheer only deliver in Chandigarh, Mohali, Panchkula and Zirakpur. Remove them or choose a Tricity address." };
  for (const i of q.items) if (i.v.stock < i.qty) return { ok: false, error: `${i.v.product.name} (${i.v.label}) has only ${i.v.stock} left.` };

  const s = await getSettings();
  const deliverOn = q.local ? firstEditableDate(num(s.cutoffHour)) : null;
  const now = istNow();
  const number = "GG" + now.date.replaceAll("-", "").slice(2) + String(randomInt(100, 1000)) + String(Date.now()).slice(-3);

  if (input.payment === "WALLET" && u.wallet < q.total) return { ok: false, error: "Your wallet balance is too low for this order." };

  const order = await db.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        number, userId: u.id, payment: input.payment, paymentStatus: "PENDING",
        subtotal: q.subtotal, deliveryFee: q.fee, discount: q.discount, total: q.total, coupon: q.coupon,
        address: JSON.stringify(address), deliverOn,
        slot: deliverOn ? `${deliverOn === addDays(now.date, 1) ? "Tomorrow" : deliverOn} · 6–8 AM` : "Courier · 3–6 days",
        note: input.note?.slice(0, 300) ?? "",
        items: { create: q.items.map((i) => ({ variantId: i.v.id, name: i.v.product.name, label: i.v.label, price: i.v.price, qty: i.qty })) },
      },
    });
    for (const i of q.items) await tx.variant.update({ where: { id: i.v.id }, data: { stock: { decrement: i.qty } } });
    if (q.coupon) await tx.coupon.update({ where: { code: q.coupon }, data: { uses: { increment: 1 } } });
    if (input.payment === "WALLET") {
      await walletEntry(tx, u.id, -q.total, "DEBIT", `Order ${number}`);
      await tx.order.update({ where: { id: o.id }, data: { paymentStatus: "PAID", status: "CONFIRMED" } });
    }
    if (input.payment === "COD") await tx.order.update({ where: { id: o.id }, data: { status: "CONFIRMED" } });
    return o;
  });

  if (input.payment !== "RAZORPAY") return { ok: true, number: order.number };

  if (!razorpayEnabled()) {
    await db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPay: "demo_" + Date.now() } });
    return { ok: true, number: order.number, demo: true };
  }
  const rzp = await createRazorpayOrder(q.total, order.number);
  await db.order.update({ where: { id: order.id }, data: { razorpayOrder: rzp.id } });
  return { ok: true, number: order.number, razorpay: { key: razorpayKeyId(), orderId: rzp.id, amount: rzp.amount, name: u.name, phone: u.phone } };
}

export async function confirmOrderPayment(number: string, orderId: string, paymentId: string, signature: string): Promise<Result> {
  const u = await mustUser();
  const order = await db.order.findFirst({ where: { number, userId: u.id } });
  if (!order || order.razorpayOrder !== orderId) return { ok: false, error: "Order not found." };
  if (!verifyRazorpaySignature(orderId, paymentId, signature)) return { ok: false, error: "Payment could not be verified." };
  await db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPay: paymentId } });
  return { ok: true };
}

// ───────────────────────── Subscriptions ─────────────────────────

export async function createSubscription(input: {
  variantId: string; pattern: "DAILY" | "ALTERNATE" | "CUSTOM"; qty: number; weekQty: number[]; startDate: string; slot: string; addressId: string;
}): Promise<Result<{ id: string }>> {
  const u = await mustUser();
  const s = await getSettings();
  const v = await db.variant.findUnique({ where: { id: input.variantId }, include: { product: true } });
  if (!v || !v.product.subscribable) return { ok: false, error: "This product can't be subscribed to." };
  const address = await db.address.findFirst({ where: { id: input.addressId, userId: u.id } });
  if (!address) return { ok: false, error: "Choose a delivery address." };
  const pin = await db.pincode.findUnique({ where: { code: address.pincode } });
  if (!pin?.active) return { ok: false, error: "Daily delivery is only available in Chandigarh, Mohali, Panchkula and Zirakpur for now." };
  const earliest = firstEditableDate(num(s.cutoffHour));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate) || input.startDate < earliest) return { ok: false, error: `The earliest start date is ${earliest}.` };
  const week = input.weekQty.slice(0, 7).map((n) => Math.max(0, Math.min(10, Math.floor(n || 0))));
  if (input.pattern === "CUSTOM" && week.every((n) => n === 0)) return { ok: false, error: "Pick at least one day." };
  const qty = Math.max(1, Math.min(10, Math.floor(input.qty)));

  const sub = await db.subscription.create({
    data: {
      userId: u.id, variantId: v.id, addressId: address.id, pattern: input.pattern, qty,
      weekQty: JSON.stringify(week), startDate: input.startDate, slot: input.slot === "5–7 AM" ? "5–7 AM" : "6–8 AM",
    },
  });
  revalidatePath("/account");
  return { ok: true, id: sub.id };
}

async function ownSub(id: string) {
  const u = await mustUser();
  const sub = await db.subscription.findFirst({ where: { id, userId: u.id } });
  if (!sub) throw new Error("Subscription not found.");
  return sub;
}

export async function setDayQty(subscriptionId: string, date: string, qty: number): Promise<Result> {
  const sub = await ownSub(subscriptionId);
  const s = await getSettings();
  if (!isEditable(date, num(s.cutoffHour))) return { ok: false, error: "This day is locked. Changes close at the nightly cut-off." };
  qty = Math.max(0, Math.min(10, Math.floor(qty)));
  if (qty === planQty(sub, date)) await db.dayOverride.deleteMany({ where: { subscriptionId, date } });
  else await db.dayOverride.upsert({ where: { subscriptionId_date: { subscriptionId, date } }, create: { subscriptionId, date, qty }, update: { qty } });
  revalidatePath("/account");
  return { ok: true };
}

export async function pauseSubscription(subscriptionId: string, from: string, to: string | null): Promise<Result> {
  await ownSub(subscriptionId);
  const s = await getSettings();
  const earliest = firstEditableDate(num(s.cutoffHour));
  if (from < earliest) return { ok: false, error: `Pauses can start from ${earliest}.` };
  if (to && to < from) return { ok: false, error: "The end date is before the start date." };
  await db.subscription.update({ where: { id: subscriptionId }, data: { pauseFrom: from, pauseTo: to, status: to ? "ACTIVE" : "PAUSED" } });
  revalidatePath("/account");
  return { ok: true };
}

export async function resumeSubscription(subscriptionId: string): Promise<Result> {
  await ownSub(subscriptionId);
  await db.subscription.update({ where: { id: subscriptionId }, data: { status: "ACTIVE", pauseFrom: null, pauseTo: null } });
  revalidatePath("/account");
  return { ok: true };
}

export async function cancelSubscription(subscriptionId: string): Promise<Result> {
  await ownSub(subscriptionId);
  await db.subscription.update({ where: { id: subscriptionId }, data: { status: "CANCELLED" } });
  revalidatePath("/account");
  return { ok: true };
}

export async function updatePlan(subscriptionId: string, pattern: "DAILY" | "ALTERNATE" | "CUSTOM", qty: number, weekQty: number[]): Promise<Result> {
  await ownSub(subscriptionId);
  const week = weekQty.slice(0, 7).map((n) => Math.max(0, Math.min(10, Math.floor(n || 0))));
  if (pattern === "CUSTOM" && week.every((n) => n === 0)) return { ok: false, error: "Pick at least one day." };
  await db.subscription.update({ where: { id: subscriptionId }, data: { pattern, qty: Math.max(1, Math.min(10, Math.floor(qty))), weekQty: JSON.stringify(week) } });
  revalidatePath("/account");
  return { ok: true };
}

// ───────────────────────── Wallet ─────────────────────────

export async function startTopUp(amount: number): Promise<Result<{ demo?: boolean; razorpay?: { key: string; orderId: string; amount: number; name: string; phone: string } }>> {
  const u = await mustUser();
  amount = Math.floor(amount);
  if (amount < 100 || amount > 20000) return { ok: false, error: "Top up between ₹100 and ₹20,000." };
  if (!razorpayEnabled()) {
    await walletEntry(db, u.id, amount, "TOPUP", "Wallet top-up (demo payment)");
    revalidatePath("/account");
    return { ok: true, demo: true };
  }
  const rzp = await createRazorpayOrder(amount, `topup_${u.id.slice(-8)}_${Date.now()}`);
  return { ok: true, razorpay: { key: razorpayKeyId(), orderId: rzp.id, amount: rzp.amount, name: u.name, phone: u.phone } };
}

export async function confirmTopUp(orderId: string, paymentId: string, signature: string): Promise<Result> {
  const u = await mustUser();
  if (!verifyRazorpaySignature(orderId, paymentId, signature)) return { ok: false, error: "Payment could not be verified." };
  const already = await db.walletTxn.findFirst({ where: { userId: u.id, note: { contains: paymentId } } });
  if (already) return { ok: true };
  const o = await fetchRazorpayOrder(orderId);
  if (!o.receipt.includes(u.id.slice(-8))) return { ok: false, error: "This payment belongs to another account." };
  await walletEntry(db, u.id, Math.round((o.amount_paid || o.amount) / 100), "TOPUP", `UPI/Card top-up · ${paymentId}`);
  revalidatePath("/account");
  return { ok: true };
}
