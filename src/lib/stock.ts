import "server-only";
import { db } from "./db";
import { getSettings, num } from "./settings";

const DAY = 86400000;

/** Low-stock variants and batches that are expired or expiring soon, for alerts across admin. */
export async function stockAlerts() {
  const s = await getSettings();
  const threshold = num(s.lowStockAt) || 15;
  const [variants, batches] = await Promise.all([
    db.variant.findMany({ where: { stock: { lte: threshold }, product: { active: true } }, include: { product: true }, orderBy: { stock: "asc" } }),
    db.batch.findMany({ where: { expiresOn: { not: null, lte: new Date(Date.now() + 30 * DAY) } }, include: { product: true }, orderBy: { expiresOn: "asc" } }),
  ]);
  const now = Date.now();
  return {
    threshold,
    low: variants,
    expired: batches.filter((b) => b.expiresOn!.getTime() < now),
    expiring: batches.filter((b) => b.expiresOn!.getTime() >= now),
  };
}

export const daysLeft = (d: Date) => Math.ceil((d.getTime() - Date.now()) / DAY);
