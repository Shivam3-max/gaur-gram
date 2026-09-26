import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { parseJSON } from "@/lib/format";
import MakingShowcase from "@/components/home/MakingShowcase";
import Floaters from "@/components/Floaters";
import Folk, { Frieze } from "@/components/folk/Folk";
import { STORY_SCENE } from "@/components/folk/forCategory";

export const metadata: Metadata = { title: "How we make it", description: "Watch how Gaurgram makes bilona ghee, fresh milk, matka dahi, raw honey and cold-pressed oils at our goshala." };
export const dynamic = "force-dynamic";

const SHOP: Record<string, string> = { ghee: "ghee", milk: "milk", dahi: "dahi", honey: "honey", oils: "oils" };

export default async function MakingPage() {
  const stories = await db.makingStory.findMany({ where: { active: true }, orderBy: { sort: "asc" } });

  return (
    <>
      <section className="khadi relative overflow-hidden">
        <Floaters items={[{ shape: "drop", className: "left-[8%] top-[30%] h-12 w-9 hidden md:block" }, { shape: "tulsi", className: "right-[10%] top-[18%] h-14 w-16 hidden md:block", rotate: 12 }]} />
        <div className="container-x relative py-16 text-center sm:py-24">
          <span className="eyebrow">How we make it</span>
          <h1 className="mx-auto mt-3 max-w-4xl font-display text-[36px] min-[400px]:text-[42px] leading-[1] sm:text-[76px]">Slow food, made the old way, filmed so you can see it.</h1>
          <p className="mt-4 font-deva text-[24px] text-ghee">हम कैसे बनाते हैं</p>
          <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Jump to product">
            {stories.map((s) => (
              <a key={s.key} href={`#${s.key}`} className="rounded-full border border-line px-4 py-2 text-[14px] font-medium hover:border-ink/30">{s.title}</a>
            ))}
          </nav>
          <Frieze labels className="mx-auto mt-14 max-w-[1000px]" />
        </div>
      </section>

      {stories.map((s, i) => {
        const steps = parseJSON<{ at: number; title: string; body: string }[]>(s.steps, []);
        return (
          <section key={s.key} id={s.key} className={i % 2 ? "khadi scroll-mt-32 py-20" : "scroll-mt-32 py-20"}>
            <div className="container-x">
              <div className="mb-10 grid items-end gap-8 lg:grid-cols-[1fr_1.1fr] *:min-w-0">
                <div>
                  <span className="eyebrow">Chapter {i + 1}</span>
                  <h2 className="mt-2 font-display text-[32px] min-[400px]:text-[38px] leading-none sm:text-[60px]">{s.title}</h2>
                  <p className="mt-2 font-deva text-[22px] text-ghee">{s.hindi}</p>
                  <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-2">{s.intro}</p>
                  {SHOP[s.key] && (
                    <Link href={`/shop?c=${SHOP[s.key]}`} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-[14px] font-semibold text-white">
                      Shop {s.title.toLowerCase()} <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
                <div className="arch-sm relative flex aspect-[16/9] items-end justify-center overflow-hidden border border-line bg-white px-8 pt-10 sm:aspect-[16/8]">
                  {STORY_SCENE[s.key] && <Folk scene={STORY_SCENE[s.key]} label h="h-[82%]" className="h-full justify-end pb-4" />}
                </div>
              </div>
              <MakingShowcase stories={[{ ...s, steps }]} compact />
            </div>
          </section>
        );
      })}
    </>
  );
}
