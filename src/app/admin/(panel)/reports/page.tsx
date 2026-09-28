import Link from "next/link";
import { Download } from "lucide-react";
import { adminPage } from "@/lib/auth";
import { addDays, prettyDate, today as istToday } from "@/lib/dates";
import { gstRegister, reportRange, salesByProduct, subscriberMonths } from "@/lib/reports";
import { cx, rupees } from "@/lib/format";
import { Card, PageHead, Table, btn, btnGhost, input, td } from "@/components/admin/ui";

export const metadata = { title: "Reports & GST" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  await adminPage("reports");
  const sp = await searchParams;
  const { from, to } = reportRange(sp.from, sp.to);
  const [sales, months, gst] = await Promise.all([salesByProduct(from, to), subscriberMonths(6), gstRegister(from, to)]);
  const t = istToday();
  const monthStart = t.slice(0, 8) + "01";
  const lastMonthEnd = addDays(monthStart, -1);
  const presets = [
    ["Last 7 days", addDays(t, -6), t],
    ["Last 30 days", addDays(t, -29), t],
    ["This month", monthStart, t],
    ["Last month", lastMonthEnd.slice(0, 8) + "01", lastMonthEnd],
  ] as const;
  const q = `from=${from}&to=${to}`;
  const orderRev = sales.days.reduce((s, d) => s + d.orders, 0);
  const subRev = sales.days.reduce((s, d) => s + d.subs, 0);
  const max = Math.max(1, ...sales.days.map((d) => d.orders + d.subs));
  const W = 720, H = 160, P = 30, bw = (W - P - 6) / sales.days.length;
  const gstTotal = gst.summary.reduce((s, r) => s + r.tax, 0);
  const maxSubs = Math.max(1, ...months.map((m) => Math.max(m.added, m.cancelled)));

  return (
    <>
      <PageHead title="Reports & GST" sub={`${prettyDate(from, { day: "numeric", month: "short", year: "numeric" })} – ${prettyDate(to, { day: "numeric", month: "short", year: "numeric" })}`}>
        <form className="flex flex-wrap items-center gap-2">
          <input type="date" name="from" defaultValue={from} className={`${input} w-40`} aria-label="From" />
          <input type="date" name="to" defaultValue={to} className={`${input} w-40`} aria-label="To" />
          <button className={btn}>Show</button>
        </form>
      </PageHead>
      <div className="mb-6 flex flex-wrap gap-2">
        {presets.map(([l, f, e]) => (
          <Link key={l} href={`/admin/reports?from=${f}&to=${e}`} className={cx("rounded-full px-3.5 py-1.5 text-[13px] font-medium", from === f && to === e ? "bg-ink text-white" : "bg-white text-ink-2 ring-1 ring-line hover:bg-malai")}>{l}</Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total revenue", rupees(sales.total)],
          ["One-time orders", rupees(orderRev)],
          ["Subscription deliveries", rupees(subRev)],
          ["GST included", rupees(gstTotal)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-[12.5px] font-semibold text-ink-3">{k}</p>
            <p className="mt-2 font-display text-[30px] leading-none tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <Card title="Revenue by day" className="mt-6" action={<span className="flex items-center gap-3 text-[12px] text-ink-3"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-tulsi" /> Subscriptions</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-ghee" /> Orders</span></span>}>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full min-w-[560px]" role="img" aria-label="Revenue by day">
            {[0, 0.5, 1].map((f) => {
              const y = H - f * (H - 8);
              return (
                <g key={f}>
                  <line x1={P} x2={W} y1={y} y2={y} stroke="var(--line)" />
                  <text x={P - 5} y={y + 4} textAnchor="end" fontSize="10" fill="var(--ink-3)">{Math.round((max * f) / 100) * 100 >= 1000 ? `${(Math.round((max * f) / 100) / 10).toFixed(1)}k` : Math.round((max * f) / 100) * 100}</text>
                </g>
              );
            })}
            {sales.days.map((d, i) => {
              const hs = (d.subs / max) * (H - 8);
              const ho = (d.orders / max) * (H - 8);
              const x = P + 3 + i * bw + bw * 0.15;
              const w = Math.max(1, bw * 0.7);
              return (
                <g key={d.date}>
                  <title>{`${prettyDate(d.date)}: ${rupees(d.subs)} subscriptions + ${rupees(d.orders)} orders`}</title>
                  <rect x={x} y={H - hs} width={w} height={hs} rx="1.5" fill="var(--tulsi)" />
                  <rect x={x} y={H - hs - ho} width={w} height={ho} rx="1.5" fill="var(--ghee)" />
                  {(sales.days.length <= 16 || i % Math.ceil(sales.days.length / 12) === 0) && <text x={x + w / 2} y={H + 15} textAnchor="middle" fontSize="9.5" fill="var(--ink-3)">{d.date.slice(8)}</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr] *:min-w-0">
        <Card title="Sales by product" pad={false} action={<a href={`/admin/export?type=sales&${q}`} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ghee-deep"><Download size={14} /> CSV</a>}>
          <Table head={["Product", "Size", "Order units", "Subscription units", "Revenue", "Share"]} empty={sales.list.length ? undefined : "No sales in this period."}>
            {sales.list.map((r) => (
              <tr key={r.product + r.size}>
                <td className={`${td} font-semibold`}>{r.product}</td>
                <td className={td}>{r.size}</td>
                <td className={`${td} tabular-nums`}>{r.orderUnits || "—"}</td>
                <td className={`${td} tabular-nums`}>{r.subUnits || "—"}</td>
                <td className={`${td} font-semibold tabular-nums`}>{rupees(r.revenue)}</td>
                <td className={td}>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-malai-2"><span className="block h-full bg-ghee" style={{ width: `${(r.revenue / (sales.total || 1)) * 100}%` }} /></span>
                    <span className="text-[12px] tabular-nums text-ink-3">{Math.round((r.revenue / (sales.total || 1)) * 100)}%</span>
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="Subscribers by month" pad={false} action={<a href="/admin/export?type=subscribers" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ghee-deep"><Download size={14} /> CSV</a>}>
          <Table head={["Month", "Started", "Cancelled", "Active at end", "Lost"]}>
            {months.map((m) => (
              <tr key={m.month}>
                <td className={`${td} font-semibold`}>{m.label}</td>
                <td className={td}><span className="flex items-center gap-2"><span className="h-2 rounded-full bg-tulsi" style={{ width: `${(m.added / maxSubs) * 48 + 2}px` }} /><span className="tabular-nums">{m.added}</span></span></td>
                <td className={td}><span className="flex items-center gap-2"><span className="h-2 rounded-full bg-clay" style={{ width: `${(m.cancelled / maxSubs) * 48 + 2}px` }} /><span className="tabular-nums">{m.cancelled}</span></span></td>
                <td className={`${td} tabular-nums`}>{m.end}</td>
                <td className={cx(td, "tabular-nums", m.churn > 5 ? "font-semibold text-clay" : "text-ink-3")}>{m.churn}%</td>
              </tr>
            ))}
          </Table>
          <p className="border-t border-line px-4 py-3 text-[12px] text-ink-3">“Lost” is cancellations as a share of subscribers at the start of the month. Above 5% is worth a call to find out why.</p>
        </Card>
      </div>

      <Card title="GST summary" className="mt-6" pad={false} action={<a href={`/admin/export?type=gst&${q}`} className={`${btnGhost} h-8 px-3 text-[12.5px]`}><Download size={14} /> Download GST register (CSV)</a>}>
        <Table head={["GST rate", "Sales incl. GST", "Taxable value", "GST"]} empty={gst.summary.length ? undefined : "No sales in this period."}>
          {gst.summary.map((r) => (
            <tr key={r.rate}>
              <td className={`${td} font-semibold`}>{r.rate}%</td>
              <td className={`${td} tabular-nums`}>{rupees(r.gross)}</td>
              <td className={`${td} tabular-nums`}>{rupees(r.taxable)}</td>
              <td className={`${td} font-semibold tabular-nums`}>{rupees(r.tax)}</td>
            </tr>
          ))}
        </Table>
        <p className="border-t border-line px-4 py-3 text-[12px] text-ink-3">
          Prices include GST, so taxable value is price ÷ (1 + rate). Rates are set per product in Products → GST rate; delivery charges are taken at 18%.
          Confirm rates and the CGST/SGST vs IGST split with your CA before filing. The register lists {gst.lines.length} lines.
        </p>
      </Card>
    </>
  );
}
