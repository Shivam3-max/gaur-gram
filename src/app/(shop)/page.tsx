import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Star, Recycle, FlaskConical, Sunrise, Truck, Milk, HandHeart, Leaf } from "lucide-react";
import { db } from "@/lib/db";
import { getCategories, getProducts, labelTitle } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { parseJSON } from "@/lib/format";
import PackShot from "@/components/PackShot";
import ProductCard from "@/components/ProductCard";
import ProductRail from "@/components/ProductRail";
import AutoVideo from "@/components/AutoVideo";
import Reveal from "@/components/Reveal";
import Floaters from "@/components/Floaters";
import MakingShowcase, { type Story } from "@/components/home/MakingShowcase";
import MiniPlanner from "@/components/home/MiniPlanner";
import TraceBox from "@/components/home/TraceBox";
import Folk, { Frieze } from "@/components/folk/Folk";
import RideStrip from "@/components/folk/RideStrip";
import type { SceneKey } from "@/components/folk/scenes";

export const dynamic = "force-dynamic";

function SectionHead({ eyebrow, title, hindi, children, action, art }: { eyebrow: string; title: React.ReactNode; hindi?: string; children?: React.ReactNode; action?: React.ReactNode; art?: SceneKey }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-4">
      <div className="max-w-2xl">
        {/* On phones the illustration shares the eyebrow row instead of taking its own block */}
        <div className="flex items-end justify-between gap-3">
          <span className="eyebrow">{eyebrow}</span>
          {art && <Folk scene={art} h="h-[58px]" className="-mb-1 shrink-0 md:hidden" />}
        </div>
        <h2 className="mt-2 font-display text-[32px] leading-[1.05] tracking-[-0.01em] min-[400px]:text-[36px] sm:text-[42px] 2xl:text-[48px]">{title}</h2>
        {hindi && <p className="mt-1 font-deva text-[18px] text-ghee sm:text-[20px]">{hindi}</p>}
        {children && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2 sm:text-[16px]">{children}</p>}
      </div>
      {(art || action) && (
        <div className="flex items-end gap-8">
          {art && <Folk scene={art} label h="h-[112px]" className="hidden shrink-0 md:flex" />}
          {action}
        </div>
      )}
    </div>
  );
}

