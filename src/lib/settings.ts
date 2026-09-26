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
};

export type Settings = typeof DEFAULT_SETTINGS;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const s = { ...DEFAULT_SETTINGS };
  for (const r of rows) if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  return s;
});

export const num = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;
