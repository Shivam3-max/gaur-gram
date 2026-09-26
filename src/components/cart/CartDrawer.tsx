"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, Sunrise, Truck, Recycle } from "lucide-react";
import { useCart } from "./CartProvider";
import AddButton from "./AddButton";
import ProductVisual from "../ProductVisual";
import { rupees } from "@/lib/format";
import Folk from "../folk/Folk";

export type Fees = { deliveryFee: number; freeDeliveryAbove: number; shipFee: number; freeShipAbove: number };

export function feesFor(subtotal: number, hasFresh: boolean, freshArea: boolean, f: Fees) {
  // Tricity addresses get local rider delivery; others pay courier shipping.
  if (hasFresh || freshArea) return subtotal >= f.freeDeliveryAbove ? 0 : f.deliveryFee;
  return subtotal >= f.freeShipAbove ? 0 : f.shipFee;
}

export default function CartDrawer({ fees }: { fees: Fees }) {
  const { open, setOpen, items, subtotal, mrpTotal, count, hasFresh, pin } = useCart();
  const freshArea = !!pin?.fresh;
  const fee = feesFor(subtotal, hasFresh, freshArea, fees);
  const threshold = hasFresh || freshArea ? fees.freeDeliveryAbove : fees.freeShipAbove;
  const left = Math.max(0, threshold - subtotal);
  const saved = mrpTotal - subtotal;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const fresh = items.filter((i) => i.delivery === "FRESH");
  const ship = items.filter((i) => i.delivery !== "FRESH");

  const Row = ({ i }: { i: (typeof items)[number] }) => (
    <li className="flex gap-3 py-3">
      <div className="h-[74px] w-[64px] shrink-0 overflow-hidden rounded-xl bg-malai p-1.5">
        <ProductVisual pack={i.pack} liquid={i.liquid} label={i.labelColor} labelTitle={i.labelTitle} image={i.image} name={i.name} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="truncate text-[14px] font-semibold">{i.name}</Link>
        <span className="text-[12px] text-ink-3">{i.label}</span>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[14px] font-bold tabular-nums">{rupees(i.price * i.qty)}</span>
          <AddButton item={i} />
        </div>
      </div>
    </li>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-ink/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[430px] flex-col bg-malai"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <div>
                <h2 className="font-display text-2xl">Your basket</h2>
                <p className="text-[12px] text-ink-3">{count} {count === 1 ? "item" : "items"}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-malai" aria-label="Close cart">
                <X size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <Folk scene="carry" h="h-[96px]" />
                <p className="font-display text-2xl">Your basket is empty</p>
                <p className="text-sm text-ink-3">Start with a jar of bilona ghee or tomorrow’s milk.</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white">
                  Browse the shop
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {left > 0 ? (
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-[13px]">Add <b>{rupees(left)}</b> more for free delivery</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-malai-2">
                        <div className="h-full rounded-full bg-tulsi transition-all" style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-tulsi-soft p-3.5 text-[13px] font-semibold text-tulsi">You’ve unlocked free delivery</div>
                  )}

                  {fresh.length > 0 && (
                    <section className="rounded-2xl bg-white px-4 pt-3">
                      <h3 className="flex items-center gap-2 text-[13px] font-semibold"><Sunrise size={15} className="text-ghee" /> Morning delivery · 6–8 AM</h3>
                      <ul className="divide-y divide-line">{fresh.map((i) => <Row key={i.variantId} i={i} />)}</ul>
                    </section>
                  )}
                  {ship.length > 0 && (
                    <section className="rounded-2xl bg-white px-4 pt-3">
                      <h3 className="flex items-center gap-2 text-[13px] font-semibold"><Truck size={15} className="text-tulsi" /> {freshArea || hasFresh ? "Delivered with your order" : "Shipped by courier · 3–6 days"}</h3>
                      <ul className="divide-y divide-line">{ship.map((i) => <Row key={i.variantId} i={i} />)}</ul>
                    </section>
                  )}

                  <div className="flex items-center gap-3 rounded-2xl bg-white p-4 text-[12.5px] text-ink-2">
                    <Recycle size={18} className="shrink-0 text-tulsi" />
                    Everything comes in glass or clay. Leave empty milk bottles out and our rider collects them.
                  </div>
                </div>

                <footer className="space-y-3 border-t border-line bg-white p-5">
                  <div className="space-y-1 text-[14px]">
                    <div className="flex justify-between"><span className="text-ink-2">Items</span><span className="tabular-nums">{rupees(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-2">Delivery</span><span className="tabular-nums">{fee ? rupees(fee) : "Free"}</span></div>
                    {saved > 0 && <div className="flex justify-between text-tulsi"><span>You save</span><span className="tabular-nums">{rupees(saved)}</span></div>}
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="flex h-14 items-center justify-between rounded-2xl bg-tulsi px-5 text-white transition hover:bg-tulsi-deep"
                  >
                    <span className="text-left leading-tight">
                      <span className="block text-[16px] font-bold tabular-nums">{rupees(subtotal + fee)}</span>
                      <span className="text-[11px] uppercase tracking-wider text-white/75">Total</span>
                    </span>
                    <span className="flex items-center gap-1 text-[15px] font-semibold">Proceed to checkout <ChevronRight size={18} /></span>
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
