"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Check, Sunrise, Wallet, Info } from "lucide-react";
import PackShot from "../PackShot";
import AddressForm from "../account/AddressForm";
import LoginForm from "../account/LoginForm";
import { createSubscription } from "@/app/actions";
import { cx, rupees } from "@/lib/format";
import { addDays, diffDays, prettyDate, weekday, WEEKDAYS } from "@/lib/dates";

type V = { id: string; label: string; price: number; subPrice: number | null };
type P = { slug: string; name: string; hindi: string; pack: string; liquid: string; label: string; labelTitle: string; tint: string; variants: V[] };
type Addr = { id: string; label: string; name: string; line1: string; city: string; pincode: string; fresh: boolean };

type Props = {
  products: P[];
  initial: { product?: string; variant?: string; days?: string; qty?: number };
  earliest: string;
  cutoffHour: number;
  user: { name: string; wallet: number } | null;
  addresses: Addr[];
  loginNext: string;
};

function Stepper({ value, onChange, min = 0, small }: { value: number; onChange: (n: number) => void; min?: number; small?: boolean }) {
  return (
    <span className={cx("inline-flex items-center rounded-xl border border-line bg-white", small ? "h-9" : "h-11")}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className={cx("grid h-full place-items-center", small ? "w-8" : "w-11")} aria-label="Less"><Minus size={14} /></button>
      <span className="w-6 text-center text-[14px] font-semibold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(10, value + 1))} className={cx("grid h-full place-items-center", small ? "w-8" : "w-11")} aria-label="More"><Plus size={14} /></button>
    </span>
  );
}


