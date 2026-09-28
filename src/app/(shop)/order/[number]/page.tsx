import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock } from "lucide-react";
import { Sunrise, Truck, Bottle } from "@/components/folk/icons";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ORDER_STATUS, parseJSON, rupees } from "@/lib/format";
import Folk from "@/components/folk/Folk";
import PetalShower from "@/components/delight/PetalShower";

export const metadata: Metadata = { title: "Order placed" };

const STEPS = ["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ demo?: string; payment?: string }> }) {
  const { number } = await params;
  const { demo, payment } = await searchParams;
  const user = await currentUser();
  if (!user) notFound();
  const order = await db.order.findFirst({ where: { number, userId: user.id }, include: { items: true } });
  if (!order) notFound();
  const addr = parseJSON<{ name: string; line1: string; line2?: string; city: string; pincode: string }>(order.address, { name: "", line1: "", city: "", pincode: "" });
  const stepIdx = order.status === "SHIPPED" ? 3 : STEPS.indexOf(order.status);
  const paid = order.paymentStatus === "PAID";

  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          {paid || order.payment === "COD" ? <CheckCircle2 size={52} className="mx-auto text-tulsi" /> : <Clock size={52} className="mx-auto text-ghee" />}
          {(paid || order.payment === "COD") && <PetalShower id={order.number} />}
          <p className="mt-4 font-deva text-[22px] text-ghee">धन्यवाद</p>
          <h1 className="font-display text-[32px] min-[400px]:text-[38px] leading-tight sm:text-[56px]">{paid || order.payment === "COD" ? "Thank you, your order is in." : "Your order is waiting for payment"}</h1>
          <p className="mt-3 text-[16px] text-ink-2">
            Order <b className="font-mono">{order.number}</b> · {order.deliverOn ? <>fresh delivery <b>{order.slot}</b></> : <>ships in 3–6 days</>}
          </p>
          {demo && <p className="mx-auto mt-4 max-w-md rounded-xl border border-dashed border-ghee bg-ghee-soft p-3 text-[13px] text-ghee-deep">Demo mode: Razorpay keys aren’t set yet, so this payment was simulated and no money was charged.</p>}
          {payment === "pending" && <p className="mx-auto mt-4 max-w-md rounded-xl bg-clay-soft p-3 text-[13px] text-clay">The payment window was closed. Your order is saved; we’ll confirm it once payment is received.</p>}
          {payment === "failed" && <p className="mx-auto mt-4 max-w-md rounded-xl bg-clay-soft p-3 text-[13px] text-clay">We couldn’t verify the payment. If money was deducted, it will be refunded within 5–7 days.</p>}
        </div>

        <ol className="mt-12 grid grid-cols-5 gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="text-center">
              <span className={`mx-auto block h-1.5 rounded-full ${i <= stepIdx ? "bg-tulsi" : "bg-malai-2"}`} />
              <span className={`mt-2 block text-[11.5px] font-medium sm:text-[12.5px] ${i <= stepIdx ? "text-ink" : "text-ink-3"}`}>{ORDER_STATUS[s]}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <section className="rounded-[22px] border border-line bg-white p-6">
            <h2 className="eyebrow">Items</h2>
            <ul className="mt-3 divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 py-2.5 text-[14.5px]">
                  <span>{i.name} <span className="text-ink-3">· {i.label} × {i.qty}</span></span>
                  <span className="tabular-nums">{rupees(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-line pt-3 text-[14px]">
              <div className="flex justify-between"><dt className="text-ink-3">Delivery</dt><dd>{order.deliveryFee ? rupees(order.deliveryFee) : "Free"}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-tulsi"><dt>Discount {order.coupon && `(${order.coupon})`}</dt><dd>−{rupees(order.discount)}</dd></div>}
              <div className="flex justify-between text-[16px] font-bold"><dt>Total</dt><dd>{rupees(order.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-3">Payment</dt><dd>{order.payment === "COD" ? "On delivery" : order.payment === "WALLET" ? "Wallet" : "Razorpay"} · {paid ? "Paid" : "Pending"}</dd></div>
            </dl>
          </section>
          <section className="space-y-4 rounded-[22px] bg-malai p-6">
            <div>
              <h2 className="eyebrow">Delivering to</h2>
              <p className="mt-2 text-[15px] font-semibold">{addr.name}</p>
              <p className="text-[14px] text-ink-2">{addr.line1}{addr.line2 && `, ${addr.line2}`}, {addr.city} {addr.pincode}</p>
            </div>
            <p className="flex gap-3 text-[14px] text-ink-2">{order.deliverOn ? <Sunrise size={18} className="shrink-0 text-ghee" /> : <Truck size={18} className="shrink-0 text-tulsi" />}{order.deliverOn ? "Our rider will bring it between 6 and 8 AM. You'll get a WhatsApp message when it's on the way." : "We'll WhatsApp you the courier tracking link once it ships."}</p>
            <p className="flex gap-3 text-[14px] text-ink-2"><Bottle size={19} className="shrink-0 text-tulsi" /> Keep your glass bottles. Leave them out and we’ll collect them on the next delivery.</p>
          </section>
        </div>

        <Folk scene={order.deliverOn ? "cycle" : "jars"} label h="h-[96px]" className="mt-12" />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account" className="rounded-xl bg-ink px-6 py-3.5 text-[14px] font-semibold text-white">View my orders</Link>
          <Link href="/subscribe" className="rounded-xl border-[1.5px] border-tulsi px-6 py-3.5 text-[14px] font-semibold text-tulsi">Get milk every morning</Link>
        </div>
      </div>
    </div>
  );
}
