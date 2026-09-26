// All delivery dates are plain "YYYY-MM-DD" strings in India Standard Time.

const IST = "Asia/Kolkata";

export function istNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
  };
}

export const today = () => istNow().date;

export function addDays(date: string, n: number) {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function diffDays(a: string, b: string) {
  return Math.round(
    (Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000,
  );
}

/** 0 = Sunday … 6 = Saturday */
export const weekday = (date: string) =>
  new Date(date + "T00:00:00Z").getUTCDay();

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function prettyDate(date: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date + "T00:00:00Z").toLocaleDateString("en-IN", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    ...opts,
  });
}

export function monthDays(year: number, month: number) {
  // month is 1-based
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const days: string[] = [];
  let d = first;
  while (d.slice(0, 7) === first.slice(0, 7)) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}
