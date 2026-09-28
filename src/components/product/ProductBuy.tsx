"use client";

import Link from "next/link";
import { useState } from "react";
import { Play, MapPin } from "lucide-react";
import { Sunrise, Truck, Bottle, Shield, Calendar } from "../folk/icons";
import type { CardProduct } from "@/lib/catalog";
import { cx, pct, rupees } from "@/lib/format";
import ProductVisual from "../ProductVisual";
import AutoVideo from "../AutoVideo";
import AddButton from "../cart/AddButton";
import { useCart } from "../cart/CartProvider";

type Media = { kind: "pack" } | { kind: "img"; src: string } | { kind: "video"; src: string; poster: string };

export default function ProductBuy({ p, tint, gallery, video }: { p: CardProduct; tint: string; gallery: string[]; video: string | null }) {
  const [vi, setVi] = useState(p.variants.length > 1 ? 1 : 0);
  const [mi, setMi] = useState(0);
  const { pin, setPinOpen } = useCart();
  const v = p.variants[vi];
  const off = pct(v.price, v.mrp);

  const media: Media[] = [{ kind: "pack" }, ...(video ? [{ kind: "video" as const, src: video, poster: video.startsWith("/videos/") ? video.replace(/\.mp4$/, ".jpg") : "" }] : []), ...gallery.map((src) => ({ kind: "img" as const, src }))];
  const m = media[mi] ?? media[0];

  const fresh = p.delivery === "FRESH";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14 *:min-w-0">
      {/* Gallery */}
      <div className="lg:sticky lg:top-[132px] lg:mx-auto lg:w-[calc(min(620px,calc(100svh-230px))*0.8)] lg:max-w-full lg:self-start">
        <div className="arch relative mx-auto aspect-[1/1.02] max-h-[62vh] overflow-hidden sm:aspect-[4/5] sm:max-h-none" style={{ background: tint }}>
          {m.kind === "pack" && (
            <div className="absolute inset-0 p-8 pt-12 sm:p-16">
              <ProductVisual pack={p.pack} liquid={p.liquid} label={p.label} labelTitle={p.labelTitle} sub={v.label} image={p.image} name={p.name} />
            </div>
          )}
          {m.kind === "img" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.src} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
          )}
          {m.kind === "video" && <AutoVideo src={m.src} poster={m.poster || undefined} label={`${p.name} being made`} />}
          {p.badge && <span className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-tulsi">{p.badge}</span>}
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:mt-4 sm:gap-2.5 sm:px-0">
          {media.map((x, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMi(i)}
              aria-label={`Show image ${i + 1}`}
              className={cx("relative h-16 w-13 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-16", i === mi ? "border-ink" : "border-transparent opacity-80 hover:opacity-100")}
              style={{ background: tint }}
            >
              {x.kind === "pack" && <div className="h-full w-full p-1.5"><ProductVisual pack={p.pack} liquid={p.liquid} label={p.label} labelTitle={p.labelTitle} image={p.image} name="" /></div>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {x.kind === "img" && <img src={x.src} alt="" className="h-full w-full object-cover" />}
              {x.kind === "video" && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {x.poster ? <img src={x.poster} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full bg-ink" />}
                  <span className="absolute inset-0 grid place-items-center bg-black/25"><Play size={16} className="fill-white text-white" /></span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Buy box */}
      <div>
        <nav className="text-[13px] text-ink-3" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-ink">Shop</Link> / <Link href={`/shop?c=${p.category.slug}`} className="hover:text-ink">{p.category.name}</Link>
        </nav>
        <p className="mt-3 font-deva text-[19px] text-ghee sm:mt-4 sm:text-[22px]">{p.hindi}</p>
        <h1 className="font-display text-[34px] leading-[1.02] min-[400px]:text-[40px] sm:text-[48px] 2xl:text-[54px]">{p.name}</h1>
        <p className="mt-2 text-[15px] text-ink-2 sm:mt-3 sm:text-[17px]">{p.tagline}</p>
        <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-[14px]">
          <span className="text-ghee">{"★★★★★".slice(0, Math.round(p.rating))}</span>
          <b>{p.rating.toFixed(1)}</b>
          <span className="text-ink-3 underline-offset-4 hover:underline">{p.ratingCount.toLocaleString("en-IN")} reviews</span>
        </a>

        <div className="mt-7">
          <span className="eyebrow">Choose size</span>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {p.variants.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setVi(i)}
                className={cx("rounded-2xl border-[1.5px] p-3 text-left transition", i === vi ? "border-ink bg-malai" : "border-line hover:border-ink/30")}
              >
                <b className="block text-[15px] font-semibold">{x.label}</b>
                <span className="text-[14px] tabular-nums">{rupees(x.price)}</span>
                {x.mrp > x.price && <span className="ml-1.5 text-[12px] text-ink-3 line-through tabular-nums">{rupees(x.mrp)}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4 border-y border-line py-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[40px] leading-none tabular-nums">{rupees(v.price)}</span>
              {v.mrp > v.price && <span className="text-[15px] text-ink-3 line-through tabular-nums">{rupees(v.mrp)}</span>}
              {off > 0 && <span className="rounded-full bg-ghee-soft px-2 py-0.5 text-[12px] font-bold text-ghee-deep">{off}% off</span>}
            </div>
            <span className="text-[12px] text-ink-3">Inclusive of all taxes</span>
          </div>
          <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
            <AddButton
              size="lg"
              className="w-full sm:w-auto"
              item={{ variantId: v.id, slug: p.slug, name: p.name, label: v.label, price: v.price, mrp: v.mrp, pack: p.pack, liquid: p.liquid, labelColor: p.label, labelTitle: p.labelTitle, image: p.image, delivery: p.delivery }}
            />
          </div>
        </div>

        {p.subscribable && (
          <Link href={`/subscribe?product=${p.slug}&variant=${v.id}`} className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-tulsi-soft p-4 transition hover:bg-[#dde9d6]">
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-tulsi"><Calendar size={19} /></span>
              <span>
                <b className="block text-[15px] text-tulsi-deep">Get it every morning</b>
                <span className="text-[13px] text-ink-2">Subscribe and pay {rupees(v.subPrice ?? v.price)} per {v.label}. Skip or pause any day.</span>
              </span>
            </span>
            <span className="text-[14px] font-semibold text-tulsi">Subscribe →</span>
          </Link>
        )}

        <ul className="mt-6 space-y-3 text-[14px]">
          <li className="flex items-start gap-3">
            {fresh ? <Sunrise size={18} className="mt-0.5 text-ghee" /> : <Truck size={18} className="mt-0.5 text-tulsi" />}
            <span>
              {fresh ? (
                <><b>Morning delivery, 6–8 AM.</b> Chandigarh, Mohali, Panchkula and Zirakpur only. Order before 10 PM for tomorrow.</>
              ) : (
                <><b>Ships across India</b> in 3–6 days. Next-morning delivery in the Tricity.</>
              )}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 text-ink-3" />
            <span>
              {pin ? (
                <>Delivering to <b>{pin.code}</b>{pin.city && `, ${pin.city}`}: {fresh ? (pin.fresh ? <span className="text-tulsi">available tomorrow morning</span> : <span className="text-clay">not available here yet</span>) : <span className="text-tulsi">{pin.fresh ? "next morning" : "3–6 days by courier"}</span>}.{" "}</>
              ) : null}
              <button type="button" onClick={() => setPinOpen(true)} className="font-semibold text-ghee-deep underline-offset-4 hover:underline">
                {pin ? "Change pincode" : "Check your pincode"}
              </button>
            </span>
          </li>
          <li className="flex items-start gap-3"><Bottle size={19} className="mt-0.5 text-tulsi" /><span>{p.pack === "kulhad" ? "Served in a clay kulhad." : p.pack === "matka" ? "Set in an unglazed clay matka." : fresh ? "Returnable glass. Leave empties out and we collect them." : "Sealed in glass, packed in moulded paper."}</span></li>
          <li className="flex items-start gap-3"><Shield size={19} className="mt-0.5 text-tulsi" /><span>Every batch lab-tested. <Link href="/lab-reports" className="font-semibold text-ghee-deep hover:underline">See reports</Link></span></li>
        </ul>
      </div>
    </div>
  );
}
