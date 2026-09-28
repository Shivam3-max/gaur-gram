import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { stockAlerts } from "@/lib/stock";
import { getHolidays } from "@/lib/holidays";
import { ArrowUpRight, Milk, Wallet, CalendarClock, ShoppingBag, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { addDays, istNow, prettyDate, today as istToday } from "@/lib/dates";
import { buildManifest, litres } from "@/lib/manifest";
import { ORDER_STATUS, rupees } from "@/lib/format";
import { Card, PageHead, Pill, Table, td } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

const istDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await adminPage("dashboard");
  const { denied } = await searchParams;
  const [alerts, holidays] = await Promise.all([can(admin.role, "stock") || can(admin.role, "batches") ? stockAlerts() : null, getHolidays()]);
  const today = istToday();
  const tomorrow = addDays(today, 1);
  const since = new Date(addDays(today, -15) + "T00:00:00+05:30");

  const [manifest, orders, deliveries, activeSubs, pausedSubs, customers, pending, recent, lowWallet] = await Promise.all([
    buildManifest(tomorrow),
    db.order.findMany({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } }, select: { total: true, createdAt: true } }),
    db.delivery.findMany({ where: { date: { gte: addDays(today, -14) }, status: "DELIVERED" }, select: { amount: true, date: true } }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "PAUSED" } }),
    db.user.count(),
    db.order.count({ where: { status: { in: ["PLACED", "CONFIRMED", "PACKED"] } } }),
    db.order.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 7 }),
    db.user.findMany({ where: { wallet: { lt: 300 }, subscriptions: { some: { status: "ACTIVE" } } }, orderBy: { wallet: "asc" }, take: 6 }),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const series = days.map((d) => ({
    d,
    orders: orders.filter((o) => istDate(o.createdAt) === d).reduce((t, o) => t + o.total, 0),
    subs: deliveries.filter((x) => x.date === d).reduce((t, x) => t + x.amount, 0),
  }));
  const todayRev = series[series.length - 1];
  const week = series.slice(-7).reduce((t, x) => t + x.orders + x.subs, 0);
  const max = Math.max(1, ...series.map((x) => x.orders + x.subs));
  const milkL = manifest.totals.reduce((t, x) => t + (x.name.toLowerCase().includes("milk") ? litres(x.label, x.qty) : 0), 0);

  const kpis = [
    { icon: Milk, label: "Milk needed tomorrow", value: `${milkL.toFixed(1)} L`, sub: `${manifest.stops.length} doorstep drops`, href: "/admin/manifest?date=" + tomorrow },
    { icon: Wallet, label: "Revenue today", value: rupees(todayRev.orders + todayRev.subs), sub: `${rupees(week)} in the last 7 days` },
    { icon: CalendarClock, label: "Active subscriptions", value: String(activeSubs), sub: `${pausedSubs} paused · ${customers} customers`, href: "/admin/subscriptions" },
    { icon: ShoppingBag, label: "Orders to fulfil", value: String(pending), sub: "Placed, confirmed or packed", href: "/admin/orders" },
  ];

  // Chart geometry
  const W = 640, H = 180, P = 28, bw = (W - P * 2) / series.length;
  const ticks = [0, 0.5, 1].map((f) => Math.round((max * f) / 100) * 100);

  return (
    <>
      <PageHead title={istNow().hour < 12 ? "Good morning" : istNow().hour < 17 ? "Good afternoon" : "Good evening"} sub={`${prettyDate(today, { weekday: "long", day: "numeric", month: "long" })} · Tomorrow's orders lock at 10 PM`}>
        <Link href={`/admin/manifest?date=${tomorrow}`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-tulsi px-4 text-[13.5px] font-semibold text-white">Open tomorrow’s manifest <ArrowUpRight size={15} /></Link>
      </PageHead>
      {denied && <p className="mb-5 rounded-xl bg-clay-soft px-4 py-3 text-[13.5px] text-clay">Your role doesn’t include that page. Ask the owner to change your role in Staff & roles.</p>}
      {(() => {
        const soon = holidays.list.filter((h) => h.date >= today && h.date <= addDays(today, 7));
        const items: { tone: string; text: React.ReactNode; href: string }[] = [];
        if (alerts) {
          const out = alerts.low.filter((v) => v.stock === 0).length;
          const low = alerts.low.length - out;
          if (out) items.push({ tone: "bg-clay-soft text-clay", text: <><b>{out}</b> out of stock</>, href: "/admin/stock" });
          if (low) items.push({ tone: "bg-ghee-soft text-ghee-deep", text: <><b>{low}</b> running low</>, href: "/admin/stock" });
          if (alerts.expired.length) items.push({ tone: "bg-clay-soft text-clay", text: <><b>{alerts.expired.length}</b> batch{alerts.expired.length > 1 ? "es" : ""} expired</>, href: "/admin/stock" });
          if (alerts.expiring.length) items.push({ tone: "bg-ghee-soft text-ghee-deep", text: <><b>{alerts.expiring.length}</b> batch{alerts.expiring.length > 1 ? "es" : ""} expiring within 30 days</>, href: "/admin/stock" });
        }
        for (const h of soon) items.push({ tone: "bg-[#e7eef7] text-[#2f5d8a]", text: <>No delivery {prettyDate(h.date, { weekday: "short", day: "numeric", month: "short" })}{h.note ? ` · ${h.note}` : ""}</>, href: "/admin/holidays" });
        return items.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {items.map((x, i) => <Link key={i} href={x.href} className={`rounded-full px-3.5 py-1.5 text-[13px] ${x.tone} hover:brightness-95`}>{x.text}</Link>)}
          </div>
        ) : null;
      })()}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const body = (
            <div className="h-full rounded-2xl border border-line bg-white p-5 transition hover:border-ink/20">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-[12.5px] font-semibold">{k.label}</span>
                <k.icon size={17} />
              </div>
              <p className="mt-3 font-display text-[34px] leading-none tabular-nums">{k.value}</p>
              <p className="mt-2 text-[12.5px] text-ink-3">{k.sub}</p>
            </div>
          );
          return k.href ? <Link key={k.label} href={k.href}>{body}</Link> : <div key={k.label}>{body}</div>;
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr] *:min-w-0">
        <Card title="Revenue, last 14 days" action={<span className="flex items-center gap-3 text-[12px] text-ink-3"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-tulsi" /> Subscriptions</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-ghee" /> Orders</span></span>}>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full min-w-[520px]" role="img" aria-label="Daily revenue chart">
              {ticks.map((t) => {
                const y = H - (t / max) * (H - 10);
                return (
                  <g key={t}>
                    <line x1={P} x2={W - 4} y1={y} y2={y} stroke="var(--line)" />
                    <text x={P - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--ink-3)">{t >= 1000 ? `${(t / 1000).toFixed(t % 1000 ? 1 : 0)}k` : t}</text>
                  </g>
                );
              })}
              {series.map((x, i) => {
                const hs = (x.subs / max) * (H - 10);
                const ho = (x.orders / max) * (H - 10);
                const cx0 = P + i * bw + bw * 0.18;
                const w = bw * 0.64;
                const last = i === series.length - 1;
                return (
                  <g key={x.d}>
                    <title>{`${prettyDate(x.d)}: ${rupees(x.subs)} subscriptions + ${rupees(x.orders)} orders`}</title>
                    <rect x={cx0} y={H - hs} width={w} height={Math.max(0, hs)} rx="2" fill="var(--tulsi)" opacity={last ? 1 : 0.85} />
                    <rect x={cx0} y={H - hs - ho} width={w} height={Math.max(0, ho)} rx="2" fill="var(--ghee)" opacity={last ? 1 : 0.85} />
                    {(i % 2 === 1 || last) && <text x={cx0 + w / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="var(--ink-3)">{x.d.slice(8)}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        <Card title="Tomorrow at the goshala" action={<Link href={`/admin/manifest?date=${tomorrow}`} className="text-[12.5px] font-semibold text-ghee-deep">Manifest →</Link>}>
          {manifest.totals.length === 0 ? <p className="text-[13.5px] text-ink-3">Nothing scheduled yet.</p> : (
            <ul className="space-y-2.5">
              {manifest.totals.map((t) => (
                <li key={t.name + t.label} className="flex items-center justify-between text-[14px]">
                  <span>{t.name} <span className="text-ink-3">· {t.label}</span></span>
                  <b className="tabular-nums">× {t.qty}</b>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr] *:min-w-0">
        <Card title="Latest orders" pad={false} action={<Link href="/admin/orders" className="text-[12.5px] font-semibold text-ghee-deep">All orders →</Link>}>
          <Table head={["Order", "Customer", "Status", "Payment", "Total"]}>
            {recent.map((o) => (
              <tr key={o.id}>
                <td className={td}><Link href={`/admin/orders?q=${o.number}`} className="font-mono text-[12.5px] font-semibold hover:underline">{o.number}</Link></td>
                <td className={td}>{o.user.name || o.user.phone}</td>
                <td className={td}><Pill tone={o.status === "DELIVERED" ? "good" : o.status === "CANCELLED" ? "neutral" : "warn"}>{ORDER_STATUS[o.status]}</Pill></td>
                <td className={td}><Pill tone={o.paymentStatus === "PAID" ? "good" : "info"}>{o.payment} · {o.paymentStatus.toLowerCase()}</Pill></td>
                <td className={`${td} font-semibold tabular-nums`}>{rupees(o.total)}</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="Low wallet balance" action={<AlertTriangle size={15} className="text-ghee" />}>
          {lowWallet.length === 0 ? <p className="text-[13.5px] text-ink-3">Every subscriber has enough balance.</p> : (
            <ul className="divide-y divide-line">
              {lowWallet.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2.5 text-[13.5px]">
                  <span><b className="font-semibold">{u.name || "Customer"}</b> <span className="text-ink-3">· {u.phone}</span></span>
                  <span className={`font-semibold tabular-nums ${u.wallet < 0 ? "text-clay" : ""}`}>{rupees(u.wallet)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[12px] text-ink-3">Send these customers a WhatsApp reminder to top up.</p>
        </Card>
      </div>
    </>
  );
}
