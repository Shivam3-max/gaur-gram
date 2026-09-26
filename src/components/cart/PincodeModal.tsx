"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X, Sunrise, Truck } from "lucide-react";
import { useCart } from "./CartProvider";

const CITIES = ["Chandigarh", "Mohali", "Panchkula", "Zirakpur"];

export default function PincodeModal() {
  const { pinOpen, setPinOpen, pin, setPin } = useCart();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pinOpen) setTimeout(() => input.current?.focus(), 80);
  }, [pinOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPinOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPinOpen]);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await fetch(`/api/pincode?code=${encodeURIComponent(code)}`);
      const d = await r.json();
      if (!d.ok) setErr(d.error ?? "Could not check that pincode.");
      else {
        setPin({ code: d.code, area: d.area, city: d.city, fresh: d.fresh });
      }
    } catch {
      setErr("Network problem. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {pinOpen && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPinOpen(false)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow">Delivery location</span>
                <h2 id="pin-title" className="mt-1 font-display text-3xl">Where should we deliver?</h2>
              </div>
              <button type="button" onClick={() => setPinOpen(false)} className="rounded-full p-2 hover:bg-malai" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={check} className="mt-5 flex gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Pincode</span>
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  ref={input}
                  id="pincode-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit pincode"
                  className="h-12 w-full rounded-xl border border-line bg-malai pl-10 pr-3 text-[15px] outline-none focus:border-ghee focus:bg-white"
                />
              </label>
              <button disabled={busy || code.length !== 6} className="h-12 rounded-xl bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40">
                {busy ? "Checking…" : "Check"}
              </button>
            </form>
            {err && <p className="mt-2 text-sm text-clay">{err}</p>}

            {pin && (
              <div className="mt-5 space-y-2.5 rounded-2xl border border-line p-4">
                <p className="text-sm font-semibold">
                  {pin.code}
                  {pin.fresh ? ` · ${pin.area}, ${pin.city}` : ""}
                </p>
                <p className={`flex items-center gap-2 text-sm ${pin.fresh ? "text-tulsi" : "text-ink-3"}`}>
                  <Sunrise size={16} />
                  {pin.fresh ? "Fresh milk, dahi, lassi & kheer: tomorrow 6–8 AM" : "Fresh dairy isn't available here yet"}
                </p>
                <p className="flex items-center gap-2 text-sm text-tulsi">
                  <Truck size={16} />
                  Ghee, honey & oils: {pin.fresh ? "next-day delivery" : "courier in 3–6 days"}
                </p>
                <button type="button" onClick={() => setPinOpen(false)} className="mt-2 h-11 w-full rounded-xl bg-tulsi text-sm font-semibold text-white">
                  Continue shopping
                </button>
              </div>
            )}

            <p className="mt-5 text-[13px] leading-relaxed text-ink-3">
              Fresh dairy now delivers across <b className="text-ink-2">{CITIES.join(", ")}</b>. Ghee, honey and cold-pressed oils ship all over India.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
