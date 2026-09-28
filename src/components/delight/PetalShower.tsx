"use client";

import { useEffect } from "react";

const COLORS = ["#f0a324", "#e38a14", "#f6b73c", "#d97706", "#fbbf24"];

/** Marigold petals fall once after an order is placed, like a welcome at the door. */
export default function PetalShower({ id }: { id: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const key = `gg_petals_${id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden";
    document.body.appendChild(layer);
    const count = window.innerWidth < 640 ? 22 : 38;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      const size = 10 + Math.random() * 12;
      const color = COLORS[i % COLORS.length];
      p.style.cssText = `position:absolute;top:-30px;left:${Math.random() * 100}%;width:${size}px;height:${size * 1.5}px`;
      p.innerHTML = `<svg viewBox="0 0 20 30" width="100%" height="100%"><path d="M10 0 C17 6 19 18 10 30 C1 18 3 6 10 0 Z" fill="${color}"/><path d="M10 3 L10 27" stroke="#b45309" stroke-width=".8" opacity=".5"/></svg>`;
      layer.appendChild(p);
      const drift = (Math.random() - 0.5) * 220;
      const spin = (Math.random() - 0.5) * 720;
      p.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 0 },
          { opacity: 1, offset: 0.08 },
          { transform: `translate(${drift * 0.6}px, ${window.innerHeight * 0.55}px) rotate(${spin * 0.6}deg)`, offset: 0.6 },
          { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${spin}deg)`, opacity: 0.8 },
        ],
        { duration: 2600 + Math.random() * 1800, delay: Math.random() * 900, easing: "cubic-bezier(.3,.2,.5,1)", fill: "forwards" },
      );
    }
    const t = setTimeout(() => layer.remove(), 5600);
    return () => {
      clearTimeout(t);
      layer.remove();
    };
  }, [id]);
  return null;
}
