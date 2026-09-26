"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/lib/format";

/** One row of product cards: swipe on touch screens, arrow buttons on laptops and desktops. */
export default function ProductRail({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  const btn = "absolute top-[34%] z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-[0_10px_24px_-12px_rgba(60,40,10,.45)] transition hover:bg-malai disabled:pointer-events-none disabled:opacity-0 md:grid";

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={update}
        role="region"
        aria-label={label}
        className="no-scrollbar -mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto scroll-smooth px-5 pb-4 sm:gap-4 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {children}
      </div>
      <button type="button" onClick={() => go(-1)} disabled={edge.start} className={cx(btn, "-left-4")} aria-label="Previous products">
        <ChevronLeft size={20} />
      </button>
      <button type="button" onClick={() => go(1)} disabled={edge.end} className={cx(btn, "-right-4")} aria-label="More products">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