export default async function Home() {
  const [s, categories, featured, shipped, storiesRaw, reviews, batch, milkOpts] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({ featured: true }),
    getProducts({ delivery: "SHIP" }),
    db.makingStory.findMany({ where: { active: true }, orderBy: { sort: "asc" } }),
    db.review.findMany({ where: { approved: true, featured: true }, include: { product: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.batch.findFirst({ orderBy: { madeOn: "desc" }, include: { product: { select: { name: true } } } }),
    db.product.findMany({ where: { subscribable: true, active: true }, include: { variants: { orderBy: { sort: "asc" } }, category: true }, orderBy: { sort: "asc" }, take: 6 }),
  ]);

  const stories: Story[] = storiesRaw.map((x) => ({ ...x, steps: parseJSON(x.steps, []) }));
  const planner = milkOpts.map((p) => {
    const v = p.variants[p.variants.length > 1 ? 1 : 0];
    return { slug: p.slug, name: p.name, pack: p.pack, liquid: p.liquid, label: p.label, labelTitle: labelTitle(p.slug, p.category.hindi), unit: v.label, price: v.subPrice ?? v.price };
  });
  const tint = Object.fromEntries(categories.map((c) => [c.slug, c.tint]));

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="khadi relative overflow-hidden">
        <Floaters
          items={[
            { shape: "drop", className: "left-[47%] top-[58%] h-10 w-8 hidden lg:block", depth: 60 },
            { shape: "tulsi", className: "left-[51%] top-[6%] h-12 w-14 hidden xl:block", depth: 90, rotate: -10 },
            { shape: "wheat", className: "right-[2%] top-[40%] h-28 w-11 hidden md:block", depth: 70, rotate: 14 },
            { shape: "marigold", className: "left-[44%] bottom-[10%] h-10 w-10 hidden lg:block", depth: 110 },
          ]}
        />
        <div className="container-x relative grid items-center gap-8 pb-12 pt-6 sm:gap-10 sm:pb-16 sm:pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-16 lg:pt-8 2xl:pt-14 *:min-w-0">
          <div className="relative z-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-2 sm:text-[12.5px]">
                <span className="h-1.5 w-1.5 rounded-full bg-tulsi" /> Milked at 4:10 AM today · {s.cows} desi cows
              </span>
              <h1 className="mt-4 font-display text-[42px] leading-[0.98] tracking-[-0.02em] min-[400px]:text-[48px] sm:mt-6 sm:text-[64px] lg:mt-5 lg:text-[58px] xl:text-[66px] 2xl:text-[84px]">
                From our goshala
                <br />
                to your <em className="not-italic text-ghee">kitchen.</em>
              </h1>
              <p className="mt-3 font-deva text-[21px] text-ghee-deep sm:mt-4 sm:text-[26px] 2xl:text-[28px]">गौशाला से सीधे आपके घर तक</p>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-2 sm:mt-5 sm:text-[16px] 2xl:text-[17px]">
                Bilona ghee, fresh milk, matka dahi, raw honey and wood-pressed oils. Made by our own hands, packed in glass,
                with no middleman and nothing mixed in.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3 2xl:mt-8">
                <Link href="/shop" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink/85 sm:px-6 sm:text-[15px]">
                  <span className="sm:hidden">Shop now</span>
                  <span className="hidden sm:inline">Shop the harvest</span> <ArrowRight size={17} />
                </Link>
                <Link href="/subscribe" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-tulsi px-4 py-3.5 text-[14px] font-semibold text-tulsi transition hover:bg-tulsi-soft sm:px-6 sm:text-[15px]">
                  <Milk size={17} /> Start daily milk
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-2 sm:mt-7 sm:gap-x-7 sm:gap-y-3 sm:text-[13px] 2xl:mt-9">
                <span className="flex items-center gap-1.5"><Star size={15} className="fill-ghee text-ghee" /><b className="text-ink">4.9</b> from {s.families} families</span>
                <span className="flex items-center gap-1.5"><Recycle size={15} className="text-tulsi" /> Glass &amp; clay only</span>
                <span className="flex items-center gap-1.5"><FlaskConical size={15} className="text-tulsi" /> Every batch lab-tested</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:w-[calc(min(600px,calc(100svh-240px))*0.8)] lg:max-w-full">
            <div className="arch relative aspect-[5/5.4] overflow-hidden bg-malai-2 shadow-[0_40px_80px_-40px_rgba(60,40,10,.5)] sm:aspect-[4/5] lg:aspect-auto lg:h-[min(600px,calc(100svh-240px))]">
              <AutoVideo src={s.heroVideo} poster={s.heroPoster} label="A desi cow grazing at the Gaurgram goshala" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-[12.5px] font-medium backdrop-blur">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tulsi opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-tulsi" /></span>
                Live<span className="hidden sm:inline"> from the goshala</span> · {s.litresPerDay} L milked today
              </div>
            </div>
            <div className="drift absolute -left-6 bottom-[8%] w-[34%] sm:-left-12">
              <PackShot pack="jar" liquid="#e2a93b" title="घी" sub="500 ml" className="h-auto w-full" />
            </div>
            <div className="drift absolute -right-4 top-[24%] w-[24%] sm:-right-10" style={{ animationDelay: "-3s" }}>
              <PackShot pack="bottle" liquid="#fbfaf4" title="दूध" sub="1 L" className="h-auto w-full" />
            </div>
            <div className="absolute -right-2 bottom-[4%] w-[22%] sm:-right-6">
              <PackShot pack="honey" liquid="#c9861b" title="शहद" sub="500 g" className="h-auto w-full" />
            </div>
          </div>
        </div>
        <div className="container-x relative -mt-6 pb-6 lg:-mt-10">
          <Frieze labels className="mx-auto max-w-[1100px]" />
        </div>
      </section>

      {/* ───────── Promise strip ───────── */}
      <section className="overflow-hidden border-y border-line bg-malai py-4" aria-label="Our promises">
        <div className="marquee flex w-max gap-10 whitespace-nowrap text-[15px]">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10" aria-hidden={k === 1}>
              {["No middleman", "No preservatives", "Glass bottles only", "Milked at 4 AM", "Bilona hand-churned", "Every batch lab-tested", "Raw, unheated honey", "Wood-pressed oils", "FSSAI licensed"].map((t) => (
                <span key={t} className="flex items-center gap-10 text-ink-2">
                  {t}
                  <span className="text-ghee">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Categories (Blinkit-style tiles) ───────── */}
      <section className="container-x pt-14 sm:pt-20">
        <SectionHead eyebrow="Shop by kitchen staple" title="Everything from the goshala" hindi="सब कुछ, सीधे गौशाला से" art="grazing" />
        <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:gap-3 lg:grid-cols-8">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <Link href={`/shop?c=${c.slug}`} className="group flex flex-col items-center text-center">
                <span className="arch-sm relative block aspect-[4/5] w-full overflow-hidden p-1.5 transition duration-500 group-hover:-translate-y-1 sm:p-4" style={{ background: c.tint }}>
                  <PackShot pack={c.pack} liquid={c.slug === "honey" ? "#c9861b" : c.slug === "oils" ? "#d4a017" : c.slug === "ghee" ? "#e2a93b" : c.slug === "kheer" ? "#f5e7c4" : "#fbf8ef"} title={c.hindi} className="h-full w-full transition duration-500 group-hover:scale-105" />
                </span>
                <b className="mt-2 text-[11.5px] font-semibold leading-tight sm:mt-3 sm:text-[14.5px]">{c.name}</b>
                <span className="hidden font-deva text-[13px] text-ghee sm:block">{c.hindi}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────── Bestsellers ───────── */}
      <section className="container-x pt-16 sm:pt-24">
        <SectionHead
          eyebrow="Bestsellers"
          art="carry"
          title={`Loved in ${s.families} kitchens`}
          action={<Link href="/shop" className="inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold text-ghee-deep hover:gap-2.5">View all products <ArrowRight size={16} /></Link>}
        />
        <ProductRail label="Bestsellers">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} tint={tint[p.category.slug]} className="w-[200px] shrink-0 snap-start min-[400px]:w-[216px] lg:w-[236px]" />
          ))}
        </ProductRail>
      </section>

      {/* ───────── Making ───────── */}
      <section className="khadi relative mt-16 py-14 sm:mt-24 sm:py-20">
        <Floaters items={[{ shape: "drop", className: "right-[6%] top-10 h-12 w-9", depth: 70 }, { shape: "comb", className: "left-[2%] bottom-16 h-16 w-16 hidden md:block", depth: 90 }]} />
        <div className="container-x relative">
          <SectionHead eyebrow="How we make it" title={<>Nothing hidden. <span className="text-ghee">Watch us make it.</span></>} hindi="हम कैसे बनाते हैं" art="bilona">
            Every product has its own film, shot at our goshala and farms. Tap a step to jump to that moment.
          </SectionHead>
          <MakingShowcase stories={stories} />
        </div>
      </section>

      {/* ───────── Goshala to ghar timeline ───────── */}
      <section className="container-x pt-16 sm:pt-24">
        <SectionHead eyebrow="Every morning" title="Three hours from our cows to your door" hindi="सुबह 4 बजे से 7 बजे तक" art="milking">
          No distributor, no cold-storage warehouse, no repacking. The milk in your glass was in the udder before sunrise.
        </SectionHead>
        <div className="no-scrollbar -mx-5 flex snap-x scroll-px-5 snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {[
            { t: "4:00 AM", h: "Hand milking", d: "Cows are milked by hand after their first feed.", media: { video: "/videos/hand-milking.mp4", poster: "/videos/hand-milking.jpg" } },
            { t: "4:40 AM", h: "Chilled in 30 minutes", d: "Cloth-filtered and chilled to 4°C, never boiled or homogenised.", media: { img: "/images/milk-pour-jar.jpg" } },
            { t: "5:30 AM", h: "Filled in glass", d: "Sterilised bottles, dated caps, packed in insulated crates.", media: { img: "/images/milk-bottles-line.jpg" } },
            { t: "7:00 AM", h: "At your door", d: "Our own riders across Chandigarh, Mohali, Panchkula, Zirakpur.", media: { img: "/images/milk-jar-cookies.jpg" } },
          ].map((x, i) => (
            <div key={x.t} className="w-[70%] shrink-0 snap-start sm:w-auto">
              <div className="group">
                <div className="arch relative aspect-[3/4] overflow-hidden bg-malai-2">
                  {"video" in x.media ? (
                    <AutoVideo src={x.media.video!} poster={x.media.poster} label={x.h} />
                  ) : (
                    <Image src={x.media.img!} alt={x.h} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <span className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[13px] font-bold tabular-nums backdrop-blur">{x.t}</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ghee text-[11px] font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="text-[17px] font-semibold">{x.h}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink-3">{x.d}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Subscription ───────── */}
      <section className="relative mt-16 overflow-hidden sm:mt-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] *:min-w-0">
          <Reveal>
            <span className="eyebrow">Daily subscription</span>
            <h2 className="mt-2 font-display text-[32px] leading-[1.03] min-[400px]:text-[36px] sm:text-[48px] 2xl:text-[54px]">Set it once. Fresh milk every morning.</h2>
            <p className="mt-2 font-deva text-[20px] text-ghee">रोज़ सुबह, बिना झंझट</p>
            <ul className="mt-6 space-y-3.5 text-[15px] text-ink-2">
              {[
                [Sunrise, "Choose your days and quantity, even different amounts on weekends"],
                [HandHeart, "Skip tomorrow or change it until 10 PM tonight"],
                [Leaf, "Going away? Pause for as many days as you like"],
                [Recycle, "Pay from a prepaid wallet, only for what we deliver"],
              ].map(([Icon, t]) => {
                const I = Icon as typeof Sunrise;
                return (
                  <li key={t as string} className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tulsi-soft text-tulsi"><I size={16} /></span>
                    <span className="pt-1">{t as string}</span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <MiniPlanner options={planner} />
          </Reveal>
        </div>
        <div className="container-x mt-12">
          <RideStrip />
        </div>
      </section>

      {/* ───────── Glass promise ───────── */}
      <section className="container-x pt-16 sm:pt-24">
        <div className="grid overflow-hidden rounded-[32px] bg-malai lg:grid-cols-2">
          <div className="relative aspect-[16/11] sm:aspect-auto sm:min-h-[340px] lg:min-h-[520px]">
            <Image src="/images/milk-bottles-line.jpg" alt="Glass milk bottles lined up at the goshala" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="relative flex flex-col justify-center p-6 sm:p-12 lg:p-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Our packaging promise</span>
                <h2 className="mt-2 font-display text-[32px] leading-[1.04] min-[400px]:text-[36px] sm:text-[46px] 2xl:text-[52px]">Glass and clay. Never plastic.</h2>
                <p className="mt-2 font-deva text-[20px] text-ghee">काँच की बोतल, मिट्टी का कुल्हड़</p>
              </div>
              <Folk scene="pouring" label h="h-[130px]" className="hidden shrink-0 sm:flex" />
            </div>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-2">
              Milk and lassi come in glass bottles that we collect, sterilise and refill. Kheer comes in a kulhad, dahi sets in a clay matka, and ghee,
              honey and oils are sealed in glass jars you’ll want to keep.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[["1 bottle", "reused 30+ times"], ["₹" + s.bottleDeposit, "refundable deposit"], ["0 g", "plastic in your fridge"]].map(([a, b]) => (
                <div key={a}>
                  <dt className="font-display text-[30px] leading-none">{a}</dt>
                  <dd className="mt-1.5 text-[12.5px] text-ink-3">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ───────── Ships across India ───────── */}
      <section className="relative pt-16 sm:pt-24">
        <div className="container-x">
          <div className="mb-10 grid items-end gap-8 lg:grid-cols-[1fr_380px] *:min-w-0">
            <div>
              <span className="eyebrow flex items-center gap-2"><Truck size={14} /> Ships across India</span>
              <h2 className="mt-2 font-display text-[32px] leading-[1.05] min-[400px]:text-[36px] sm:text-[42px] 2xl:text-[48px]">Ghee, honey and oils, wherever you live</h2>
              <p className="mt-1 font-deva text-[20px] text-ghee">पूरे भारत में डिलीवरी</p>
              <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">Shelf-stable and sealed in glass, packed in moulded paper and couriered to any pincode in 3–6 days.</p>
              <Frieze scenes={["sowing", "kolhu", "bees"]} labels className="mt-8 max-w-[540px]" />
            </div>
            <div className="arch-sm relative hidden aspect-[16/10] overflow-hidden lg:block">
              <AutoVideo src="/videos/honey-jar.mp4" poster="/videos/honey-jar.jpg" label="Raw honey being scooped from a glass jar" />
            </div>
          </div>
          <ProductRail label="Ships across India">
            {shipped.map((p) => (
              <ProductCard key={p.id} p={p} tint={tint[p.category.slug]} className="w-[200px] shrink-0 snap-start min-[400px]:w-[216px] lg:w-[236px]" />
            ))}
          </ProductRail>
        </div>
      </section>

      {/* ───────── Numbers over film ───────── */}
      <section className="container-x pt-16 sm:pt-24">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-ink text-white">
          <div className="absolute inset-0 -z-10 opacity-70">
            <AutoVideo src="/videos/cows-close.mp4" poster="/videos/cows-close.jpg" label="Cows grazing at the goshala" />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
          <div className="grid gap-10 p-6 sm:p-12 lg:grid-cols-[1fr_1.2fr] lg:p-16 *:min-w-0">
            <div>
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/60">Our goshala</span>
              <h2 className="mt-2 font-display text-[32px] leading-[1.04] min-[400px]:text-[36px] sm:text-[48px] 2xl:text-[54px]">A real farm, with real names on every cow.</h2>
              <Link href="/goshala" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[15px] font-semibold text-ink hover:bg-malai">
                Visit our goshala <ArrowUpRight size={17} />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 self-end">
              {[[s.cows, "desi cows & buffaloes"], [s.litresPerDay + " L", "milked every morning"], ["0", "middlemen"], [s.kmToCity + " km", "from goshala to city"]].map(([a, b]) => (
                <div key={b} className="border-t border-white/25 pt-4">
                  <dt className="font-display text-[40px] leading-none sm:text-[64px]">{a}</dt>
                  <dd className="mt-2 text-[14px] text-white/75">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ───────── Reviews ───────── */}
      <section className="container-x pt-16 sm:pt-24">
        <SectionHead eyebrow="From our families" title="What our families say" hindi="हमारे परिवार" art="churn" />
        <div className="no-scrollbar -mx-5 flex snap-x scroll-px-5 snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:block sm:columns-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:columns-3">
          {reviews.map((r) => (
            <div key={r.id} className="w-[84%] shrink-0 snap-start sm:mb-4 sm:w-auto sm:break-inside-avoid">
              <figure className="h-full rounded-[22px] border border-line bg-white p-5 sm:p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} className={j < r.rating ? "fill-ghee text-ghee" : "text-line"} />)}
                </div>
                <blockquote className="mt-3 font-display text-[19px] leading-snug sm:text-[21px]">“{r.body}”</blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-[13px]">
                  <span><b className="font-semibold">{r.name}</b> <span className="text-ink-3">· {r.city}</span></span>
                  {r.product && <Link href={`/product/${r.product.slug}`} className="text-ghee-deep hover:underline">{r.product.name}</Link>}
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Lab reports + trace ───────── */}
      <section className="container-x pt-14 sm:pt-20">
        <div className="relative grid gap-8 overflow-hidden rounded-[32px] border border-line bg-white p-6 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center *:min-w-0">
          <div>
            <span className="eyebrow flex items-center gap-2"><FlaskConical size={14} /> Trace your jar</span>
            <h2 className="mt-2 font-display text-[30px] leading-[1.05] min-[400px]:text-[34px] sm:text-[40px] 2xl:text-[46px]">Every jar has a batch code. Look it up.</h2>
            <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-ink-2">
              See when it was made, how much went into it, and the lab report for that exact batch. Nobody else in your pantry does this.
            </p>
            <div className="mt-6"><TraceBox example={batch?.code} /></div>
          </div>
          {batch && (
            <div className="space-y-6">
              <Link href={`/trace/${batch.code}`} className="group block rounded-[24px] bg-malai p-6 transition hover:bg-malai-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-tulsi-soft px-3 py-1 text-[12px] font-semibold text-tulsi">Latest batch · {batch.result}</span>
                  <ArrowUpRight size={18} className="text-ink-3 transition group-hover:text-ink" />
                </div>
                <p className="mt-5 font-mono text-[13px] tracking-wider text-ink-3">{batch.code}</p>
                <p className="mt-1 font-display text-[28px] leading-tight">{batch.product.name}</p>
                <dl className="mt-5 grid grid-cols-3 gap-3 text-[13px]">
                  <div><dt className="text-ink-3">Made on</dt><dd className="font-semibold">{batch.madeOn.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</dd></div>
                  <div><dt className="text-ink-3">Purity</dt><dd className="font-semibold">{batch.fat ?? "—"}</dd></div>
                  <div><dt className="text-ink-3">Quantity</dt><dd className="font-semibold">{batch.quantity.split(" ")[0]} jars</dd></div>
                </dl>
              </Link>
              <Folk scene="jars" label h="h-[110px]" />
            </div>
          )}
        </div>
      </section>

      {/* ───────── Life at the goshala ───────── */}
      <section className="container-x pt-16 sm:pt-24">
        <SectionHead eyebrow="Life at the goshala" title="Mornings at Gaurgram" hindi="गौशाला की सुबह" art="cooking" />
        <div className="grid auto-rows-[120px] grid-cols-2 gap-2 sm:auto-rows-[220px] sm:gap-3 lg:grid-cols-4">
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-[24px]"><AutoVideo src="/videos/dawn-meadow.mp4" poster="/videos/dawn-meadow.jpg" label="Sunrise over the goshala meadow" /></div>
          <div className="relative overflow-hidden rounded-[24px]"><Image src="/images/cow-desi.jpg" alt="Desi cow" fill sizes="25vw" className="object-cover" /></div>
          <div className="relative overflow-hidden rounded-[24px]"><AutoVideo src="/videos/bees-hive.mp4" poster="/videos/bees-hive.jpg" label="Bees at our hives" /></div>
          <div className="relative overflow-hidden rounded-[24px]"><Image src="/images/makhan.jpg" alt="Fresh white makhan" fill sizes="25vw" className="object-cover" /></div>
          <div className="relative overflow-hidden rounded-[24px]"><Image src="/images/field-sunset.jpg" alt="Mustard fields at dusk" fill sizes="25vw" className="object-cover" /></div>
        </div>
      </section>
    </>
  );
}
