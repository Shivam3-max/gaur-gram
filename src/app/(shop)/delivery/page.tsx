import type { Metadata } from "next";
import { Sunrise, Truck } from "@/components/folk/icons";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import Folk from "@/components/folk/Folk";

export const metadata: Metadata = { title: "Delivery areas" };
export const dynamic = "force-dynamic";

export default async function DeliveryPage() {
  const [s, pins] = await Promise.all([getSettings(), db.pincode.findMany({ where: { active: true }, orderBy: [{ city: "asc" }, { code: "asc" }] })]);
  const byCity = pins.reduce<Record<string, typeof pins>>((m, p) => ((m[p.city] ??= []).push(p), m), {});
  return (
    <div className="container-x py-12">
      <span className="eyebrow">Delivery</span>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="mt-2 font-display text-[34px] min-[400px]:text-[40px] leading-none sm:text-[60px]">Where we deliver</h1>
        <Folk scene="cycle" label h="h-[96px]" />
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-[24px] bg-ghee-soft p-7">
          <Sunrise size={34} className="text-ghee-deep" />
          <h2 className="mt-3 font-display text-[28px]">Morning delivery · Tricity</h2>
          <p className="mt-2 text-[15px] text-ink-2">Milk, dahi, lassi, kheer, makhan and paneer arrive between 6 and 8 AM. Order or change by {Number(s.cutoffHour) - 12} PM the night before. Free above ₹{s.freeDeliveryAbove}, otherwise ₹{s.deliveryFee}.</p>
        </div>
        <div className="rounded-[24px] bg-tulsi-soft p-7">
          <Truck size={34} className="text-tulsi" />
          <h2 className="mt-3 font-display text-[28px]">Courier · All India</h2>
          <p className="mt-2 text-[15px] text-ink-2">Ghee, honey and cold-pressed oils ship to every pincode in 3–6 days. Free above ₹{s.freeShipAbove}, otherwise ₹{s.shipFee}.</p>
        </div>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(byCity).map(([city, list]) => (
          <div key={city}>
            <h3 className="font-display text-[24px]">{city}</h3>
            <ul className="mt-3 space-y-1.5 text-[14px]">
              {list.map((p) => <li key={p.code} className="flex justify-between gap-3 border-b border-line pb-1.5"><span className="text-ink-2">{p.area}</span><span className="font-mono text-[13px]">{p.code}</span></li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