function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={`sub-step-${n}`} className="scroll-mt-40 border-t border-line py-7 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-3 text-[18px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[12px] font-bold text-white">{n}</span>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SubscribeBuilder({ products, initial, earliest, cutoffHour, user, addresses: initialAddr, loginNext }: Props) {
  const router = useRouter();
  const startP = Math.max(0, products.findIndex((p) => p.slug === initial.product));
  const [pi, setPi] = useState(startP);
  const p = products[pi];
  const [vid, setVid] = useState(() => {
    const byId = p.variants.find((v) => v.id === initial.variant);
    return byId?.id ?? p.variants[p.variants.length > 1 ? 1 : 0].id;
  });
  const fromDays = initial.days && /^[01]{7}$/.test(initial.days) ? initial.days.split("").map((d) => (d === "1" ? initial.qty ?? 1 : 0)) : null;
  const [pattern, setPattern] = useState<"DAILY" | "ALTERNATE" | "CUSTOM">(fromDays && fromDays.some((d) => d === 0) ? "CUSTOM" : "DAILY");
  const [qty, setQty] = useState(initial.qty ?? 1);
  const [week, setWeek] = useState<number[]>(fromDays ?? [1, 1, 1, 1, 1, 1, 1]);
  const [start, setStart] = useState(earliest);
  const [slot, setSlot] = useState("6–8 AM");
  const [addresses, setAddresses] = useState(initialAddr);
  const [addressId, setAddressId] = useState(initialAddr.find((a) => a.fresh)?.id ?? initialAddr[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");
  const [pending, startT] = useTransition();

  const v = p.variants.find((x) => x.id === vid) ?? p.variants[0];
  const unit = v.subPrice ?? v.price;

  const qtyOn = (date: string) => {
    if (date < start) return 0;
    if (pattern === "DAILY") return qty;
    if (pattern === "ALTERNATE") return diffDays(start, date) % 2 === 0 ? qty : 0;
    return week[weekday(date)];
  };

  const preview = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(start, i)), [start]);
  const monthUnits = useMemo(() => Array.from({ length: 30 }, (_, i) => qtyOn(addDays(start, i))).reduce((a, b) => a + b, 0), // eslint-disable-next-line react-hooks/exhaustive-deps
    [pattern, qty, week, start]);
  const monthly = monthUnits * unit;

  const addr = addresses.find((a) => a.id === addressId);

  function pickProduct(i: number) {
    setPi(i);
    const np = products[i];
    setVid(np.variants[np.variants.length > 1 ? 1 : 0].id);
  }

  function primary() {
    if (!user || !addr) {
      document.getElementById("sub-step-4")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (user && !addr) setAdding(true);
      return;
    }
    submit();
  }

  function submit() {
    setErr("");
    startT(async () => {
      const r = await createSubscription({ variantId: v.id, pattern, qty, weekQty: week, startDate: start, slot, addressId });
      if (!r.ok) return setErr(r.error);
      router.push(`/account?subscribed=${r.id}`);
    });
  }


  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_390px] lg:gap-12 lg:pb-0 *:min-w-0">
      <div>
        <Step n={1} title="What would you like every morning?">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {products.map((x, i) => (
              <button
                key={x.slug}
                type="button"
                onClick={() => pickProduct(i)}
                className={cx("relative rounded-2xl border-[1.5px] p-2.5 text-left transition", i === pi ? "border-ink" : "border-line hover:border-ink/30")}
              >
                {i === pi && <Check size={15} className="absolute right-2.5 top-2.5 z-10 text-tulsi" />}
                <span className="block aspect-square rounded-xl p-3" style={{ background: x.tint }}>
                  <PackShot pack={x.pack} liquid={x.liquid} label={x.label} title={x.labelTitle} className="h-full w-full" />
                </span>
                <b className="mt-2 block text-[13.5px] font-semibold leading-tight">{x.name}</b>
                <span className="text-[12px] text-ink-3">from {rupees(Math.min(...x.variants.map((y) => y.subPrice ?? y.price)))}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.variants.map((x) => (
              <button key={x.id} type="button" onClick={() => setVid(x.id)} className={cx("rounded-xl border-[1.5px] px-4 py-2 text-[14px] transition", x.id === vid ? "border-tulsi bg-tulsi-soft font-semibold text-tulsi" : "border-line text-ink-2")}>
                {x.label} · {rupees(x.subPrice ?? x.price)}
                {x.subPrice && x.subPrice < x.price && <span className="ml-1.5 text-[12px] text-ink-3 line-through">{rupees(x.price)}</span>}
              </button>
            ))}
          </div>
        </Step>

        <Step n={2} title="How often?">
          <div className="inline-flex rounded-xl bg-malai p-1" role="tablist">
            {([["DAILY", "Every day"], ["ALTERNATE", "Alternate days"], ["CUSTOM", "Pick days"]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={pattern === k} type="button" onClick={() => setPattern(k)} className={cx("rounded-lg px-4 py-2 text-[14px] font-medium transition", pattern === k ? "bg-white shadow-sm" : "text-ink-2")}>
                {l}
              </button>
            ))}
          </div>
          {pattern === "CUSTOM" ? (
            <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2.5">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={cx("flex flex-col items-center gap-1.5 rounded-xl border px-0.5 py-2 sm:gap-2 sm:rounded-2xl sm:p-3", week[i] ? "border-tulsi bg-tulsi-soft" : "border-line bg-white")}>
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3 sm:text-[12px] sm:tracking-wider">{d}</span>
                  <button type="button" onClick={() => setWeek((w) => w.map((q, j) => (j === i ? q + 1 : q)))} className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-[0_0_0_1px_var(--line)]" aria-label={`More on ${d}`}><Plus size={13} /></button>
                  <span className="font-display text-[20px] leading-none tabular-nums sm:text-[26px]">{week[i]}</span>
                  <button type="button" onClick={() => setWeek((w) => w.map((q, j) => (j === i ? Math.max(0, q - 1) : q)))} className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-[0_0_0_1px_var(--line)]" aria-label={`Less on ${d}`}><Minus size={13} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-4">
              <Stepper value={qty} onChange={setQty} min={1} />
              <span className="text-[14px] text-ink-2">× {v.label} {pattern === "DAILY" ? "every morning" : "every other morning"}</span>
            </div>
          )}
          {pattern === "CUSTOM" && <p className="mt-3 text-[13px] text-ink-3">Set a different quantity for each day, like 2 on weekends when family visits.</p>}
        </Step>

        <Step n={3} title="Starting when?">
          <div className="flex flex-wrap items-end gap-4">
            <label>
              <span className="text-[13px] font-semibold">First delivery</span>
              <input id="sub-start" type="date" min={earliest} value={start} onChange={(e) => setStart(e.target.value < earliest ? earliest : e.target.value)} className="mt-1.5 block h-12 rounded-xl border border-line bg-malai px-3.5 text-[15px] outline-none focus:border-ghee" />
            </label>
            <div>
              <span className="text-[13px] font-semibold">Delivery slot</span>
              <div className="mt-1.5 flex gap-2">
                {["5–7 AM", "6–8 AM"].map((s) => (
                  <button key={s} type="button" onClick={() => setSlot(s)} className={cx("flex h-12 items-center gap-2 rounded-xl border-[1.5px] px-4 text-[14px]", slot === s ? "border-tulsi bg-tulsi-soft font-semibold text-tulsi" : "border-line text-ink-2")}>
                    <Sunrise size={15} /> {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-ink-3">Orders and changes for tomorrow close at {cutoffHour > 12 ? cutoffHour - 12 : cutoffHour} {cutoffHour >= 12 ? "PM" : "AM"} tonight.</p>
        </Step>

        <Step n={4} title="Where should we deliver?">
          {!user ? (
            <div className="max-w-md rounded-2xl bg-malai p-5">
              <p className="mb-4 text-[14px] text-ink-2">Sign in with your mobile number to save your plan. Your choices above stay as they are.</p>
              <LoginForm next={loginNext} />
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <button key={a.id} type="button" onClick={() => setAddressId(a.id)} className={cx("relative rounded-2xl border-[1.5px] p-4 text-left", a.id === addressId ? "border-ink bg-malai" : "border-line")}>
                    {a.id === addressId && <Check size={16} className="absolute right-3 top-3 text-tulsi" />}
                    <b className="block text-[14.5px]">{a.label} · {a.name}</b>
                    <span className="block text-[13px] text-ink-2">{a.line1}, {a.city} {a.pincode}</span>
                    {!a.fresh && <span className="mt-1.5 block text-[12px] font-medium text-clay">Outside our daily delivery area</span>}
                  </button>
                ))}
                {!adding && (
                  <button type="button" onClick={() => setAdding(true)} className="flex min-h-[90px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-line text-[14px] font-semibold text-ink-2">
                    <Plus size={16} /> Add address
                  </button>
                )}
              </div>
              {adding && (
                <div className="mt-5 rounded-2xl border border-line p-5">
                  <AddressForm
                    defaultName={user.name}
                    onCancel={() => setAdding(false)}
                    onSaved={(id, fresh, a) => {
                      setAddresses((prev) => [...prev, { id, label: a.label, name: a.name, line1: a.line1, city: a.city, pincode: a.pincode, fresh }]);
                      setAddressId(id);
                      setAdding(false);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </Step>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-[140px] lg:self-start">
        <div className="rounded-[24px] bg-malai p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="h-20 w-16 shrink-0 rounded-xl p-1.5" style={{ background: p.tint }}>
              <PackShot pack={p.pack} liquid={p.liquid} label={p.label} title={p.labelTitle} className="h-full w-full" />
            </span>
            <div>
              <p className="font-deva text-[15px] text-ghee">{p.hindi}</p>
              <p className="font-display text-[24px] leading-tight">{p.name}</p>
              <p className="text-[13px] text-ink-3">{v.label} · {rupees(unit)} each · {slot}</p>
            </div>
          </div>

          <h3 className="eyebrow mt-6">Your next two weeks</h3>
          <div className="mt-2 grid grid-cols-7 gap-1.5 text-center">
            {preview.map((d) => {
              const q = qtyOn(d);
              return (
                <div key={d} className={cx("rounded-lg border py-1.5", q ? "border-tulsi/40 bg-white" : "border-transparent bg-malai-2/60 text-ink-3")}>
                  <span className="block text-[10px] uppercase">{WEEKDAYS[weekday(d)].slice(0, 2)}</span>
                  <span className="block text-[13px] font-semibold tabular-nums">{d.slice(8)}</span>
                  <span className={cx("block text-[10.5px] font-bold", q ? "text-tulsi" : "")}>{q ? `×${q}` : "–"}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-ink-3">Starts {prettyDate(start, { weekday: "long", day: "numeric", month: "long" })}</p>

          <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
            <div>
              <p className="text-[13px] text-ink-3">{monthUnits} {v.label} in 30 days · about</p>
              <p className="font-display text-[40px] leading-none tabular-nums">{rupees(monthly)}</p>
            </div>
            <span className="text-[12px] text-ink-3">/ month</span>
          </div>

          <p className="mt-4 flex gap-2.5 rounded-xl bg-white p-3.5 text-[13px] text-ink-2">
            <Wallet size={17} className="mt-0.5 shrink-0 text-tulsi" />
            <span>No upfront payment. Each delivery is paid from your Gaurgram wallet{user ? <> (balance <b>{rupees(user.wallet)}</b>)</> : ""}. Top up anytime with UPI.</span>
          </p>
          {addr && !addr.fresh && (
            <p className="mt-3 flex gap-2 rounded-xl bg-clay-soft p-3 text-[13px] text-clay"><Info size={16} className="mt-0.5 shrink-0" /> Daily delivery is only in Chandigarh, Mohali, Panchkula and Zirakpur right now.</p>
          )}
          {err && <p className="mt-3 rounded-xl bg-clay-soft p-3 text-[13px] text-clay">{err}</p>}
          <button
            type="button"
            onClick={primary}
            disabled={pending || (!!user && (!addr || !addr.fresh)) || monthUnits === 0}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-tulsi text-[16px] font-semibold text-white transition hover:bg-tulsi-deep disabled:opacity-40"
          >
            {pending ? "Starting…" : !user ? "Sign in to start" : "Start subscription"}
          </button>
          <p className="mt-2 text-center text-[12px] text-ink-3">Skip, change or pause any day from your account.</p>
        </div>
      </aside>

      {/* Phones: the total and the main action stay within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-[#fbf8f1]/95 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12px] text-ink-3">{p.name} · {v.label} · {monthUnits}/month</p>
            <p className="font-display text-[24px] tabular-nums">{rupees(monthly)}<span className="font-sans text-[12px] text-ink-3"> / month</span></p>
          </div>
          <button
            type="button"
            onClick={primary}
            disabled={pending || (!!user && (!addr || !addr.fresh)) || monthUnits === 0}
            className="h-12 shrink-0 rounded-xl bg-tulsi px-5 text-[15px] font-semibold text-white disabled:opacity-40"
          >
            {pending ? "Starting…" : !user ? "Sign in" : !addr ? "Add address" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
