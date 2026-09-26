import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star, FlaskConical, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { getProduct, getProducts } from "@/lib/catalog";
import { parseJSON } from "@/lib/format";
import ProductBuy from "@/components/product/ProductBuy";
import ProductCard from "@/components/ProductCard";
import MakingShowcase, { type Story } from "@/components/home/MakingShowcase";
import Folk from "@/components/folk/Folk";
import { SCENE_FOR } from "@/components/folk/forCategory";
import { SCENES } from "@/components/folk/scenes";

type Params = Promise<{ slug: string }>;

const STORY_FOR: Record<string, string> = { ghee: "ghee", milk: "milk", dahi: "dahi", lassi: "dahi", kheer: "milk", "makhan-paneer": "ghee", honey: "honey", oils: "oils" };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: p.name, description: `${p.tagline}. ${p.description.slice(0, 140)}` };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();

  const [storyRow, related] = await Promise.all([
    db.makingStory.findUnique({ where: { key: STORY_FOR[p.category.slug] ?? "milk" } }),
    getProducts({ category: p.category.slug }),
  ]);
  const others = related.filter((x) => x.slug !== p.slug);
  const more = others.length < 4 ? [...others, ...(await getProducts({ featured: true })).filter((x) => x.slug !== p.slug && !others.some((o) => o.slug === x.slug))].slice(0, 4) : others.slice(0, 4);
  const story: Story | null = storyRow ? { ...storyRow, steps: parseJSON(storyRow.steps, []) } : null;
  const scene = SCENE_FOR[p.category.slug] ?? "carry";
  const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : p.rating;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: "Gaurgram" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.ratingCount },
    offers: p.variants.map((v) => ({ "@type": "Offer", priceCurrency: "INR", price: v.price, name: v.label, availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-x pt-8">
        <ProductBuy p={p.card} tint={p.category.tint} gallery={p.galleryList} video={p.video} />
      </div>

      {/* Story + details */}
      <section className="container-x pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 *:min-w-0">
          <div>
            <span className="eyebrow">About this {p.category.name.toLowerCase()}</span>
            <p className="mt-3 font-display text-[28px] leading-snug sm:text-[34px]">{p.description}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {p.highlightList.map((h) => (
                <li key={h} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-[14.5px] font-medium">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-ghee" /> {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="self-start">
          <div className="mb-4 flex items-end justify-between gap-4 overflow-hidden rounded-[24px] border border-line bg-white px-6 pt-5">
            <div className="pb-5">
              <span className="eyebrow">How it’s made</span>
              <p className="mt-1.5 font-deva text-[20px] text-ghee">{SCENES[scene].hindi}</p>
              <p className="text-[15px] font-medium">{SCENES[scene].label}</p>
              {story && <a href="#how-its-made" className="mt-2 inline-block text-[13.5px] font-semibold text-ghee-deep hover:underline">Watch the film ↓</a>}
            </div>
            <Folk scene={scene} h="h-[130px] sm:h-[150px]" className="-mr-2 shrink-0" />
          </div>
          <dl className="divide-y divide-line rounded-[24px] border border-line bg-white">
            {[
              ["Ingredients", p.ingredients],
              ["Shelf life", p.shelfLife],
              ["Storage", p.storage],
              ["Packaging", p.pack === "kulhad" ? "Clay kulhad" : p.pack === "matka" ? "Clay matka with muslin cover" : "Glass"],
              ["Delivery", p.delivery === "FRESH" ? "Tricity only · 6–8 AM" : "All India · 3–6 days"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[130px_1fr] gap-4 px-6 py-4 text-[14.5px]">
                <dt className="text-ink-3">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          </div>
        </div>
      </section>

      {story && (
        <section id="how-its-made" className="khadi mt-20 scroll-mt-32 py-16">
          <div className="container-x">
            <span className="eyebrow">How we make it</span>
            <h2 className="mb-6 mt-2 font-display text-[36px] leading-tight sm:text-[44px]">From our goshala, step by step</h2>
            <MakingShowcase stories={[story]} compact />
          </div>
        </section>
      )}

      {p.batches.length > 0 && (
        <section className="container-x pt-16">
          <div className="flex items-center gap-2"><FlaskConical size={16} className="text-tulsi" /><span className="eyebrow">Recent batches</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {p.batches.map((b) => (
              <Link key={b.id} href={`/trace/${b.code}`} className="group rounded-2xl border border-line bg-white p-5 transition hover:border-ink/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12.5px] tracking-wider text-ink-3">{b.code}</span>
                  <ArrowUpRight size={16} className="text-ink-3 group-hover:text-ink" />
                </div>
                <p className="mt-2 text-[15px] font-semibold">Made {b.madeOn.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>
                <p className="text-[13px] text-tulsi">Lab result: {b.result}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="reviews" className="container-x scroll-mt-40 pt-20">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] *:min-w-0">
          <div>
            <span className="eyebrow">Reviews</span>
            <p className="mt-2 font-display text-[64px] leading-none">{avg.toFixed(1)}</p>
            <div className="mt-2 flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(avg) ? "fill-ghee text-ghee" : "text-line"} />)}</div>
            <p className="mt-2 text-[14px] text-ink-3">{p.ratingCount.toLocaleString("en-IN")} ratings from verified buyers</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {p.reviews.length === 0 && <p className="text-ink-3">Written reviews will appear here after moderation.</p>}
            {p.reviews.map((r) => (
              <figure key={r.id} className="rounded-[22px] border border-line bg-white p-6">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < r.rating ? "fill-ghee text-ghee" : "text-line"} />)}</div>
                <blockquote className="mt-3 text-[16px] leading-relaxed">“{r.body}”</blockquote>
                <figcaption className="mt-3 text-[13px]"><b>{r.name}</b> <span className="text-ink-3">· {r.city} · Verified buyer</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="container-x pt-20">
          <h2 className="mb-6 font-display text-[36px]">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {more.map((x) => <ProductCard key={x.id} p={x} />)}
          </div>
        </section>
      )}
    </>
  );
}
