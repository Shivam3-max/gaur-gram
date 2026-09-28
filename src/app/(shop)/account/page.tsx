import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Package, MapPin, CheckCircle2, CalendarPlus } from "lucide-react";
import { Bottle } from "@/components/folk/icons";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { labelTitle } from "@/lib/catalog";
import { getSettings, num } from "@/lib/settings";
import { today as istToday, addDays, prettyDate } from "@/lib/dates";
import { describePattern, firstEditableDate, qtyOn } from "@/lib/schedule";
import { getHolidays } from "@/lib/holidays";
import { ORDER_STATUS, cx, rupees } from "@/lib/format";
import { razorpayEnabled } from "@/lib/razorpay";
import SubscriptionCard, { type SubData } from "@/components/account/SubscriptionCard";
import WalletCard from "@/components/account/WalletCard";
import LogoutButton from "@/components/account/LogoutButton";
import BottleFill from "@/components/delight/BottleFill";
import Folk from "@/components/folk/Folk";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ subscribed?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  const { subscribed } = await searchParams;
  const s = await getSettings();
  const cutoff = num(s.cutoffHour);
  const today = istToday();
  const earliest = firstEditableDate(cutoff);

  const holidays = await getHolidays();
  const upcomingHolidays = holidays.list.filter((h) => h.date >= today).map((h) => ({ date: h.date, note: h.note }));
  const [subs, orders, txns, addresses] = await Promise.all([
    db.subscription.findMany({
      where: { userId: user.id, status: { not: "CANCELLED" } },
      include: { variant: { include: { product: { include: { category: true } } } }, overrides: true, deliveries: true, address: true },
      orderBy: { createdAt: "asc" },
    }),
    db.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.walletTxn.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 40 }),
    db.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const subData: SubData[] = subs.map((x) => {
    const p = x.variant.product;
    return {
      id: x.id, pattern: x.pattern, qty: x.qty, weekQty: x.weekQty, startDate: x.startDate, status: x.status, pauseFrom: x.pauseFrom, pauseTo: x.pauseTo, slot: x.slot,
      product: { name: p.name, hindi: p.hindi, pack: p.pack, liquid: p.liquid, label: p.label, labelTitle: labelTitle(p.slug, p.category.hindi), tint: p.category.tint },
      variantLabel: x.variant.label,
      unitPrice: x.variant.subPrice ?? x.variant.price,
      overrides: Object.fromEntries(x.overrides.map((o) => [o.date, o.qty])),
      delivered: Object.fromEntries(x.deliveries.map((d) => [d.date, { qty: d.qty, status: d.status }])),
      address: `${x.address.line1}, ${x.address.city} ${x.address.pincode}`,
    };
  });

  // Average daily spend over the next week, for the "days left" estimate
  const week = Array.from({ length: 7 }, (_, i) => addDays(earliest, i));
  const dailySpend = Math.round(subData.reduce((t, x) => t + week.reduce((w, d) => w + qtyOn(x, d, x.overrides, holidays.set) * x.unitPrice, 0), 0) / 7);

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">My account</span>
          <h1 className="mt-1 font-display text-[36px] leading-none min-[400px]:text-[42px] sm:text-[54px]">Namaste, {user.name.split(" ")[0] || "friend"}</h1>
          <p className="mt-2 text-[14px] text-ink-3">+91 {user.phone}{user.email && ` · ${user.email}`}</p>
        </div>
        <LogoutButton />
      </div>

      {subscribed && (() => {
        const x = subData.find((y) => y.id === subscribed);
        return x ? (
          <BottleFill product={x.product.name.toLowerCase()} detail={`${x.variantLabel} · ${describePattern(x)} · starts ${prettyDate(x.startDate, { weekday: "short", day: "numeric", month: "short" })}, ${x.slot}.`} />
        ) : (
          <p className="mt-6 flex items-center gap-2 rounded-2xl bg-tulsi-soft p-4 text-[14px] font-medium text-tulsi"><CheckCircle2 size={18} /> Your subscription is set up.</p>
        );
      })()}

      <a href="#wallet" className="mt-5 flex items-center justify-between rounded-2xl border border-line bg-white p-4 lg:hidden">
        <span>
          <span className="block text-[12px] text-ink-3">Wallet balance</span>
          <span className={cx("font-display text-[26px] leading-none tabular-nums", user.wallet < 0 && "text-clay")}>{rupees(user.wallet)}</span>
        </span>
        <span className="rounded-xl bg-tulsi px-4 py-2.5 text-[13.5px] font-semibold text-white">Top up</span>
      </a>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_380px] *:min-w-0">
        <div className="space-y-6">
          {upcomingHolidays.filter((h) => h.date <= addDays(today, 14)).map((h) => (
            <p key={h.date} className="rounded-2xl border border-clay/20 bg-clay-soft px-4 py-3 text-[13.5px] text-clay">
              No deliveries on <b>{prettyDate(h.date, { weekday: "long", day: "numeric", month: "long" })}</b>{h.note ? ` (${h.note})` : ""}. Your plan skips it automatically and nothing is charged.
            </p>
          ))}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[30px]">Daily deliveries</h2>
            <Link href="/subscribe" className="flex items-center gap-1.5 text-[14px] font-semibold text-ghee-deep hover:underline"><CalendarPlus size={16} /> Add a product</Link>
          </div>
          {subData.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-line p-10 text-center">
              <Folk scene="cycle" h="h-[84px]" className="mb-4" />
              <p className="font-display text-[26px]">No daily deliveries yet</p>
              <p className="mt-2 text-[14px] text-ink-3">Get milk, dahi or lassi at your door every morning.</p>
              <Link href="/subscribe" className="mt-5 inline-block rounded-xl bg-tulsi px-5 py-3 text-[14px] font-semibold text-white">Start a subscription</Link>
            </div>
          ) : (
            subData.map((x) => <SubscriptionCard key={x.id} sub={x} today={today} earliest={earliest} cutoffHour={cutoff} holidays={upcomingHolidays} />)
          )}

          <h2 className="pt-4 font-display text-[30px]">Orders</h2>
          {orders.length === 0 ? (
            <p className="text-[14px] text-ink-3">No orders yet. <Link href="/shop" className="font-semibold text-ghee-deep">Start shopping</Link></p>
          ) : (
            <ul className="divide-y divide-line rounded-[26px] border border-line bg-white">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.number}`} className="flex flex-wrap items-center gap-4 p-5 hover:bg-malai">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-malai"><Package size={18} className="text-ink-2" /></span>
                    <span className="min-w-0 flex-1">
                      <b className="block font-mono text-[13.5px]">{o.number}</b>
                      <span className="block truncate text-[13px] text-ink-3">{o.items.map((i) => `${i.name} ${i.label} × ${i.qty}`).join(", ")}</span>
                    </span>
                    <span className={cx("rounded-full px-2.5 py-1 text-[12px] font-semibold", o.status === "DELIVERED" ? "bg-tulsi-soft text-tulsi" : o.status === "CANCELLED" ? "bg-malai-2 text-ink-3" : "bg-ghee-soft text-ghee-deep")}>{ORDER_STATUS[o.status]}</span>
                    <span className="w-20 text-right text-[14px] font-semibold tabular-nums">{rupees(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-6">
          <div id="wallet" className="scroll-mt-40" />
          <WalletCard
            balance={user.wallet}
            dailySpend={dailySpend}
            live={razorpayEnabled()}
            txns={txns.map((t) => ({ id: t.id, amount: t.amount, kind: t.kind, note: t.note, balance: t.balance, at: t.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) }))}
          />
          <section className="rounded-[26px] bg-malai p-5 sm:p-6">
            <span className="eyebrow flex items-center gap-2"><Bottle size={15} /> Glass bottles</span>
            <p className="mt-2 font-display text-[34px] leading-none">{user.bottlesOut} <span className="font-sans text-[14px] text-ink-3">with you</span></p>
            <p className="mt-2 text-[13px] text-ink-2">Rinse and leave empties outside your door. Our rider picks them up with the next delivery.</p>
          </section>
          <section className="rounded-[26px] border border-line bg-white p-5 sm:p-6">
            <span className="eyebrow flex items-center gap-2"><MapPin size={13} /> Addresses</span>
            <ul className="mt-3 space-y-3">
              {addresses.map((a) => (
                <li key={a.id} className="text-[13.5px]">
                  <b>{a.label}</b> · {a.name}
                  <span className="block text-ink-3">{a.line1}{a.line2 && `, ${a.line2}`}, {a.city} {a.pincode}</span>
                </li>
              ))}
              {addresses.length === 0 && <li className="text-[13.5px] text-ink-3">Add an address during checkout.</li>}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
