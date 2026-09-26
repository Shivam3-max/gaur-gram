"use client";

import { useEffect, useRef } from "react";

/** A horizontal rail that scrolls its active item (data-active="true") into view on phones. */
export default function ActiveRail({ className, children, label }: { className?: string; children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>('[data-active="true"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const offset = active.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    nav.scrollTo({ left: offset - nav.clientWidth / 2 + active.offsetWidth / 2, behavior: "instant" });
  });
  return (
    <nav ref={ref} aria-label={label} className={className}>
      {children}
    </nav>
  );
}
