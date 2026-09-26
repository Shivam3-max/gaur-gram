import { addDays, diffDays, istNow, weekday } from "./dates";
import { parseJSON } from "./format";

export type SubLike = {
  pattern: string;
  qty: number;
  weekQty: string;
  startDate: string;
  status: string;
  pauseFrom: string | null;
  pauseTo: string | null;
};

export type OverrideMap = Record<string, number>;

/** What the plan itself says for a date, ignoring pauses and overrides. */
export function planQty(sub: SubLike, date: string) {
  if (date < sub.startDate) return 0;
  if (sub.pattern === "DAILY") return sub.qty;
  if (sub.pattern === "ALTERNATE")
    return diffDays(sub.startDate, date) % 2 === 0 ? sub.qty : 0;
  const week = parseJSON<number[]>(sub.weekQty, [0, 0, 0, 0, 0, 0, 0]);
  return week[weekday(date)] ?? 0;
}

export function isPaused(sub: SubLike, date: string) {
  if (sub.status === "PAUSED" && !sub.pauseFrom) return true;
  if (!sub.pauseFrom) return false;
  return date >= sub.pauseFrom && (!sub.pauseTo || date <= sub.pauseTo);
}

/** Final quantity delivered on a date. */
export function qtyOn(sub: SubLike, date: string, overrides: OverrideMap = {}) {
  if (sub.status === "CANCELLED") return 0;
  if (isPaused(sub, date)) return 0;
  if (date in overrides) return overrides[date];
  return planQty(sub, date);
}

/**
 * Customers can change a date until the nightly cut-off before it.
 * Default cut-off: 10 PM the evening before delivery.
 */
export function isEditable(date: string, cutoffHour = 22) {
  const now = istNow();
  const tomorrow = addDays(now.date, 1);
  if (date > tomorrow) return true;
  if (date === tomorrow) return now.hour < cutoffHour;
  return false;
}

/** The first date a new change can still affect. */
export function firstEditableDate(cutoffHour = 22) {
  const now = istNow();
  return addDays(now.date, now.hour < cutoffHour ? 1 : 2);
}

export function describePattern(sub: Pick<SubLike, "pattern" | "qty" | "weekQty">) {
  if (sub.pattern === "DAILY") return `Every day · ${sub.qty}`;
  if (sub.pattern === "ALTERNATE") return `Alternate days · ${sub.qty}`;
  const w = parseJSON<number[]>(sub.weekQty, []);
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const on = w.map((q, i) => (q > 0 ? `${names[i]}${q > 1 ? "×" + q : ""}` : null)).filter(Boolean);
  return on.length ? on.join(" · ") : "No days selected";
}
