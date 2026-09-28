import "server-only";
import { db } from "./db";
import { qtyOn } from "./schedule";
import { getHolidays } from "./holidays";

export type ManifestStop = {
  key: string;
  kind: "SUB" | "ORDER";
  subscriptionId?: string;
  orderId?: string;
  orderNumber?: string;
  userId: string;
  customer: string;
  phone: string;
  wallet: number;
  address: string;
  city: string;
  pincode: string;
  slot: string;
  items: { variantId: string; name: string; label: string; qty: number; amount: number }[];
  delivered: boolean;
};

/** Everything that must leave the goshala on a date: subscription drops plus one-time Tricity orders. */
export async function buildManifest(date: string) {
  const holidays = await getHolidays();
  const holiday = holidays.list.find((h) => h.date === date) ?? null;
  const [subs, orders, done] = await Promise.all([
    db.subscription.findMany({
      where: { status: { not: "CANCELLED" }, startDate: { lte: date } },
      include: { user: true, address: true, variant: { include: { product: true } }, overrides: { where: { date } } },
    }),
    db.order.findMany({ where: { deliverOn: date, status: { not: "CANCELLED" } }, include: { user: true, items: { include: { variant: { include: { product: true } } } } } }),
    db.delivery.findMany({ where: { date } }),
  ]);
  const doneSubs = new Set(done.map((d) => d.subscriptionId));

  const stops: ManifestStop[] = [];
  for (const s of subs) {
    const q = qtyOn(s, date, Object.fromEntries(s.overrides.map((o) => [o.date, o.qty])), holidays.set);
    if (q <= 0) continue;
    const unit = s.variant.subPrice ?? s.variant.price;
    stops.push({
      key: "s" + s.id, kind: "SUB", subscriptionId: s.id, userId: s.userId, customer: s.user.name || "Customer", phone: s.user.phone, wallet: s.user.wallet,
      address: `${s.address.line1}${s.address.line2 ? ", " + s.address.line2 : ""}${s.address.landmark ? " (" + s.address.landmark + ")" : ""}`,
      city: s.address.city, pincode: s.address.pincode, slot: s.slot,
      items: [{ variantId: s.variantId, name: s.variant.product.name, label: s.variant.label, qty: q, amount: q * unit }],
      delivered: doneSubs.has(s.id),
    });
  }
  for (const o of orders) {
    const a = JSON.parse(o.address) as { line1: string; line2?: string; city: string; pincode: string };
    stops.push({
      key: "o" + o.id, kind: "ORDER", orderId: o.id, orderNumber: o.number, userId: o.userId, customer: o.user.name || "Customer", phone: o.user.phone, wallet: o.user.wallet,
      address: `${a.line1}${a.line2 ? ", " + a.line2 : ""}`, city: a.city, pincode: a.pincode, slot: "6–8 AM",
      items: o.items.map((i) => ({ variantId: i.variantId, name: i.name, label: i.label, qty: i.qty, amount: i.qty * i.price })),
      delivered: o.status === "DELIVERED",
    });
  }
  stops.sort((a, b) => a.city.localeCompare(b.city) || a.pincode.localeCompare(b.pincode) || a.slot.localeCompare(b.slot));

  const totals = new Map<string, { name: string; label: string; qty: number }>();
  for (const st of stops)
    for (const i of st.items) {
      const t = totals.get(i.variantId) ?? { name: i.name, label: i.label, qty: 0 };
      t.qty += i.qty;
      totals.set(i.variantId, t);
    }

  return { stops, totals: [...totals.values()].sort((a, b) => b.qty - a.qty), holiday };
}

/** Converts "500 ml" / "1 L" labels into litres so the goshala knows how much milk to keep aside. */
export function litres(label: string, qty: number) {
  const m = label.match(/([\d.]+)\s*(ml|l)\b/i);
  if (!m) return 0;
  const n = Number(m[1]);
  return (m[2].toLowerCase() === "ml" ? n / 1000 : n) * qty;
}
