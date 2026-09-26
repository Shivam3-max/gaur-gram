export const rupees = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const pct = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

export const ORDER_STATUS: Record<string, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
