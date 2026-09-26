import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Sprout, HandHeart, Ban, Users, ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
import AutoVideo from "@/components/AutoVideo";
import Reveal from "@/components/Reveal";
import Floaters from "@/components/Floaters";
import Folk, { Frieze } from "@/components/folk/Folk";

export const metadata: Metadata = { title: "Our goshala", description: "Meet the cows, the people and the farmers behind Gaurgram." };
export const dynamic = "force-dynamic";

const HERD = [
  { name: "Gauri", note: "Our eldest. Nine calves and still first in line at the fodder trough.", img: "/images/cow-desi.jpg" },
  { name: "Kamdhenu", note: "Calm, curious, and always the last to come in from grazing.", img: "/videos/cow-portrait.jpg" },
  { name: "Nandini", note: "Gives the creamiest milk in the shed. Loves jaggery.", img: "/images/cow-field.jpg" },
  { name: "Lakshmi", note: "Born here in 2021. Her mother Gauri still watches over her.", img: "/images/cows-sunset.jpg" },
];

export default async function GoshalaPage() {
  const s = await getSettings();
  return (
    <>
      <section className="container-x pt-8">
        <div className="relative isolate h-[70vh] min-h-[460px] overflow-hidden rounded-[32px] bg-ink">
          <AutoVideo src="/videos/cow-golden-grass.mp4" poster="/videos/cow-golden-grass.jpg" label="A cow grazing at the Gaurgram goshala" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-12">
            <p className="font-deva text-[24px] text-[#f1c46a]">हमारी गौशाला</p>
            <h1 className="mt-1 max-w-3xl font-display text-[34px] min-[400px]:text-[40px] leading-[1] sm:text-[72px]">A farm first. A brand second.</h1>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 pt-20 lg:grid-cols-[1fr_1.1fr] *:min-w-0">
        <Reveal>
          <span className="eyebrow">Our story</span>
          <h2 className="mt-2 font-display text-[38px] leading-tight sm:text-[48px]">We started by feeding our own family.</h2>
          <Folk scene="churn" label h="h-[150px]" align="left" className="mt-8" />
        </Reveal>
        <Reveal delay={0.1} className="space-y-5 text-[17px] leading-relaxed text-ink-2">
          <p>
            Gaurgram began as a small goshala {s.kmToCity} km outside the city, with a handful of desi cows kept the way our grandparents kept them:
            grazing in the open, fed on green fodder and mustard cake, milked by hand.
          </p>
          <p>
            Neighbours started asking for the milk, then the ghee. Today we look after {s.cows} cows and buffaloes and deliver to {s.families} families,
            but the rule hasn’t changed. If we wouldn’t serve it at our own table, it doesn’t leave the farm.
          </p>
          <p>
            Our honey comes from hives on the edge of our fields, and our oils are pressed from seeds grown by farmers in the next villages, people we
            know by name and pay directly.
          </p>
        </Reveal>
      </section>

      <section className="khadi mt-20 py-16">
        <div className="container-x">
        <Frieze scenes={["grazing", "milking", "bilona", "cooking", "sowing", "kolhu", "bees"]} labels className="mx-auto mb-12 max-w-[1100px]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Ban, "No middleman", "From our shed to your door. No distributor, no dairy co-op, no repacking."],
            [Sprout, "Grazing, not feedlots", "Cows walk to pasture every day and eat green fodder grown on our land."],
            [HandHeart, "Calves come first", "Calves drink their fill before we milk. We only take what's left."],
            [Users, "Farmers paid directly", "Seeds for our oils and flowers for our bees come from families we know."],
          ].map(([I, t, d], i) => {
            const Icon = I as typeof Ban;
            return (
              <Reveal key={t as string} delay={i * 0.06}>
                <div className="h-full rounded-[24px] bg-white/80 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-ghee"><Icon size={20} /></span>
                  <h3 className="mt-4 text-[18px] font-semibold">{t as string}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{d as string}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        </div>
      </section>

      <section className="relative pt-24">
        <Floaters items={[{ shape: "wheat", className: "right-[4%] top-20 h-28 w-11 hidden md:block", rotate: 10 }, { shape: "marigold", className: "left-[3%] top-40 h-10 w-10 hidden md:block" }]} />
        <div className="container-x relative">
          <span className="eyebrow">Meet the herd</span>
          <h2 className="mt-2 font-display text-[40px] leading-tight sm:text-[52px]">Every cow has a name</h2>
          <p className="mt-1 font-deva text-[20px] text-ghee">हर गाय का एक नाम है</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HERD.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.07}>
                <figure>
                  <div className="arch relative aspect-[3/4] overflow-hidden bg-malai-2">
                    <Image src={c.img} alt={`${c.name}, one of our cows`} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <figcaption className="mt-4">
                    <b className="font-display text-[26px] font-normal">{c.name}</b>
                    <p className="text-[14px] text-ink-3">{c.note}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pt-24">
        <div className="grid overflow-hidden rounded-[32px] bg-malai lg:grid-cols-2">
          <div className="relative min-h-[320px]"><AutoVideo src="/videos/sowing.mp4" poster="/videos/sowing.jpg" label="Farmers sowing seeds" /></div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <Folk scene="carry" h="h-[90px]" align="left" className="mb-4" />
            <span className="eyebrow">Visit us</span>
            <h2 className="mt-2 font-display text-[38px] leading-tight sm:text-[46px]">Come and see for yourself</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
              We open the goshala to families on Sunday mornings. Watch the milking, try the bilona churn, and let the children feed the calves.
            </p>
            <p className="mt-5 text-[14px] text-ink-2">Book a visit on WhatsApp: <b className="select-all">{s.whatsapp}</b></p>
            <Link href="/making" className="mt-6 inline-flex w-fit items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-[14px] font-semibold text-white">Watch how we make it <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
