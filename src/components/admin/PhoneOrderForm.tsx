"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { createPhoneOrder, lookupCustomer } from "@/app/admin/actions";
import { cx, rupees } from "@/lib/format";
import { btn, btnSm, input } from "./ui";

type V = { id: string; name: string; label: string; price: number; stock: number; fresh: boolean };
type Found = Awaited<ReturnType<typeof lookupCustomer>>;

export default function PhoneOrderForm({ variants, earliest }: { variants: V[]; earliest: string }) {
  const [state, action, pending] = useActionState(createPhoneOrder, null);
  const [phone, setPhone] = useState("");
  const [cust, setCust] = useState<Found>(null);
  const [looking, startLook] = useTransition();
  const [addressId, setAddressId] = useState("new");
  const [lines, setLines] = useState<{ variantId: string; qty: number }[]>([]);
  const [pick, setPick] = useState("");

  const total = useMemo(() => lines.reduce((t, l) => t + (variants.find((v) => v.id === l.variantId)?.price ?? 0) * l.qty, 0), [lines, variants]);
  const hasFresh = lines.some((l) => variants.find((v) => v.id === l.variantId)?.fresh);

  function find() {
    startLook(async () => {
      const r = await lookupCustomer(phone);
      setCust(r);
      setAddressId(r && r.found && r.addresses[0] ? r.addresses[0].id : "new");
    });
  }

  function add(id: string) {
    if (!id) return;
    setLines((p) => (p.some((l) => l.variantId === id) ? p.map((l) => (l.variantId === id ? { ...l, qty: l.qty + 1 } : l)) : [...p, { variantId: id, qty: 1 }]));
    setPick("");
  }

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1.3fr_1fr] *:min-w-0">
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="addressId" value={addressId} />

      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[14.5px] font-semibold">1 · Customer</h2>
          <div className="mt-3 flex gap-2">
            <input id="po-phone" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setCust(null); }} placeholder="10-digit mobile" className={`${input} w-52`} />
            <button type="button" onClick={find} disabled={phone.length !== 10 || looking} className={btnSm + " h-10"}><Search size={14} /> {looking ? "Looking…" : "Find"}</button>
          </div>
          {cust?.found && (
            <div className="mt-4 space-y-2">
              <p className="text-[13.5px]"><b>{cust.name || "Customer"}</b> · wallet {rupees(cust.wallet)}</p>
              {cust.addresses.map((a) => (
                <label key={a.id} className={cx("flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[13px]", addressId === a.id ? "border-ink bg-malai" : "border-line")}>
                  <input type="radio" name="_addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-0.5 accent-[var(--tulsi)]" />
                  <span>{a.text}{!a.fresh && <span className="ml-1 text-clay">· courier only</span>}</span>
                </label>
              ))}
              <label className={cx("flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-[13px]", addressId === "new" ? "border-ink bg-malai" : "border-line")}>
                <input type="radio" name="_addr" checked={addressId === "new"} onChange={() => setAddressId("new")} className="accent-[var(--tulsi)]" /> New address
              </label>
            </div>
          )}
          {cust && !cust.found && <p className="mt-3 text-[13px] text-ink-2">New customer. Their account is created with this order.</p>}
          {(cust && (!cust.found || addressId === "new")) && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {!cust.found && <input name="name" placeholder="Customer name" required className={`${input} sm:col-span-2`} aria-label="Customer name" />}
              <input name="line1" placeholder="House / flat, street" required className={`${input} sm:col-span-2`} aria-label="Address line 1" />
              <input name="line2" placeholder="Area / sector" className={input} aria-label="Area" />
              <input name="city" placeholder="City" required className={input} aria-label="City" />
              <input name="pincode" placeholder="Pincode" inputMode="numeric" maxLength={6} required className={input} aria-label="Pincode" />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[14.5px] font-semibold">2 · Products</h2>
          <div className="mt-3 flex gap-2">
            <select value={pick} onChange={(e) => add(e.target.value)} className={input} aria-label="Add a product">
              <option value="">Add a product…</option>
              {variants.map((v) => <option key={v.id} value={v.id} disabled={v.stock <= 0}>{v.name} · {v.label} · {rupees(v.price)}{v.stock <= 0 ? " (out of stock)" : ""}</option>)}
            </select>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {lines.map((l) => {
              const v = variants.find((x) => x.id === l.variantId)!;
              return (
                <li key={l.variantId} className="flex items-center gap-3 py-2.5 text-[13.5px]">
                  <span className="min-w-0 flex-1"><b className="font-semibold">{v.name}</b> · {v.label}</span>
                  <span className="inline-flex items-center rounded-lg border border-line">
                    <button type="button" onClick={() => setLines((p) => p.map((x) => (x.variantId === l.variantId ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))} className="grid h-8 w-8 place-items-center" aria-label="Less"><Minus size={13} /></button>
                    <span className="w-6 text-center tabular-nums">{l.qty}</span>
                    <button type="button" onClick={() => setLines((p) => p.map((x) => (x.variantId === l.variantId ? { ...x, qty: x.qty + 1 } : x)))} className="grid h-8 w-8 place-items-center" aria-label="More"><Plus size={13} /></button>
                  </span>
                  <span className="w-20 text-right font-semibold tabular-nums">{rupees(v.price * l.qty)}</span>
                  <button type="button" onClick={() => setLines((p) => p.filter((x) => x.variantId !== l.variantId))} className="rounded p-1 text-ink-3 hover:text-clay" aria-label="Remove"><Trash2 size={15} /></button>
                </li>
              );
            })}
            {lines.length === 0 && <li className="py-3 text-[13px] text-ink-3">No products yet.</li>}
          </ul>
        </section>
      </div>

      <aside className="space-y-4 self-start rounded-2xl border border-line bg-white p-5 xl:sticky xl:top-6">
        <h2 className="text-[14.5px] font-semibold">3 · Payment & delivery</h2>
        <label className="block text-[12.5px] font-semibold text-ink-2">Payment
          <select name="payment" defaultValue="COD" className={`${input} mt-1`}>
            <option value="COD">Cash / UPI on delivery</option>
            <option value="UPI_MANUAL">Already paid by UPI (mark paid)</option>
            <option value="WALLET">From Gaurgram wallet</option>
          </select>
        </label>
        {hasFresh && (
          <label className="block text-[12.5px] font-semibold text-ink-2">Morning delivery date
            <input type="date" name="deliverOn" min={earliest} defaultValue={earliest} className={`${input} mt-1`} />
          </label>
        )}
        <label className="block text-[12.5px] font-semibold text-ink-2">Note for rider
          <input name="note" className={`${input} mt-1`} />
        </label>
        <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="waiveFee" className="h-4 w-4 accent-[var(--tulsi)]" /> Waive delivery charge</label>
        <div className="flex items-end justify-between border-t border-line pt-4">
          <span className="text-[13px] text-ink-3">Items total</span>
          <span className="font-display text-[28px] leading-none tabular-nums">{rupees(total)}</span>
        </div>
        {state?.error && <p className="rounded-lg bg-clay-soft p-3 text-[13px] text-clay">{state.error}</p>}
        <button disabled={pending || !cust || !lines.length} className={`${btn} h-11 w-full`}>{pending ? "Placing…" : "Place phone order"}</button>
        <p className="text-[11.5px] text-ink-3">Delivery charge is added by the usual rules unless waived. The order is marked as a phone order with your name.</p>
      </aside>
    </form>
  );
}
