"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus, ArrowRight } from "lucide-react";
import PackShot from "../PackShot";
import { cx, rupees } from "@/lib/format";

type Option = { slug: string; name: string; pack: string; liquid: string; label: string; labelTitle: string; unit: string; price: number };

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function MiniPlanner({ options }: { options: Option[] }) {
  const [pi, setPi] = useState(0);
  const [days, setDays] = useState([true, true, true, true, true, true, true]);
  const [qty, setQty] = useState(1);
  const o = options[pi];

  const monthly = useMemo(() => {
    const perWeek = days.filter(Boolean).length * qty;
    return Math.round((perWeek * 30) / 7) * (o?.price ?? 0);
  }, [days, qty, o]);

  if (!o) return null;
  const count = days.filter(Boolean).length;

  return (
    <div className="grid min-w-0 gap-6 rounded-[28px] border border-line bg-white p-5 sm:p-7 lg:grid-cols-[180px_1fr] *:min-w-0">
      <div className="mx-auto hidden aspect-[4/5] w-full max-w-[180px] rounded-2xl bg-malai p-4 lg:block">
        <PackShot pack={o.pack} liquid={o.liquid} label={o.label} title={o.labelTitle} sub={o.unit} className="h-full w-full" />
      </div>
      <div className="min-w-0 space-y-5">
        <div>
          <span className="eyebrow">1 · Pick what you want every morning</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((x, i) => (
              <button
                key={x.slug}
                type="button"
                onClick={() => setPi(i)}
                className={cx("rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition", i === pi ? "border-tulsi bg-tulsi-soft text-tulsi" : "border-line text-ink-2 hover:border-ink/30")}
              >
                {x.name} · {x.unit}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow">2 · Choose your days</span>
          <div className="mt-2 grid max-w-[340px] grid-cols-7 gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={days[i]}
                aria-label={DAY_NAMES[i]}
                onClick={() => setDays((p) => p.map((v, j) => (j === i ? !v : v)))}
                className={cx("grid aspect-square w-full place-items-center rounded-xl border text-[14px] font-semibold transition", days[i] ? "border-tulsi bg-tulsi text-white" : "border-line bg-malai text-ink-3")}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-3 text-[12.5px]">
            <button type="button" className="font-semibold text-ghee-deep hover:underline" onClick={() => setDays([true, true, true, true, true, true, true])}>Every day</button>
            <button type="button" className="font-semibold text-ghee-deep hover:underline" onClick={() => setDays([false, true, true, true, true, true, false])}>Weekdays</button>
            <button type="button" className="font-semibold text-ghee-deep hover:underline" onClick={() => setDays([true, false, false, false, false, false, true])}>Weekends</button>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-5 border-t border-line pt-5">
          <div>
            <span className="eyebrow block">3 · How many</span>
            <div className="mt-2 inline-flex h-11 items-center rounded-xl border border-line">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-11 place-items-center" aria-label="Fewer"><Minus size={15} /></button>
              <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(6, q + 1))} className="grid h-full w-11 place-items-center" aria-label="More"><Plus size={15} /></button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12.5px] text-ink-3">{count} {count === 1 ? "day" : "days"} a week · about</p>
            <p className="font-display text-[40px] leading-none tabular-nums">{rupees(monthly)}<span className="font-sans text-[14px] text-ink-3"> / month</span></p>
            <p className="text-[12px] text-ink-3">Paid from your wallet, only for what’s delivered</p>
          </div>
        </div>

        <Link
          href={`/subscribe?product=${o.slug}&days=${days.map((d) => (d ? 1 : 0)).join("")}&qty=${qty}`}
          className={cx("flex h-13 items-center justify-center gap-2 rounded-2xl bg-tulsi py-3.5 text-[15px] font-semibold text-white transition hover:bg-tulsi-deep", count === 0 && "pointer-events-none opacity-40")}
        >
          Start my subscription <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
