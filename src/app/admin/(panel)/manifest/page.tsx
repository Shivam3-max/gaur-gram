import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { ChevronLeft, ChevronRight, CheckCircle2, Printer } from "lucide-react";
import { addDays, prettyDate, today as istToday } from "@/lib/dates";
import { buildManifest, litres } from "@/lib/manifest";
import { cx, rupees } from "@/lib/format";
import { markDelivered } from "../../actions";
import { Card, PageHead, Pill, btn, btnSm } from "@/components/admin/ui";

export const metadata = { title: "Delivery manifest" };

export default async function ManifestPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await adminPage("manifest");
  const today = istToday();
  const sp = await searchParams;
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : addDays(today, 1);
  const { stops, totals, holiday } = await buildManifest(date);
  // One doorstep per customer and address, even when they have several plans or an order too
  const doors = Object.values(
    stops.reduce<Record<string, { id: string; city: string; stops: typeof stops }>>((m, s) => {
      const id = `${s.userId}|${s.address}`;
      (m[id] ??= { id, city: s.city, stops: [] }).stops.push(s);
      return m;
    }, {}),
  );
  const byCity = doors.reduce<Record<string, typeof doors>>((m, d) => ((m[d.city] ??= []).push(d), m), {});
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const pendingCount = stops.filter((s) => !s.delivered).length;
  const milk = totals.reduce((t, x) => t + (x.name.toLowerCase().includes("milk") ? litres(x.label, x.qty) : 0), 0);
  const canDeliver = date <= today;

  return (
    <>
      <PageHead title="Delivery manifest" sub={`${prettyDate(date, { weekday: "long", day: "numeric", month: "long" })} · ${plural(doors.length, "doorstep")} · ${pendingCount} pending`}>
        <Link href={`/admin/manifest?date=${addDays(date, -1)}`} className={btnSm} aria-label="Previous day"><ChevronLeft size={15} /></Link>
        <Link href={`/admin/manifest?date=${today}`} className={btnSm}>Today</Link>
        <Link href={`/admin/manifest?date=${addDays(today, 1)}`} className={btnSm}>Tomorrow</Link>
        <Link href={`/admin/manifest?date=${addDays(date, 1)}`} className={btnSm} aria-label="Next day"><ChevronRight size={15} /></Link>
        <Link href={`/admin/print/route-sheet?date=${date}`} target="_blank" className={btnSm}><Printer size={14} /> Route sheet</Link>
        <Link href={`/admin/print/packing-slips?date=${date}`} target="_blank" className={btnSm}><Printer size={14} /> Order slips</Link>
        {canDeliver && pendingCount > 0 && (
          <form action={markDelivered}>
            <input type="hidden" name="date" value={date} />
            <button className={`${btn} bg-tulsi hover:bg-tulsi-deep`}><CheckCircle2 size={15} /> Mark all {pendingCount} delivered</button>
          </form>
        )}
      </PageHead>

      {holiday && (
        <p className="mb-5 rounded-xl bg-clay-soft px-4 py-3 text-[13.5px] font-medium text-clay">
          Delivery holiday{holiday.note ? `: ${holiday.note}` : ""}. Subscriptions are skipped; only one-time orders placed for this day are listed.
        </p>
      )}
      {!canDeliver && (
        <p className="mb-5 rounded-xl bg-ghee-soft px-4 py-3 text-[13.5px] text-ghee-deep">
          This is the production plan. Customers can still change {date === addDays(today, 1) ? "tomorrow" : "this day"} until the 10 PM cut-off, so totals may move until then.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr] *:min-w-0">
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card title="Production sheet">
            <p className="font-display text-[40px] leading-none tabular-nums">{milk.toFixed(1)} L</p>
            <p className="text-[12.5px] text-ink-3">fresh milk to bottle, before dahi and lassi</p>
            <ul className="mt-4 divide-y divide-line">
              {totals.map((t) => (
                <li key={t.name + t.label} className="flex justify-between py-2 text-[13.5px]">
                  <span>{t.name} <span className="text-ink-3">{t.label}</span></span>
                  <b className="tabular-nums">× {t.qty}</b>
                </li>
              ))}
              {totals.length === 0 && <li className="py-2 text-[13.5px] text-ink-3">No deliveries on this day.</li>}
            </ul>
          </Card>
          <Card title="Routes">
            <ul className="space-y-1.5 text-[13.5px]">
              {Object.entries(byCity).map(([city, list]) => (
                <li key={city} className="flex justify-between"><a href={`#${city}`} className="hover:underline">{city}</a><span className="tabular-nums text-ink-3">{plural(list.length, "drop")}</span></li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          {Object.entries(byCity).map(([city, list]) => (
            <Card key={city} title={`${city} · ${plural(list.length, "drop")}`} pad={false}>
              <ol id={city} className="divide-y divide-line">
                {list.map((door, i) => {
                  const s = door.stops[0];
                  const done = door.stops.every((x) => x.delivered);
                  const subWallet = door.stops.filter((x) => x.kind === "SUB").reduce((t, x) => t + x.items[0].amount, 0);
                  return (
                    <li key={door.id} className={cx("grid gap-3 px-5 py-4 sm:grid-cols-[28px_1.3fr_1fr_auto] sm:items-center", done && "bg-tulsi-soft/40")}>
                      <span className="hidden font-mono text-[12px] text-ink-3 sm:block">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold">{s.customer} <span className="font-normal text-ink-3">· {s.phone}</span></p>
                        <p className="truncate text-[13px] text-ink-2">{s.address}, {s.pincode}</p>
                        <p className="mt-1 flex flex-wrap gap-1.5">
                          <Pill tone="neutral">{s.slot}</Pill>
                          {door.stops.map((x) => x.kind === "ORDER" ? <Pill key={x.key} tone="info">Order {x.orderNumber}</Pill> : null)}
                          {door.stops.some((x) => x.kind === "SUB") && <Pill tone="neutral">Subscription</Pill>}
                          {subWallet > 0 && s.wallet < subWallet && <Pill tone="bad">Wallet {rupees(s.wallet)}</Pill>}
                        </p>
                      </div>
                      <ul className="text-[13.5px]">
                        {door.stops.flatMap((x) => x.items.map((it) => <li key={x.key + it.variantId}><b className="tabular-nums">{it.qty} ×</b> {it.name} <span className="text-ink-3">{it.label}</span></li>))}
                      </ul>
                      <div className="sm:text-right">
                        {done ? (
                          <Pill tone="good">Delivered</Pill>
                        ) : canDeliver ? (
                          <form action={markDelivered}>
                            <input type="hidden" name="date" value={date} />
                            {door.stops.filter((x) => !x.delivered).map((x) => <input key={x.key} type="hidden" name="key" value={x.key} />)}
                            <button className={btnSm}>Mark delivered</button>
                          </form>
                        ) : (
                          <Pill tone="warn">Scheduled</Pill>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          ))}
          {stops.length === 0 && <Card><p className="text-[14px] text-ink-3">No deliveries on this day.</p></Card>}
        </div>
      </div>
    </>
  );
}
