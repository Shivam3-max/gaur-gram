import Image from "next/image";
import type { Metadata } from "next";
import { Calendar, Moon, Trunk, Potli } from "@/components/folk/icons";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { labelTitle } from "@/lib/catalog";
import { getSettings, num } from "@/lib/settings";
import { firstEditableDate } from "@/lib/schedule";
import { getHolidays } from "@/lib/holidays";
import SubscribeBuilder from "@/components/subscribe/SubscribeBuilder";
import Folk from "@/components/folk/Folk";

export const metadata: Metadata = {
  title: "Daily milk subscription",
  description: "Fresh desi cow milk, dahi, lassi and paneer delivered every morning in Chandigarh, Mohali, Panchkula and Zirakpur. Pick your days, skip anytime, pay from a wallet.",
};
export const dynamic = "force-dynamic";

type SP = Promise<{ product?: string; variant?: string; days?: string; qty?: string }>;

export default async function SubscribePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [s, user, rows] = await Promise.all([
    getSettings(),
    currentUser(),
    db.product.findMany({ where: { subscribable: true, active: true }, include: { variants: { orderBy: { sort: "asc" } }, category: true }, orderBy: { sort: "asc" } }),
  ]);
  const cutoff = num(s.cutoffHour);
  const [addresses, pins] = user
    ? await Promise.all([db.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }), db.pincode.findMany({ where: { active: true }, select: { code: true } })])
    : [[], []];
  const fresh = new Set(pins.map((p) => p.code));
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => !!v) as [string, string][]).toString();

  return (
    <>
      <section className="container-x pt-8">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-ink text-white">
          <Image src="/images/milk-pour-jug.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-55" priority />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="max-w-2xl p-6 sm:p-12 lg:p-16">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/65">Daily subscription · Tricity</span>
            <h1 className="mt-3 font-display text-[32px] leading-[1.02] min-[400px]:text-[36px] sm:text-[62px]">Fresh milk at your door, every morning.</h1>
            <p className="mt-2 font-deva text-[18px] text-[#f1c46a] sm:text-[22px]">रोज़ सुबह, ताज़ा दूध</p>
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3 text-[12.5px] leading-snug text-white/85 sm:mt-8 sm:gap-4 sm:text-[14px]">
              {[
                [Calendar, "Pick days and quantity"],
                [Moon, `Change tomorrow until ${cutoff > 12 ? cutoff - 12 : cutoff} PM`],
                [Trunk, "Pause while you travel"],
                [Potli, "Pay only for what's delivered"],
              ].map(([I, t]) => {
                const Icon = I as typeof Potli;
                return (
                  <span key={t as string} className="flex items-center gap-2 sm:gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 sm:h-9 sm:w-9"><Icon size={16} /></span>
                    {t as string}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pt-8 sm:pt-12">
        <SubscribeBuilder
          products={rows.map((p) => ({
            slug: p.slug, name: p.name, hindi: p.hindi, pack: p.pack, liquid: p.liquid, label: p.label, labelTitle: labelTitle(p.slug, p.category.hindi), tint: p.category.tint,
            variants: p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, subPrice: v.subPrice })),
          }))}
          initial={{ product: sp.product, variant: sp.variant, days: sp.days, qty: sp.qty ? Math.max(1, Math.min(10, Number(sp.qty) || 1)) : undefined }}
          earliest={firstEditableDate(cutoff)}
          cutoffHour={cutoff}
          user={user ? { name: user.name, wallet: user.wallet } : null}
          addresses={addresses.map((a) => ({ id: a.id, label: a.label, name: a.name, line1: a.line1, city: a.city, pincode: a.pincode, fresh: fresh.has(a.pincode) }))}
          loginNext={`/subscribe${qs ? "?" + qs : ""}`}
          holidays={(await getHolidays()).list.map((h) => h.date)}
        />
      </section>

      <section className="container-x pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[36px]">Questions people ask</h2>
          <Folk scene="milking" label h="h-[96px]" className="hidden sm:flex" />
        </div>
        <div className="mt-6 grid gap-x-10 md:grid-cols-2">
          {[
            ["How does the wallet work?", "Top up with UPI or card. Each morning's delivery is deducted only after it reaches you. If a delivery is skipped or missed, nothing is charged."],
            ["What if I forget to skip?", "You can change tomorrow's delivery until the nightly cut-off. After that the milk is already being bottled for you."],
            ["What about the glass bottles?", `There's a refundable deposit of ₹${s.bottleDeposit} per bottle. Rinse and leave the empties outside, and our rider collects them the next morning.`],
            ["Which areas do you deliver to?", "Chandigarh, Mohali, Panchkula and Zirakpur. Check your pincode from the location button at the top of the page."],
            ["Is the milk pasteurised?", "No. It is raw, chilled milk delivered within three hours of milking. Please boil it before drinking."],
            ["Can I cancel anytime?", "Yes. Cancel from your account and any unused wallet balance can be refunded to your original payment method."],
          ].map(([q, a]) => (
            <details key={q} className="group border-b border-line py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold">
                {q}
                <span className="text-[22px] font-light text-ink-3 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
