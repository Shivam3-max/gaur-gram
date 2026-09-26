"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import AutoVideo from "../AutoVideo";
import { cx } from "@/lib/format";

export type Story = {
  key: string;
  title: string;
  hindi: string;
  intro: string;
  video: string;
  poster: string;
  steps: { at: number; title: string; body: string }[];
};

/** Video on one side, the making steps on the other. Steps follow the video and clicking one jumps to it. */
export default function MakingShowcase({ stories, compact = false }: { stories: Story[]; compact?: boolean }) {
  const [k, setK] = useState(0);
  const [active, setActive] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const s = stories[k];

  if (!s) return null;

  function onTime(t: number) {
    let idx = 0;
    s.steps.forEach((st, i) => {
      if (t >= st.at) idx = i;
    });
    setActive((prev) => (prev === idx ? prev : idx));
  }

  function jump(i: number) {
    setActive(i);
    const v = video.current;
    if (v) {
      const at = s.steps[i].at;
      v.currentTime = Math.min(at, Math.max(0, (v.duration || at + 1) - 0.5));
      v.play().catch(() => {});
    }
  }

  return (
    <div>
      {stories.length > 1 && (
      <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="tablist" aria-label="Products">
        {stories.map((x, i) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={i === k}
            onClick={() => {
              setK(i);
              setActive(0);
            }}
            className={cx(
              "shrink-0 rounded-full border px-4 py-2 text-[14px] font-medium transition",
              i === k ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink/30",
            )}
          >
            {x.title} <span className={cx("ml-1 font-deva text-[13px]", i === k ? "text-white/70" : "text-ghee")}>{x.hindi}</span>
          </button>
        ))}
      </div>
      )}

      <div className={cx("grid overflow-hidden rounded-[28px] border border-line bg-white lg:grid-cols-[1.25fr_1fr]", compact ? "" : "lg:min-h-[460px] 2xl:min-h-[520px]")}>
        <div className="relative min-h-[300px] overflow-hidden bg-ink lg:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div key={s.key} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <AutoVideo ref={video} src={s.video} poster={s.poster} label={`How we make ${s.title}`} onTime={onTime} />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Step {active + 1} of {s.steps.length}</span>
              <p className="font-display text-2xl sm:text-3xl">{s.steps[active]?.title}</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] backdrop-blur sm:flex">
              <Play size={12} className="fill-white" /> Filmed at our goshala
            </span>
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <p className="font-deva text-[22px] text-ghee">{s.hindi}</p>
          <h3 className="font-display text-[28px] leading-tight sm:text-[32px] 2xl:text-[34px]">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.intro}</p>
          <ol className="mt-6 flex-1">
            {s.steps.map((st, i) => (
              <li key={st.title}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  className="group grid w-full grid-cols-[36px_1fr] gap-3 border-t border-line py-3.5 text-left"
                  aria-current={i === active ? "step" : undefined}
                >
                  <span
                    className={cx(
                      "mt-0.5 grid h-7 w-7 place-items-center rounded-full text-[12px] font-bold tabular-nums transition",
                      i === active ? "bg-ghee text-white" : i < active ? "bg-ghee-soft text-ghee-deep" : "bg-malai text-ink-3 group-hover:bg-malai-2",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <b className={cx("block text-[15px] font-semibold transition", i === active ? "text-ink" : "text-ink-2")}>{st.title}</b>
                    <span className={cx("block overflow-hidden text-[13.5px] leading-relaxed text-ink-3 transition-all", i === active ? "max-h-20 opacity-100" : "max-h-0 opacity-0 sm:max-h-20 sm:opacity-100")}>
                      {st.body}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {!compact && (
            <Link href={`/making#${s.key}`} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ghee-deep hover:gap-2.5">
              See the full process <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
