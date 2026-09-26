"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cx } from "@/lib/format";

/** Hand-drawn cut-outs that drift with the scroll: ghee drops, tulsi, wheat, marigold, honeycomb. */
export function GheeDrop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 52" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="gd" cx="0.35" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#f7d27a" />
          <stop offset="0.6" stopColor="#d99a2b" />
          <stop offset="1" stopColor="#a86f12" />
        </radialGradient>
      </defs>
      <path d="M20 2 C28 16 36 25 36 34 A16 16 0 0 1 4 34 C4 25 12 16 20 2 Z" fill="url(#gd)" />
      <ellipse cx="13" cy="32" rx="3.5" ry="6" fill="#fff" opacity=".55" transform="rotate(-18 13 32)" />
    </svg>
  );
}

export function Tulsi({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" className={className} aria-hidden="true">
      <path d="M40 68 C40 50 38 30 30 12" stroke="#4d7a3f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M36 44 C22 44 10 36 6 24 C20 22 32 30 36 44 Z" fill="#5f8f4b" />
      <path d="M38 34 C50 30 62 20 66 8 C52 8 40 18 38 34 Z" fill="#6f9f55" />
      <path d="M33 22 C24 18 18 10 18 2 C28 4 33 12 33 22 Z" fill="#7aa95f" />
      <path d="M36 44 C24 40 14 32 6 24" stroke="#3f6a33" strokeWidth=".8" fill="none" opacity=".5" />
      <path d="M38 34 C48 28 58 18 66 8" stroke="#3f6a33" strokeWidth=".8" fill="none" opacity=".5" />
    </svg>
  );
}

export function Wheat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 100" className={className} aria-hidden="true">
      <path d="M20 98 C20 70 21 40 22 8" stroke="#b98a3e" strokeWidth="1.6" fill="none" />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i} transform={`translate(${21 + i * 0.15} ${14 + i * 9})`}>
          <ellipse cx="-5" cy="0" rx="3.4" ry="7" fill="#d6ab5a" transform="rotate(-28)" />
          <ellipse cx="5" cy="0" rx="3.4" ry="7" fill="#c99c48" transform="rotate(28)" />
        </g>
      ))}
    </svg>
  );
}

export function Marigold({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <ellipse key={i} cx="30" cy="14" rx="6" ry="12" fill={i % 2 ? "#f0a324" : "#e38a14"} transform={`rotate(${i * 22.5} 30 30)`} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse key={"b" + i} cx="30" cy="20" rx="4" ry="8" fill="#f6b73c" transform={`rotate(${i * 36 + 12} 30 30)`} />
      ))}
      <circle cx="30" cy="30" r="6" fill="#c46a0c" />
    </svg>
  );
}

export function Honeycomb({ className }: { className?: string }) {
  const hex = "M0 -10 L8.7 -5 L8.7 5 L0 10 L-8.7 5 L-8.7 -5 Z";
  const cells = [[0, 0], [17.4, 0], [8.7, 15], [-8.7, 15], [26.1, 15], [17.4, 30]];
  return (
    <svg viewBox="-12 -12 52 56" className={className} aria-hidden="true">
      {cells.map(([x, y], i) => (
        <path key={i} d={hex} transform={`translate(${x} ${y})`} fill={i % 3 === 0 ? "#e2a93b" : "#f2c96b"} stroke="#b77d17" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

const SHAPES = { drop: GheeDrop, tulsi: Tulsi, wheat: Wheat, marigold: Marigold, comb: Honeycomb };

export type FloaterSpec = {
  shape: keyof typeof SHAPES;
  className: string; // position + size utilities
  depth?: number; // parallax strength in px over the section's scroll
  rotate?: number;
};

export default function Floaters({ items, className }: { items: FloaterSpec[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div ref={ref} className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {items.map((it, i) => (
        <Floater key={i} spec={it} progress={scrollYProgress} reduce={!!reduce} index={i} />
      ))}
    </div>
  );
}

function Floater({ spec, progress, reduce, index }: { spec: FloaterSpec; progress: ReturnType<typeof useScroll>["scrollYProgress"]; reduce: boolean; index: number }) {
  const depth = spec.depth ?? 80;
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : [depth, -depth]);
  const r = useTransform(progress, [0, 1], reduce ? [spec.rotate ?? 0, spec.rotate ?? 0] : [(spec.rotate ?? 0) - 12, (spec.rotate ?? 0) + 12]);
  const Shape = SHAPES[spec.shape];
  return (
    <motion.div style={{ y, rotate: r }} className={cx("absolute", spec.className)}>
      <div className="drift h-full w-full" style={{ animationDelay: `${-index * 1.7}s` }}>
        <Shape className="h-full w-full drop-shadow-[0_10px_14px_rgba(120,80,10,.18)]" />
      </div>
    </motion.div>
  );
}
