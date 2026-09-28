import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, FileText, SearchX } from "lucide-react";
import { Flask } from "@/components/folk/icons";
import { db } from "@/lib/db";
import { labelTitle } from "@/lib/catalog";
import PackShot from "@/components/PackShot";
import TraceBox from "@/components/home/TraceBox";
import Folk from "@/components/folk/Folk";
import { SCENE_FOR } from "@/components/folk/forCategory";

export const metadata: Metadata = { title: "Trace your batch" };

export default async function TracePage({ params }: { params: Promise<{ code: string }> }) {
  const code = decodeURIComponent((await params).code).toUpperCase();
  const b = await db.batch.findUnique({ where: { code }, include: { product: { include: { category: true } } } });

  if (!b) {
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <Folk scene="jars" h="h-[100px]" className="mb-4" />
        <SearchX size={40} className="text-ink-3" />
        <h1 className="mt-4 font-display text-[40px]">We couldn’t find batch {code}</h1>
        <p className="mt-2 max-w-md text-ink-2">Check the code printed on the side of your jar, near the date. It starts with GG.</p>
        <div className="mt-8 flex w-full justify-center"><TraceBox /></div>
      </div>
    );
  }

  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeline = [
    b.milkedOn && { t: "Milk collected", d: fmt(b.milkedOn), note: "Desi cow milk from the morning milking, set as curd overnight." },
    { t: b.product.category.slug === "honey" ? "Harvested & jarred" : b.product.category.slug === "oils" ? "Pressed & settled" : "Churned & cooked", d: fmt(b.madeOn), note: b.quantity },
    { t: "Lab tested", d: b.lab || "Independent lab", note: b.notes },
  ].filter(Boolean) as { t: string; d: string; note: string }[];

  return (
    <div className="container-x py-12">
      <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16 *:min-w-0">
        <div className="arch relative mx-auto aspect-[4/5] w-full max-w-[380px] p-12" style={{ background: b.product.category.tint }}>
          <PackShot pack={b.product.pack} liquid={b.product.liquid} label={b.product.label} title={labelTitle(b.product.slug, b.product.category.hindi)} sub={b.code} className="h-full w-full" />
        </div>
        <div>
          <span className="eyebrow flex items-center gap-2"><Flask size={15} /> Batch trace</span>
          <p className="mt-3 font-mono text-[15px] tracking-wider text-ink-3">{b.code}</p>
          <h1 className="font-display text-[32px] min-[400px]:text-[38px] leading-tight sm:text-[56px]">{b.product.name}</h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-tulsi-soft px-4 py-2 text-[14px] font-semibold text-tulsi"><CheckCircle2 size={17} /> Lab result: {b.result}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[["Batch size", b.quantity], ["Purity (fat)", b.fat ?? "—"], ["Moisture", b.moisture ?? "—"], ["Made on", b.madeOn.toLocaleDateString("en-IN", { day: "numeric", month: "short" })]].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-malai p-4">
                <dt className="text-[12px] text-ink-3">{k}</dt>
                <dd className="mt-1 text-[16px] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <ol className="mt-10 space-y-0">
            {timeline.map((x, i) => (
              <li key={x.t} className="relative grid grid-cols-[28px_1fr] gap-4 pb-8 last:pb-0">
                {i < timeline.length - 1 && <span className="absolute left-[13px] top-7 h-full w-px bg-line" />}
                <span className="relative z-10 mt-1 grid h-7 w-7 place-items-center rounded-full bg-ghee text-[12px] font-bold text-white">{i + 1}</span>
                <div>
                  <b className="text-[16px] font-semibold">{x.t}</b>
                  <p className="text-[14px] text-ink-2">{x.d}</p>
                  <p className="text-[13.5px] text-ink-3">{x.note}</p>
                </div>
              </li>
            ))}
          </ol>

          {b.reportUrl ? (
            <a href={b.reportUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-[14px] font-semibold text-white"><FileText size={16} /> Download lab report (PDF)</a>
          ) : (
            <p className="mt-8 text-[13.5px] text-ink-3">The full lab report PDF will appear here once uploaded.</p>
          )}
          <Folk scene={SCENE_FOR[b.product.category.slug] ?? "jars"} label h="h-[100px]" align="left" className="mt-10" />
          <p className="mt-6 text-[14px]"><Link href={`/product/${b.product.slug}`} className="font-semibold text-ghee-deep hover:underline">Buy {b.product.name} →</Link></p>
        </div>
      </div>
    </div>
  );
}
