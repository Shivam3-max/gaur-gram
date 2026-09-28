"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

/** Celebration after starting a subscription: milk pours in and fills the glass bottle. */
export default function BottleFill({ product, detail }: { product: string; detail: string }) {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setFull(true), reduce ? 0 : 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mt-6 flex items-center gap-5 overflow-hidden rounded-[26px] border border-tulsi/25 bg-tulsi-soft p-5 sm:p-6">
      <svg viewBox="0 0 80 120" className="h-[110px] w-auto shrink-0" aria-hidden="true">
        <defs>
          <clipPath id="bottle-clip">
            <path d="M31 22h18v12c0 7 13 10 13 20v52a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V54c0-10 13-13 13-20z" />
          </clipPath>
        </defs>
        {/* pouring stream */}
        <rect x="38.5" y="0" width="3" height="96" rx="1.5" fill="#fbfaf4" stroke="#d9d3c3" strokeWidth=".5" className={full ? "bottle-stream-stop" : "bottle-stream"} />
        <g clipPath="url(#bottle-clip)">
          <rect x="10" y="22" width="60" height="100" fill="#fff" />
          <rect x="10" width="60" height="100" fill="#fbfaf4" className="bottle-milk" style={{ transform: full ? "translateY(28px)" : "translateY(122px)" }} />
          <path d="M10 28 Q25 24 40 28 T70 28 V34 H10 Z" fill="#fffef9" className="bottle-milk" style={{ transform: full ? "translateY(0)" : "translateY(94px)" }} />
        </g>
        <path d="M31 22h18v12c0 7 13 10 13 20v52a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V54c0-10 13-13 13-20z" fill="none" stroke="#1c1a15" strokeOpacity=".22" strokeWidth="1.6" />
        <rect x="24" y="60" width="4" height="40" rx="2" fill="#fff" opacity=".8" />
        <rect x="29" y="12" width="22" height="11" rx="2.5" fill="#3d6b3a" className="bottle-cap" style={{ transform: full ? "translateY(0)" : "translateY(-14px)", opacity: full ? 1 : 0 }} />
      </svg>
      <div>
        <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-tulsi"><CheckCircle2 size={16} /> Subscription started</p>
        <p className="mt-1 font-display text-[26px] leading-tight sm:text-[30px]">Your first bottle of {product} is being filled.</p>
        <p className="mt-1 text-[14px] text-ink-2">{detail} Keep your wallet topped up so deliveries never stop.</p>
      </div>
    </div>
  );
}
