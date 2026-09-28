import { cache } from "react";
import { db } from "./db";

export const DEFAULT_SETTINGS = {
  announcement: "Fresh milk, dahi & lassi across Chandigarh · Mohali · Panchkula · Zirakpur. Ghee, honey & oils ship all over India.",
  heroVideo: "/videos/cow-golden-grass.mp4",
  heroPoster: "/videos/cow-golden-grass.jpg",
  cutoffHour: "22",
  deliveryFee: "30",
  freeDeliveryAbove: "499",
  shipFee: "79",
  freeShipAbove: "999",
  bottleDeposit: "50",
  fssai: "10025021000XXX",
  whatsapp: "+91 98XXX XXXXX",
  email: "hello@gaurgram.in",
  address: "Gaurgram Goshala, Mohali district, Punjab",
  cows: "46",
  litresPerDay: "212",
  families: "1,800+",
  kmToCity: "28",
  /** none | diwali | holi | lohri */
  festival: "none",
  /** Variants at or below this stock show as low in admin */
  lowStockAt: "15",
  /** JSON list of homepage sections in display order, with visibility */
  homeSections: "",
};

export const HOME_SECTIONS = [
  { key: "categories", label: "Shop by category" },
  { key: "bestsellers", label: "Bestsellers" },
  { key: "making", label: "How we make it (films)" },
  { key: "timeline", label: "Goshala to door timeline" },
  { key: "subscribe", label: "Daily subscription planner" },
  { key: "glass", label: "Glass & clay promise" },
  { key: "ships", label: "Ships across India" },
  { key: "numbers", label: "Farm numbers over video" },
  { key: "reviews", label: "Customer reviews" },
  { key: "trace", label: "Trace your jar" },
  { key: "gallery", label: "Life at the goshala" },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];

/** Homepage sections in the admin's chosen order; new sections are appended as visible. */
export function homeSectionOrder(raw: string): { key: HomeSectionKey; visible: boolean }[] {
  let saved: { key: string; visible: boolean }[] = [];
  try {
    saved = raw ? JSON.parse(raw) : [];
  } catch {}
  const known = new Set<string>(HOME_SECTIONS.map((x) => x.key));
  const out = saved.filter((x) => known.has(x.key)).map((x) => ({ key: x.key as HomeSectionKey, visible: x.visible !== false }));
  for (const x of HOME_SECTIONS) if (!out.some((o) => o.key === x.key)) out.push({ key: x.key, visible: true });
  return out;
}

export type Settings = typeof DEFAULT_SETTINGS;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const s = { ...DEFAULT_SETTINGS };
  for (const r of rows) if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  return s;
});

export const num = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;
