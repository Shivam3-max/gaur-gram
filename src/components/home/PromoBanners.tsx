import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Folk from "../folk/Folk";
import { cx } from "@/lib/format";

type Banner = { id: string; title: string; subtitle: string; cta: string; href: string; image: string | null; tone: string };

const TONES: Record<string, { box: string; sub: string; btn: string; folk: string }> = {
  ghee: { box: "bg-ghee-soft text-ink", sub: "text-ink-2", btn: "bg-ink text-white hover:bg-ink/85", folk: "[--folk:#c9a26c]" },
  tulsi: { box: "bg-tulsi-soft text-ink", sub: "text-ink-2", btn: "bg-tulsi text-white hover:bg-tulsi-deep", folk: "[--folk:#8fb083]" },
  clay: { box: "bg-clay-soft text-ink", sub: "text-ink-2", btn: "bg-clay text-white hover:brightness-95", folk: "[--folk:#c9977a]" },
  ink: { box: "bg-ink text-white", sub: "text-white/75", btn: "bg-white text-ink hover:bg-malai", folk: "[--folk:#6b6250]" },
};

/** Scheduled promotions from Admin → Homepage & banners. */
export default function PromoBanners({ banners }: { banners: Banner[] }) {
  return (
    <section className="container-x pt-10 sm:pt-14" aria-label="Offers">
      <div className={cx("grid gap-4", banners.length > 1 && "lg:grid-cols-2")}>
        {banners.slice(0, 2).map((b) => {
          const t = TONES[b.tone] ?? TONES.ghee;
          const inner = (
            <div className={cx("relative flex min-h-[150px] items-center gap-4 overflow-hidden rounded-[26px] p-6 sm:p-8", t.box)}>
              <div className="relative z-10 min-w-0 flex-1">
                <p className="font-display text-[26px] leading-tight sm:text-[32px]">{b.title}</p>
                {b.subtitle && <p className={cx("mt-1.5 max-w-md text-[14.5px]", t.sub)}>{b.subtitle}</p>}
                {b.cta && (
                  <span className={cx("mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition", t.btn)}>
                    {b.cta} <ArrowRight size={16} />
                  </span>
                )}
              </div>
              {b.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt="" className="h-28 w-28 shrink-0 rounded-2xl object-cover sm:h-36 sm:w-44" />
              ) : (
                <Folk scene="jars" h="h-[84px] sm:h-[110px]" className={cx("shrink-0", t.folk)} />
              )}
            </div>
          );
          return b.href ? <Link key={b.id} href={b.href} className="block transition hover:-translate-y-0.5">{inner}</Link> : <div key={b.id}>{inner}</div>;
        })}
      </div>
    </section>
  );
}
