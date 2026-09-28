import "server-only";
import { db } from "./db";
import { addDays, today } from "./dates";

const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function reportRange(from?: string, to?: string) {
  const t = today();
  const end = isDate(to) ? to! : t;
  const start = isDate(from) ? from! : addDays(end, -29);
  return start <= end ? { from: start, to: end } : { from: end, to: start };
}

const istStart = (d: string) => new Date(d + "T00:00:00+05:30");
const istEnd = (d: string) => new Date(d + "T23:59:59.999+05:30");
const istDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);

/** Units and revenue per product size, split between one-time orders and subscription deliveries. */
export async function salesByProduct(from: string, to: string) {
  const [items, deliveries] = await Promise.all([
    db.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" }, createdAt: { gte: istStart(from), lte: istEnd(to) } } },
      include: { variant: { include: { product: true } } },
    }),
    db.delivery.findMany({ where: { status: "DELIVERED", date: { gte: from, lte: to } }, include: { variant: { include: { product: true } } } }),
  ]);
  const rows = new Map<string, { product: string; size: string; orderUnits: number; subUnits: number; revenue: number; gstRate: number }>();
  const row = (v: (typeof items)[number]["variant"]) => {
    const r = rows.get(v.id) ?? { product: v.product.name, size: v.label, orderUnits: 0, subUnits: 0, revenue: 0, gstRate: v.product.gstRate };
    rows.set(v.id, r);
    return r;
  };
  for (const i of items) {
    const r = row(i.variant);
    r.orderUnits += i.qty;
    r.revenue += i.qty * i.price;
  }
  for (const d of deliveries) {
    const r = row(d.variant);
    r.subUnits += d.qty;
    r.revenue += d.amount;
  }
  const list = [...rows.values()].sort((a, b) => b.revenue - a.revenue);
  const total = list.reduce((t, r) => t + r.revenue, 0);

  // Daily revenue for the chart: order revenue by order date, subscription revenue by delivery date
  const byDay = await orderRevenueByDay(from, to);
  const days: { date: string; orders: number; subs: number }[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push({ date: d, orders: byDay[d] ?? 0, subs: 0 });
  const index = new Map(days.map((x, i) => [x.date, i]));
  for (const d of deliveries) {
    const i = index.get(d.date);
    if (i !== undefined) days[i].subs += d.amount;
  }
  return { list, total, days };
}

/** Daily order revenue needs order dates, so fetch them separately and cheaply. */
export async function orderRevenueByDay(from: string, to: string) {
  const orders = await db.order.findMany({ where: { status: { not: "CANCELLED" }, createdAt: { gte: istStart(from), lte: istEnd(to) } }, select: { createdAt: true, subtotal: true, discount: true } });
  const out: Record<string, number> = {};
  for (const o of orders) {
    const d = istDate(o.createdAt);
    out[d] = (out[d] ?? 0) + o.subtotal - o.discount;
  }
  return out;
}

/** New, cancelled and active subscriptions for each of the last `months` calendar months. */
export async function subscriberMonths(months = 6) {
  const list = await db.subscription.findMany({ select: { createdAt: true, cancelledAt: true } });
  const t = today();
  const out: { month: string; label: string; start: number; added: number; cancelled: number; end: number; churn: number }[] = [];
  const [y, m] = t.split("-").map(Number);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const next = new Date(Date.UTC(y, m - i, 1));
    const startIst = istStart(d.toISOString().slice(0, 10));
    const endIst = istStart(next.toISOString().slice(0, 10));
    const aliveAt = (at: Date) => list.filter((s) => s.createdAt < at && (!s.cancelledAt || s.cancelledAt >= at)).length;
    const start = aliveAt(startIst);
    const added = list.filter((s) => s.createdAt >= startIst && s.createdAt < endIst).length;
    const cancelled = list.filter((s) => s.cancelledAt && s.cancelledAt >= startIst && s.cancelledAt < endIst).length;
    out.push({
      month: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }),
      start,
      added,
      cancelled,
      end: aliveAt(endIst),
      churn: start ? Math.round((cancelled / start) * 1000) / 10 : 0,
    });
  }
  return out;
}

/** GST register: prices include GST, so taxable value = price ÷ (1 + rate). Rates come from each product. */
export async function gstRegister(from: string, to: string) {
  const [orders, deliveries] = await Promise.all([
    db.order.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: istStart(from), lte: istEnd(to) } },
      include: { user: true, items: { include: { variant: { include: { product: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    db.delivery.findMany({ where: { status: "DELIVERED", date: { gte: from, lte: to } }, include: { user: true, variant: { include: { product: true } } }, orderBy: { date: "asc" } }),
  ]);
  const split = (gross: number, rate: number) => {
    const taxable = Math.round((gross / (1 + rate / 100)) * 100) / 100;
    return { taxable, tax: Math.round((gross - taxable) * 100) / 100 };
  };
  type Line = { date: string; ref: string; customer: string; place: string; product: string; rate: number; gross: number; taxable: number; tax: number };
  const lines: Line[] = [];
  for (const o of orders) {
    const addr = (() => {
      try {
        return JSON.parse(o.address) as { city?: string; state?: string; pincode?: string };
      } catch {
        return {};
      }
    })();
    // Spread any order discount across its lines in proportion to value
    const factor = o.subtotal ? (o.subtotal - o.discount) / o.subtotal : 1;
    for (const i of o.items) {
      const gross = Math.round(i.price * i.qty * factor * 100) / 100;
      const rate = i.variant.product.gstRate;
      lines.push({ date: istDate(o.createdAt), ref: o.number, customer: o.user.name || o.user.phone, place: [addr.city, addr.state, addr.pincode].filter(Boolean).join(", "), product: `${i.name} ${i.label} × ${i.qty}`, rate, gross, ...split(gross, rate) });
    }
    if (o.deliveryFee) lines.push({ date: istDate(o.createdAt), ref: o.number, customer: o.user.name || o.user.phone, place: [addr.city, addr.pincode].filter(Boolean).join(", "), product: "Delivery charge", rate: 18, gross: o.deliveryFee, ...split(o.deliveryFee, 18) });
  }
  for (const d of deliveries) {
    const rate = d.variant.product.gstRate;
    lines.push({ date: d.date, ref: `SUB-${d.date.replaceAll("-", "")}`, customer: d.user.name || d.user.phone, place: "Tricity", product: `${d.variant.product.name} ${d.variant.label} × ${d.qty} (subscription)`, rate, gross: d.amount, ...split(d.amount, rate) });
  }
  const byRate = new Map<number, { rate: number; gross: number; taxable: number; tax: number }>();
  for (const l of lines) {
    const r = byRate.get(l.rate) ?? { rate: l.rate, gross: 0, taxable: 0, tax: 0 };
    r.gross += l.gross;
    r.taxable += l.taxable;
    r.tax += l.tax;
    byRate.set(l.rate, r);
  }
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const summary = [...byRate.values()].sort((a, b) => a.rate - b.rate).map((r) => ({ rate: r.rate, gross: r2(r.gross), taxable: r2(r.taxable), tax: r2(r.tax) }));
  return { lines, summary };
}

export function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replaceAll('"', '""')}"` : String(c))).join(",")).join("\n");
}
