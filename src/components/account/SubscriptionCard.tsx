"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Minus, Plus, Lock, Check } from "lucide-react";
import PackShot from "../PackShot";
import { cancelSubscription, pauseSubscription, resumeSubscription, setDayQty, updatePlan } from "@/app/actions";
import { addDays, monthDays, prettyDate, weekday, WEEKDAYS } from "@/lib/dates";
import { describePattern, isPaused, qtyOn, type SubLike } from "@/lib/schedule";
import { cx, parseJSON, rupees } from "@/lib/format";

export type SubData = SubLike & {
  id: string;
  slot: string;
  product: { name: string; hindi: string; pack: string; liquid: string; label: string; labelTitle: string; tint: string };
  variantLabel: string;
  unitPrice: number;
  overrides: Record<string, number>;
  delivered: Record<string, { qty: number; status: string }>;
  address: string;
};

export default function SubscriptionCard({ sub, today, earliest, cutoffHour }: { sub: SubData; today: string; earliest: string; cutoffHour: number }) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [picked, setPicked] = useState<string | null>(null);
  const [panel, setPanel] = useState<null | "pause" | "edit" | "cancel">(null);
  const [from, setFrom] = useState(earliest);
  const [to, setTo] = useState(addDays(earliest, 6));
  const [pattern, setPattern] = useState(sub.pattern as "DAILY" | "ALTERNATE" | "CUSTOM");
  const [qty, setQty] = useState(sub.qty);
  const [week, setWeek] = useState<number[]>(parseJSON(sub.weekQty, [1, 1, 1, 1, 1, 1, 1]));
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const [y, m] = month.split("-").map(Number);
  const days = monthDays(y, m);
  const lead = weekday(days[0]);
  const editable = (d: string) => d >= earliest;

  const q = (d: string) => (d <= today ? sub.delivered[d]?.qty ?? 0 : qtyOn(sub, d, sub.overrides));
  const monthTotal = days.filter((d) => d > today).reduce((t, d) => t + q(d), 0);
  const nextDelivery = Array.from({ length: 30 }, (_, i) => addDays(earliest, i)).find((d) => q(d) > 0);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setErr("");
      const r = await fn();
      if (!r.ok) setErr(r.error ?? "Something went wrong.");
      else setPanel(null);
    });

  const status = sub.status === "CANCELLED" ? "Cancelled" : isPaused(sub, earliest) ? "Paused" : "Active";

  return (
    <article className="overflow-hidden rounded-[26px] border border-line bg-white">
      <header className="flex flex-wrap items-center gap-4 border-b border-line p-5 sm:p-6">
        <span className="h-16 w-13 shrink-0 rounded-xl p-1" style={{ background: sub.product.tint }}>
          <PackShot pack={sub.product.pack} liquid={sub.product.liquid} label={sub.product.label} title={sub.product.labelTitle} className="h-full w-full" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[24px] leading-tight">{sub.product.name}</h3>
            <span className={cx("rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", status === "Active" ? "bg-tulsi-soft text-tulsi" : status === "Paused" ? "bg-ghee-soft text-ghee-deep" : "bg-malai-2 text-ink-3")}>{status}</span>
          </div>
          <p className="text-[13.5px] text-ink-2">{sub.variantLabel} · {describePattern(sub)} · {sub.slot} · {rupees(sub.unitPrice)} each</p>
          <p className="text-[12.5px] text-ink-3">{sub.address}</p>
        </div>
        {sub.status !== "CANCELLED" && (
          <div className="flex flex-wrap gap-2">
            {status === "Paused" || sub.pauseFrom ? (
              <button type="button" disabled={pending} onClick={() => act(() => resumeSubscription(sub.id))} className="flex h-10 items-center gap-1.5 rounded-xl bg-tulsi px-4 text-[13px] font-semibold text-white"><Play size={14} /> Resume</button>
            ) : (
              <button type="button" onClick={() => setPanel(panel === "pause" ? null : "pause")} className="flex h-10 items-center gap-1.5 rounded-xl border border-line px-4 text-[13px] font-semibold hover:bg-malai"><Pause size={14} /> Pause</button>
            )}
            <button type="button" onClick={() => setPanel(panel === "edit" ? null : "edit")} className="h-10 rounded-xl border border-line px-4 text-[13px] font-semibold hover:bg-malai">Change plan</button>
            <button type="button" onClick={() => setPanel(panel === "cancel" ? null : "cancel")} className="h-10 rounded-xl px-3 text-[13px] font-medium text-ink-3 hover:bg-malai hover:text-clay">Cancel</button>
          </div>
        )}
      </header>

      {sub.pauseFrom && (
        <p className="border-b border-line bg-ghee-soft px-6 py-3 text-[13px] text-ghee-deep">
          Paused from {prettyDate(sub.pauseFrom)}{sub.pauseTo ? ` to ${prettyDate(sub.pauseTo)}` : " until you resume"}.
        </p>
      )}

      {panel === "pause" && (
        <div className="flex flex-wrap items-end gap-3 border-b border-line bg-malai p-5">
          <label><span className="text-[12.5px] font-semibold">From</span><input id={`pf-${sub.id}`} type="date" min={earliest} value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block h-11 rounded-xl border border-line bg-white px-3 text-[14px]" /></label>
          <label><span className="text-[12.5px] font-semibold">Until</span><input id={`pt-${sub.id}`} type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block h-11 rounded-xl border border-line bg-white px-3 text-[14px]" /></label>
          <button type="button" disabled={pending} onClick={() => act(() => pauseSubscription(sub.id, from, to))} className="h-11 rounded-xl bg-ink px-5 text-[13px] font-semibold text-white">Pause these days</button>
          <button type="button" disabled={pending} onClick={() => act(() => pauseSubscription(sub.id, from, null))} className="h-11 rounded-xl border border-ink px-4 text-[13px] font-semibold">Pause until I resume</button>
        </div>
      )}

      {panel === "edit" && (
        <div className="space-y-4 border-b border-line bg-malai p-5">
          <div className="inline-flex rounded-xl bg-white p-1">
            {([["DAILY", "Every day"], ["ALTERNATE", "Alternate"], ["CUSTOM", "Pick days"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setPattern(k)} className={cx("rounded-lg px-3.5 py-1.5 text-[13px] font-medium", pattern === k ? "bg-ink text-white" : "text-ink-2")}>{l}</button>
            ))}
          </div>
          {pattern === "CUSTOM" ? (
            <div className="grid max-w-lg grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1 rounded-xl bg-white p-2">
                  <span className="text-[11px] font-semibold text-ink-3">{d}</span>
                  <button type="button" onClick={() => setWeek((w) => w.map((x, j) => (j === i ? Math.min(10, x + 1) : x)))} aria-label={`More ${d}`}><Plus size={13} /></button>
                  <span className="font-semibold tabular-nums">{week[i]}</span>
                  <button type="button" onClick={() => setWeek((w) => w.map((x, j) => (j === i ? Math.max(0, x - 1) : x)))} aria-label={`Less ${d}`}><Minus size={13} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center rounded-xl bg-white" aria-label="Less"><Minus size={14} /></button>
              <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(10, qty + 1))} className="grid h-10 w-10 place-items-center rounded-xl bg-white" aria-label="More"><Plus size={14} /></button>
              <span className="text-[13px] text-ink-2">× {sub.variantLabel}</span>
            </div>
          )}
          <button type="button" disabled={pending} onClick={() => act(() => updatePlan(sub.id, pattern, qty, week))} className="h-11 rounded-xl bg-ink px-5 text-[13px] font-semibold text-white">Save plan</button>
        </div>
      )}

      {panel === "cancel" && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-clay-soft p-5 text-[14px]">
          <span className="flex-1 text-clay">Stop all future deliveries of {sub.product.name}? You can start a new plan anytime.</span>
          <button type="button" disabled={pending} onClick={() => act(() => cancelSubscription(sub.id))} className="h-10 rounded-xl bg-clay px-4 text-[13px] font-semibold text-white">Yes, cancel</button>
          <button type="button" onClick={() => setPanel(null)} className="h-10 rounded-xl px-3 text-[13px] font-medium">Keep it</button>
        </div>
      )}

      {err && <p className="bg-clay-soft px-6 py-3 text-[13px] text-clay">{err}</p>}

      {/* Calendar */}
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-[16px] font-semibold">{new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}</h4>
            <p className="text-[12.5px] text-ink-3">
              {nextDelivery && sub.status !== "CANCELLED" ? <>Next delivery: <b className="text-ink-2">{prettyDate(nextDelivery, { weekday: "short", day: "numeric", month: "short" })} × {q(nextDelivery)}</b> · </> : null}
              {monthTotal} more this month · about {rupees(monthTotal * sub.unitPrice)}
            </p>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => setMonth(addDays(`${month}-01`, -1).slice(0, 7))} className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-malai" aria-label="Previous month"><ChevronLeft size={16} /></button>
            <button type="button" onClick={() => setMonth(addDays(`${month}-01`, 32).slice(0, 7))} className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-malai" aria-label="Next month"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
          {WEEKDAYS.map((d) => <span key={d} className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">{d}</span>)}
          {Array.from({ length: lead }).map((_, i) => <span key={`l${i}`} />)}
          {days.map((d) => {
            const past = d <= today;
            const n = q(d);
            const deliveredRow = sub.delivered[d];
            const paused = !past && isPaused(sub, d);
            const changed = !past && d in sub.overrides;
            const canEdit = editable(d) && sub.status !== "CANCELLED";
            return (
              <button
                key={d}
                type="button"
                disabled={!canEdit}
                onClick={() => setPicked(picked === d ? null : d)}
                className={cx(
                  "relative flex h-14 flex-col items-center justify-center rounded-xl border text-[13px] transition sm:h-[60px]",
                  d === today && "ring-2 ring-ink ring-offset-1",
                  picked === d ? "border-ink bg-ink text-white" : paused ? "border-ghee/40 bg-ghee-soft" : n > 0 ? (past ? "border-transparent bg-tulsi-soft" : "border-tulsi/40 bg-white") : "border-transparent bg-malai",
                  canEdit && picked !== d && "hover:border-ink/40",
                  !canEdit && !past && "cursor-not-allowed",
                )}
              >
                <span className={cx("font-semibold tabular-nums", picked !== d && !n && "text-ink-3")}>{Number(d.slice(8))}</span>
                <span className={cx("text-[10.5px] font-bold", picked === d ? "text-white/80" : past ? "text-tulsi" : paused ? "text-ghee-deep" : n ? "text-tulsi" : "text-ink-3")}>
                  {past ? (deliveredRow ? <span className="inline-flex items-center gap-0.5"><Check size={10} />{deliveredRow.qty}</span> : "") : paused ? "pause" : n ? `×${n}` : "off"}
                </span>
                {changed && picked !== d && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-ghee" title="Changed" />}
                {!past && !canEdit && <Lock size={9} className="absolute left-1 top-1 text-ink-3" />}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-malai p-4">
            <span className="text-[14px] font-semibold">{prettyDate(picked, { weekday: "long", day: "numeric", month: "long" })}</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={pending}
                  onClick={() => start(async () => {
                    setErr("");
                    const r = await setDayQty(sub.id, picked, n);
                    if (!r.ok) setErr(r.error);
                    else setPicked(null);
                  })}
                  className={cx("h-10 min-w-12 rounded-xl border px-3 text-[13px] font-semibold", q(picked) === n ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
                >
                  {n === 0 ? "Skip" : `× ${n}`}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="mt-3 text-[12px] text-ink-3">Tap any unlocked day to skip it or change the quantity. Tomorrow locks at {cutoffHour > 12 ? cutoffHour - 12 : cutoffHour} PM tonight. <span className="inline-block h-1.5 w-1.5 rounded-full bg-ghee align-middle" /> marks days you changed.</p>
      </div>
    </article>
  );
}
