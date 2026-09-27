import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE = process.env.SITE_URL ?? "http://localhost:3740";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { active: true }, select: { slug: true, createdAt: true } }),
    db.category.findMany({ select: { slug: true } }),
  ]);
  const pages = ["", "/shop", "/subscribe", "/making", "/goshala", "/lab-reports", "/delivery"];
  return [
    ...pages.map((p) => ({ url: BASE + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...categories.map((c) => ({ url: `${BASE}/shop?c=${c.slug}`, priority: 0.7 })),
    ...products.map((p) => ({ url: `${BASE}/product/${p.slug}`, lastModified: p.createdAt, priority: 0.9 })),
  ];
}
