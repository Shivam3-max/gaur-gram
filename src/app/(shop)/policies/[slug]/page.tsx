import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

const POLICIES: Record<string, { title: string; body: (s: Awaited<ReturnType<typeof getSettings>>) => string[] }> = {
  shipping: {
    title: "Shipping & delivery",
    body: (s) => [
      `Fresh products (milk, dahi, lassi, kheer, makhan, paneer) are delivered only in Chandigarh, Mohali, Panchkula and Zirakpur, between 6 and 8 AM. Orders and subscription changes for the next morning close at ${Number(s.cutoffHour) - 12} PM.`,
      `Ghee, honey and cold-pressed oils ship across India by courier and usually arrive in 3–6 working days. Shipping is free on orders above ₹${s.freeShipAbove}; otherwise a flat ₹${s.shipFee} applies.`,
      "Glass bottles carry a refundable deposit. Leave rinsed empties outside and our rider collects them with the next delivery.",
    ],
  },
  refunds: {
    title: "Returns & refunds",
    body: () => [
      "Because our products are fresh food, we can't accept returns once delivered. If anything arrives damaged, leaking or not as expected, send a photo on WhatsApp within 24 hours and we'll replace it or refund you.",
      "Missed subscription deliveries are never charged to your wallet. Unused wallet balance can be refunded to the original payment method on request.",
      "Refunds reach your account within 5–7 working days.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: () => [
      "We collect your name, mobile number, email and delivery addresses so we can deliver your orders and manage your subscription.",
      "Payments are processed by Razorpay. We never see or store your card or UPI details.",
      "We don't sell your data. We use WhatsApp and SMS only for order updates and, if you opt in, occasional offers.",
    ],
  },
  terms: {
    title: "Terms of use",
    body: (s) => [
      "Prices include all taxes. Product images are illustrative; natural products vary slightly in colour and texture from batch to batch.",
      "Raw milk must be boiled before consumption. Honey should not be given to infants under 12 months.",
      `Gaurgram operates under FSSAI Licence No. ${s.fssai}. Questions? Write to ${s.email}.`,
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = POLICIES[(await params).slug];
  return { title: p?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = POLICIES[(await params).slug];
  if (!p) notFound();
  const s = await getSettings();
  return (
    <div className="container-x py-14">
      <article className="mx-auto max-w-2xl">
        <span className="eyebrow">Policies</span>
        <h1 className="mt-2 font-display text-[34px] min-[400px]:text-[40px] sm:text-[46px] leading-tight">{p.title}</h1>
        <div className="mt-8 space-y-5 text-[16.5px] leading-relaxed text-ink-2">
          {p.body(s).map((t) => <p key={t}>{t}</p>)}
        </div>
      </article>
    </div>
  );
}
