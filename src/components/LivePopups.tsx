"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cx } from "@/lib/format";

type Popup = { id: string; kind: string; badge: string; title: string; subtitle: string };

const FIRST_DELAY = 9000;
const SHOW_FOR = 7000;
const GAP = 22000;
const MAX_PER_VISIT = 4;

/** Pop-ups driven by the admin Pop-up Manager: production log, verified reviews, info. */
export default function LivePopups({ items }: { items: Popup[] }) {
  const [current, setCurrent] = useState<Popup | null>(null);
  const [off, setOff] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem("gg_popups_off") === "1";
    } catch {
      return false;
    }
  });
  const path = usePathname();
  const blocked = path.startsWith("/checkout") || path.startsWith("/admin") || path.startsWith("/login");

  useEffect(() => {
    if (off || blocked || items.length === 0) return;
    let i = 0;
    let shown = 0;
    let t: ReturnType<typeof setTimeout>;
    const max = window.innerWidth < 640 ? 2 : MAX_PER_VISIT;
    const next = () => {
      if (shown >= max) return;
      setCurrent(items[i % items.length]);
      i++;
      shown++;
      t = setTimeout(() => {
        setCurrent(null);
        t = setTimeout(next, GAP);
      }, SHOW_FOR);
    };
    t = setTimeout(next, FIRST_DELAY);
    return () => clearTimeout(t);
  }, [items, off, blocked]);

  const dismiss = () => {
    setCurrent(null);
    setOff(true);
    try {
      sessionStorage.setItem("gg_popups_off", "1");
    } catch {}
  };

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] left-3 z-[55] lg:bottom-6 lg:left-6" aria-live="polite">
      <AnimatePresence>
        {current && !blocked && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="pointer-events-auto flex max-w-[min(300px,calc(100vw-24px))] items-center gap-2.5 rounded-2xl border border-line bg-white/95 p-2 pr-2.5 sm:max-w-[360px] sm:gap-3 sm:p-2.5 sm:pr-3 shadow-[0_18px_40px_-18px_rgba(60,40,10,.45)] backdrop-blur"
          >
            <span
              className={cx(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[11px] font-bold tabular-nums sm:h-12 sm:w-12 sm:text-[12px]",
                current.kind === "REVIEW" ? "bg-tulsi-soft text-tulsi" : current.kind === "INFO" ? "bg-clay-soft text-clay" : "bg-ghee-soft text-ghee-deep",
              )}
            >
              {current.badge}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
                {current.kind === "PRODUCTION" && <span className="h-1.5 w-1.5 rounded-full bg-tulsi" />}
                {current.kind === "PRODUCTION" ? "Live from the goshala" : current.kind === "REVIEW" ? "Verified review" : "Good to know"}
              </span>
              <b className="block text-[12.5px] font-semibold leading-snug sm:text-[13.5px]">{current.title}</b>
              <span className="hidden text-[12px] text-ink-3 sm:block">{current.subtitle}</span>
            </span>
            <button type="button" onClick={dismiss} className="self-start rounded-full p-1 text-ink-3 hover:bg-malai" aria-label="Hide these messages">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
