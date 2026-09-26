import { db } from "./db";
import { parseJSON } from "./format";
import type { Prisma } from "@prisma/client";

const LABEL_TITLES: Record<string, string> = {
  "namkeen-chaach": "छाछ",
  "kesar-lassi": "केसर",
  "malai-paneer": "पनीर",
  "white-makhan": "मक्खन",
  "glass-set-dahi": "दही",
  "ghee-gift-box": "घी",
  "sarson-honey": "सरसों",
  "jamun-honey": "जामुन",
  "kachi-ghani-mustard-oil": "सरसों",
  "cold-pressed-groundnut-oil": "मूंगफली",
  "cold-pressed-til-oil": "तिल",
  "cold-pressed-coconut-oil": "नारियल",
  "makhana-kheer": "मखाना",
};

export const labelTitle = (slug: string, categoryHindi: string) =>
  LABEL_TITLES[slug] ?? categoryHindi;

const withRelations = {
  category: true,
  variants: { orderBy: { sort: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof withRelations }>;

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  hindi: string;
  tagline: string;
  delivery: string;
  subscribable: boolean;
  pack: string;
  liquid: string;
  label: string;
  labelTitle: string;
  image: string | null;
  badge: string | null;
  rating: number;
  ratingCount: number;
  category: { slug: string; name: string };
  variants: { id: string; label: string; price: number; mrp: number; subPrice: number | null; stock: number }[];
};

export function toCard(p: ProductRow): CardProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    hindi: p.hindi,
    tagline: p.tagline,
    delivery: p.delivery,
    subscribable: p.subscribable,
    pack: p.pack,
    liquid: p.liquid,
    label: p.label,
    labelTitle: labelTitle(p.slug, p.category.hindi),
    image: p.image,
    badge: p.badge,
    rating: p.rating,
    ratingCount: p.ratingCount,
    category: { slug: p.category.slug, name: p.category.name },
    variants: p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, mrp: v.mrp, subPrice: v.subPrice, stock: v.stock })),
  };
}

export async function getProducts(opts: { category?: string; q?: string; featured?: boolean; delivery?: string } = {}) {
  const where: Prisma.ProductWhereInput = { active: true };
  if (opts.category) where.category = { slug: opts.category };
  if (opts.featured) where.featured = true;
  if (opts.delivery) where.delivery = opts.delivery;
  if (opts.q) {
    where.OR = [
      { name: { contains: opts.q } },
      { tagline: { contains: opts.q } },
      { hindi: { contains: opts.q } },
      { category: { name: { contains: opts.q } } },
    ];
  }
  const rows = await db.product.findMany({ where, include: withRelations, orderBy: { sort: "asc" } });
  return rows.map(toCard);
}

export async function getProduct(slug: string) {
  const p = await db.product.findUnique({
    where: { slug },
    include: {
      ...withRelations,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
      batches: { orderBy: { madeOn: "desc" }, take: 3 },
    },
  });
  if (!p || !p.active) return null;
  return {
    ...p,
    card: toCard(p),
    galleryList: parseJSON<string[]>(p.gallery, []),
    highlightList: parseJSON<string[]>(p.highlights, []),
  };
}

export const getCategories = () => db.category.findMany({ orderBy: { sort: "asc" } });
