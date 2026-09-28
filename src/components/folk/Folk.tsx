"use client";

import { useEffect, useRef } from "react";
import { SCENES, type SceneKey } from "./scenes";
import { cx } from "@/lib/format";

/** Plays the SVG animations only while the element is on screen, and never when motion is reduced. */
function usePlayWhenVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const svgs = () => Array.from(el.querySelectorAll("svg"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svgs().forEach((s) => {
        s.setCurrentTime(0.4);
        s.pauseAnimations();
      });
      return;
    }
    svgs().forEach((s) => s.pauseAnimations());
    const io = new IntersectionObserver(([e]) => svgs().forEach((s) => (e.isIntersecting ? s.unpauseAnimations() : s.pauseAnimations())), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function SceneSvg({ scene, className }: { scene: SceneKey; className?: string }) {
  const s = SCENES[scene];
  return (
    <svg viewBox={`0 0 ${s.w} 100`} className={className} role="presentation" overflow="visible">
      {s.draw()}
    </svg>
  );
}

/**
 * One animated folk-art vignette, sized by height (`h`, a Tailwind height class) so tall and wide
 * scenes sit at the same scale. Colour comes from --folk. Decorative only, hidden from assistive tech.
 */
export default function Folk({ scene, className, h = "h-[110px]", label = false, align = "center" }: { scene: SceneKey; className?: string; h?: string; label?: boolean; align?: "left" | "center" | "right" }) {
  const ref = usePlayWhenVisible<HTMLDivElement>();
  const s = SCENES[scene];
  return (
    <div ref={ref} aria-hidden="true" className={cx("folk pointer-events-none flex select-none flex-col", align === "left" ? "items-start" : align === "right" ? "items-end" : "items-center", className)}>
      <div className={h}>
        <SceneSvg scene={scene} className="block h-full w-auto" />
      </div>
      {label && <span className="mt-2 block font-deva text-[13.5px] leading-none text-ghee-deep">{s.hindi}</span>}
    </div>
  );
}

export const PROCESS: SceneKey[] = ["milking", "carry", "boiling", "pouring", "bilona", "cooking", "jars", "cycle"];

/** A frieze of scenes on one ground line, telling the goshala-to-home story from left to right. */
export function Frieze({ scenes = PROCESS, className, labels = false, ground = true }: { scenes?: SceneKey[]; className?: string; labels?: boolean; ground?: boolean }) {
  const ref = usePlayWhenVisible<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden="true" className={cx("folk pointer-events-none select-none", className)}>
      {/* Phones: the scenes walk past as a slow procession instead of shrinking to fit */}
      <div className="overflow-hidden">
        <div className="frieze-track flex items-end justify-center gap-[2.5%]">
          {[0, 1].map((copy) =>
            scenes.map((k) => (
              <div key={`${copy}${k}`} className={cx("frieze-item min-w-0", copy === 1 && "hidden")} style={{ flex: `${SCENES[k].w} 1 0` }}>
                <SceneSvg scene={k} className="block h-auto w-full" />
              </div>
            )),
          )}
        </div>
      </div>
      {ground && <div className="mt-[1px] h-px w-full bg-current opacity-60" />}
      {labels && (
        <div className="mt-2 hidden justify-center gap-[2.5%] sm:flex">
          {scenes.map((k) => (
            <span key={k} className="min-w-0 text-center font-deva text-[13.5px] leading-none text-ghee-deep" style={{ flex: `${SCENES[k].w} 1 0` }}>
              {SCENES[k].hindi}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
