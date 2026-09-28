"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { Sunrise, Truck } from "./folk/icons";
import type { CardProduct } from "@/lib/catalog";
import { cx, pct, rupees } from "@/lib/format";
import ProductVisual from "./ProductVisual";
import AddButton from "./cart/AddButton";

export default function ProductCard({ p, tint, className }: { p: CardProduct; tint?: string; className?: string }) {
  const [vi, setVi] = useState(0);
  const v = p.variants[vi] ?? p.variants[0];
  if (!v) return null;
  const off = pct(v.price, v.mrp);

  return (
    <article className={cx("group relative flex flex-col rounded-[20px] border border-line bg-white p-2.5 transition hover:border-ink/15 hover:shadow-[0_18px_40px_-24px_rgba(60,40,10,.35)]", className)}>
      <Link href={`/product/${p.slug}`} className="relative block overflow-hidden rounded-2xl" style={{ background: tint ?? "var(--malai)" }}>
        <div className="aspect-square px-6 pb-3 pt-8 transition duration-500 group-hover:scale-[1.04]">
          <ProductVisual pack={p.pack} liquid={p.liquid} label={p.label} labelTitle={p.labelTitle} sub={v.label} image={p.image} name={p.name} />
        </div>
        {p.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-tulsi">
            {p.badge}
          </span>
        )}
        {off > 0 && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-ghee px-2 py-1 text-[10.5px] font-bold text-white">{off}% OFF</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-1 pb-1 pt-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
          {p.delivery === "FRESH" ? <Sunrise size={14} className="text-ghee" /> : <Truck size={14} className="text-tulsi" />}
          {p.delivery === "FRESH" ? "Tomorrow 6–8 AM · Tricity" : "Ships across India"}
        </span>
        <Link href={`/product/${p.slug}`} className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink hover:text-ghee-deep">
          {p.name}
        </Link>
        <span className="flex items-center gap-1 text-[12px] text-ink-3">
          <Star size={12} className="fill-ghee text-ghee" />
          <b className="font-semibold text-ink-2">{p.rating.toFixed(1)}</b>
          <span>({p.ratingCount.toLocaleString("en-IN")})</span>
        </span>

        {p.variants.length > 1 ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {p.variants.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setVi(i)}
                className={cx(
                  "rounded-md border px-2 py-0.5 text-[11.5px] font-medium transition",
                  i === vi ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:border-ink/40",
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="mt-1 text-[12px] text-ink-3">{v.label}</span>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-2 pt-3">
          <div className="leading-tight">
            <div className="text-[16px] font-bold tabular-nums">{rupees(v.price)}</div>
            {v.mrp > v.price && <div className="text-[12px] text-ink-3 line-through tabular-nums">{rupees(v.mrp)}</div>}
          </div>
          <AddButton
            item={{
              variantId: v.id, slug: p.slug, name: p.name, label: v.label, price: v.price, mrp: v.mrp,
              pack: p.pack, liquid: p.liquid, labelColor: p.label, labelTitle: p.labelTitle, image: p.image, delivery: p.delivery,
            }}
          />
        </div>
        {p.subscribable && (
          <Link href={`/subscribe?product=${p.slug}`} className="mt-1 text-[12px] font-semibold text-ghee-deep hover:underline">
            Subscribe{v.subPrice ? ` & pay ${rupees(v.subPrice)}` : ""} →
          </Link>
        )}
      </div>
    </article>
  );
}
