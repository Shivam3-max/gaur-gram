"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Sunrise, Truck, Wallet, CreditCard, Banknote, TicketPercent, Info } from "lucide-react";
import { useCart } from "../cart/CartProvider";
import ProductVisual from "../ProductVisual";
import AddressForm from "../account/AddressForm";
import { confirmOrderPayment, placeOrder, quoteCart } from "@/app/actions";
import { openRazorpay } from "../razorpay";
import { cx, rupees } from "@/lib/format";

type Addr = { id: string; label: string; name: string; line1: string; line2: string; city: string; pincode: string; fresh: boolean };

export default function CheckoutClient({ addresses: initial, wallet, userName, razorpayLive }: { addresses: Addr[]; wallet: number; userName: string; razorpayLive: boolean }) {
  const { items, clear, setPin } = useCart();
  const router = useRouter();
  const [addresses, setAddresses] = useState(initial);
  const [addressId, setAddressId] = useState(initial[0]?.id ?? "");
  const [adding, setAdding] = useState(initial.length === 0);
  const [payment, setPayment] = useState<"RAZORPAY" | "COD" | "WALLET">("RAZORPAY");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof quoteCart>> | null>(null);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const addr = addresses.find((a) => a.id === addressId);
  const lines = items.map((i) => ({ variantId: i.variantId, qty: i.qty }));
  const key = JSON.stringify(lines) + addr?.pincode + applied;

  useEffect(() => {
    if (!lines.length) return;
    let live = true;
    quoteCart(lines, addr?.pincode ?? null, applied).then((q) => live && setQuote(q));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-4xl">Your basket is empty</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white">Browse the shop</Link>
      </div>
    );
  }

  const fresh = items.filter((i) => i.delivery === "FRESH");
  const freshBlocked = fresh.length > 0 && addr && !addr.fresh;

  function submit() {
    setErr("");
    if (!addr) return setErr("Add a delivery address first.");
    start(async () => {
      const r = await placeOrder({ lines, addressId, payment, coupon: applied, note });
      if (!r.ok) return setErr(r.error);
      if (r.razorpay) {
        try {
          await openRazorpay({
            ...r.razorpay,
            description: `Order ${r.number}`,
            onSuccess: async (res) => {
              const c = await confirmOrderPayment(r.number, res.razorpay_order_id, res.razorpay_payment_id, res.razorpay_signature);
              clear();
              router.push(`/order/${r.number}${c.ok ? "" : "?payment=failed"}`);
            },
            onDismiss: () => router.push(`/order/${r.number}?payment=pending`),
          });
        } catch {
          router.push(`/order/${r.number}?payment=pending`);
        }
        return;
      }
      clear();
      router.push(`/order/${r.number}${r.demo ? "?demo=1" : ""}`);
    });
  }

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_400px] lg:gap-12 lg:pb-0 *:min-w-0">
      <div className="space-y-6">
        {/* Address */}
        <section className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
          <h2 className="flex items-center gap-3 font-display text-[26px]"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-sans text-[13px] font-bold text-white">1</span> Delivery address</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAddressId(a.id)}
                className={cx("relative rounded-2xl border-[1.5px] p-4 text-left transition", a.id === addressId ? "border-ink bg-malai" : "border-line hover:border-ink/30")}
              >
                {a.id === addressId && <Check size={16} className="absolute right-3 top-3 text-tulsi" />}
                <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">{a.label}</span>
                <b className="mt-1 block text-[15px]">{a.name}</b>
                <span className="block text-[13.5px] text-ink-2">{a.line1}{a.line2 && `, ${a.line2}`}, {a.city} {a.pincode}</span>
                <span className={cx("mt-2 inline-flex items-center gap-1 text-[12px] font-medium", a.fresh ? "text-tulsi" : "text-ink-3")}>
                  {a.fresh ? <><Sunrise size={13} /> Morning delivery area</> : <><Truck size={13} /> Courier delivery</>}
                </span>
              </button>
            ))}
            {!adding && (
              <button type="button" onClick={() => setAdding(true)} className="flex min-h-[60px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed sm:min-h-[120px] border-line text-[14px] font-semibold text-ink-2 hover:border-ink/30">
                <Plus size={17} /> Add new address
              </button>
            )}
          </div>
          {adding && (
            <div className="mt-5 border-t border-line pt-5">
              <AddressForm
                defaultName={userName}
                onCancel={addresses.length ? () => setAdding(false) : undefined}
                onSaved={(id, fresh, a) => {
                  setAdding(false);
                  setAddressId(id);
                  setAddresses((prev) => [...prev, { id, label: a.label, name: a.name, line1: a.line1, line2: a.line2 ?? "", city: a.city, pincode: a.pincode, fresh }]);
                  setPin({ code: a.pincode, area: "", city: a.city, fresh });
                }}
              />
            </div>
          )}
          {freshBlocked && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-clay-soft p-3.5 text-[13.5px] text-clay">
              <Info size={16} className="mt-0.5 shrink-0" />
              Milk, dahi, lassi and kheer are delivered fresh only in Chandigarh, Mohali, Panchkula and Zirakpur. Choose a Tricity address or remove them from your basket.
            </p>
          )}
        </section>

        {/* Payment */}
        <section className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
          <h2 className="flex items-center gap-3 font-display text-[26px]"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-sans text-[13px] font-bold text-white">2</span> Payment</h2>
          <div className="mt-5 space-y-2.5">
            {[
              { k: "RAZORPAY" as const, icon: CreditCard, t: "UPI, cards & netbanking", d: razorpayLive ? "Secure payment by Razorpay" : "Razorpay demo mode: no money is charged" },
              { k: "WALLET" as const, icon: Wallet, t: `Gaurgram wallet · ${rupees(wallet)}`, d: quote && wallet < quote.total ? "Balance too low for this order" : "Pay instantly from your balance", disabled: !quote || wallet < quote.total },
              { k: "COD" as const, icon: Banknote, t: "Cash / UPI on delivery", d: "Pay when your order arrives" },
            ].map((o) => (
              <button
                key={o.k}
                type="button"
                disabled={o.disabled}
                onClick={() => setPayment(o.k)}
                className={cx("flex w-full items-center gap-4 rounded-2xl border-[1.5px] p-4 text-left transition disabled:opacity-45", payment === o.k ? "border-ink bg-malai" : "border-line hover:border-ink/30")}
              >
                <span className={cx("grid h-5 w-5 place-items-center rounded-full border-2", payment === o.k ? "border-tulsi" : "border-line")}>{payment === o.k && <span className="h-2.5 w-2.5 rounded-full bg-tulsi" />}</span>
                <o.icon size={20} className="text-ink-2" />
                <span>
                  <b className="block text-[15px] font-semibold">{o.t}</b>
                  <span className="text-[13px] text-ink-3">{o.d}</span>
                </span>
              </button>
            ))}
          </div>
          <label className="mt-5 block">
            <span className="text-[13px] font-semibold">Note for the rider <span className="font-normal text-ink-3">(optional)</span></span>
            <input id="order-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Leave at the door, don't ring the bell" className="mt-1.5 h-12 w-full rounded-xl border border-line bg-malai px-3.5 text-[15px] outline-none focus:border-ghee focus:bg-white" />
          </label>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-[140px] lg:self-start">
        <div className="rounded-[24px] bg-malai p-5 sm:p-6">
          <h2 className="font-display text-[26px]">Order summary</h2>
          {fresh.length > 0 && <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2"><Sunrise size={14} className="text-ghee" /> Fresh items arrive {addr?.fresh === false ? "—" : "tomorrow, 6–8 AM"}</p>}
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={i.variantId} className="flex items-center gap-3 py-3">
                <span className="h-14 w-12 shrink-0 rounded-lg bg-white p-1"><ProductVisual pack={i.pack} liquid={i.liquid} label={i.labelColor} labelTitle={i.labelTitle} image={i.image} name={i.name} /></span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[14px] font-semibold">{i.name}</b>
                  <span className="text-[12.5px] text-ink-3">{i.label} × {i.qty}</span>
                </span>
                <span className="text-[14px] font-semibold tabular-nums">{rupees(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(coupon.trim().toUpperCase());
            }}
            className="mt-3 flex gap-2"
          >
            <label className="relative flex-1">
              <span className="sr-only">Coupon code</span>
              <TicketPercent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input id="coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon (try PEHLA10)" className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-[14px] uppercase outline-none placeholder:normal-case focus:border-ghee" />
            </label>
            <button className="h-11 rounded-xl border border-ink px-4 text-[13px] font-semibold">Apply</button>
          </form>
          {quote?.couponError && <p className="mt-2 text-[12.5px] text-clay">{quote.couponError}</p>}
          {quote?.coupon && <p className="mt-2 text-[12.5px] font-semibold text-tulsi">{quote.coupon} applied</p>}

          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-2">Items</dt><dd className="tabular-nums">{rupees(quote?.subtotal ?? 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">{quote?.local ? "Morning delivery" : "Shipping"}</dt><dd className="tabular-nums">{quote ? (quote.fee ? rupees(quote.fee) : "Free") : "…"}</dd></div>
            {!!quote?.discount && <div className="flex justify-between text-tulsi"><dt>Discount</dt><dd className="tabular-nums">−{rupees(quote.discount)}</dd></div>}
            <div className="flex justify-between border-t border-line pt-3 text-[17px] font-bold"><dt>To pay</dt><dd className="tabular-nums">{rupees(quote?.total ?? 0)}</dd></div>
          </dl>

          {err && <p className="mt-3 rounded-xl bg-clay-soft p-3 text-[13px] text-clay">{err}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={pending || !addr || !!freshBlocked || !quote}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-tulsi text-[16px] font-semibold text-white transition hover:bg-tulsi-deep disabled:opacity-40"
          >
            {pending ? "Placing order…" : payment === "COD" ? `Place order · ${rupees(quote?.total ?? 0)}` : `Pay ${rupees(quote?.total ?? 0)}`}
          </button>
          <p className="mt-3 text-center text-[12px] text-ink-3">By placing this order you agree to our <Link href="/policies/terms" className="underline">terms</Link>.</p>
        </div>
      </aside>

      {/* Phones: total and pay button stay at the bottom of the screen */}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-[#fbf8f1]/95 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur lg:hidden">
        {err && <p className="mb-2 rounded-lg bg-clay-soft px-3 py-2 text-[12.5px] text-clay">{err}</p>}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[12px] text-ink-3">{items.length} {items.length === 1 ? "item" : "items"}{quote?.discount ? ` · saved ${rupees(quote.discount)}` : ""}</p>
            <p className="font-display text-[24px] tabular-nums">{rupees(quote?.total ?? 0)}</p>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={pending || !addr || !!freshBlocked || !quote}
            className="h-12 shrink-0 rounded-xl bg-tulsi px-6 text-[15px] font-semibold text-white disabled:opacity-40"
          >
            {pending ? "Placing…" : payment === "COD" ? "Place order" : "Pay now"}
          </button>
        </div>
      </div>
    </div>
  );
}
