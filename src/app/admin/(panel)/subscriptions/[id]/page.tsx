import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { getHolidays } from "@/lib/holidays";
import { getSettings, num } from "@/lib/settings";
import { addDays, prettyDate, WEEKDAYS } from "@/lib/dates";
import { describePattern, firstEditableDate, isPaused, qtyOn } from "@/lib/schedule";
import { cx, parseJSON, rupees } from "@/lib/format";
import { adminEditSubscription, adminSetDay } from "../../../actions";
import { Card, Field, PageHead, Pill, btn, btnSm, input } from "@/components/admin/ui";

export const metadata = { title: "Edit subscription" };

export default async function EditSubscription({ params }: { params: Promise<{ id: string }> }) {
  await adminPage("subscriptions");
  const { id } = await params;
  const sub = await db.subscription.findUnique({ where: { id }, include: { user: true, address: true, variant: { include: { product: true } }, overrides: true } });
  if (!sub) notFound();
  const [holidays, s] = await Promise.all([getHolidays(), getSettings()]);
  const start = firstEditableDate(num(s.cutoffHour));
  const days = Array.from({ length: 21 }, (_, i) => addDays(start, i));
  const overrides = Object.fromEntries(sub.overrides.map((o) => [o.date, o.qty]));
  const week = parseJSON<number[]>(sub.weekQty, [0, 0, 0, 0, 0, 0, 0]);
  const unit = sub.variant.subPrice ?? sub.variant.price;

  return (
    <>
      <PageHead title={`${sub.user.name || "Customer"} · ${sub.variant.product.name}`} sub={<Link href="/admin/subscriptions" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft size={13} /> Subscriptions</Link>}>
        <Pill tone={sub.status === "ACTIVE" ? "good" : sub.status === "PAUSED" ? "warn" : "neutral"}>{sub.status.toLowerCase()}</Pill>
      </PageHead>
      <p className="-mt-3 mb-6 text-[13.5px] text-ink-2">+91 {sub.user.phone} · {sub.address.line1}, {sub.address.city} {sub.address.pincode} · wallet {rupees(sub.user.wallet)} · {sub.variant.label} at {rupees(unit)} · now: {describePattern(sub)}</p>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr] *:min-w-0">
        <Card title="Change the plan">
          <form action={adminEditSubscription} className="space-y-4">
            <input type="hidden" name="id" value={sub.id} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="How often">
                <select name="pattern" defaultValue={sub.pattern} className={input}>
                  <option value="DAILY">Every day</option>
                  <option value="ALTERNATE">Alternate days</option>
                  <option value="CUSTOM">Chosen weekdays</option>
                </select>
              </Field>
              <Field label="Quantity (daily/alternate)"><input name="qty" type="number" min={1} max={10} defaultValue={sub.qty} className={input} /></Field>
              <Field label="Slot">
                <select name="slot" defaultValue={sub.slot} className={input}><option>5–7 AM</option><option>6–8 AM</option></select>
              </Field>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-ink-2">Quantity per weekday (for “chosen weekdays”)</p>
              <div className="mt-1 grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((d, i) => (
                  <label key={d} className="text-center text-[11px] font-semibold text-ink-3">
                    {d}
                    <input name={`w${i}`} type="number" min={0} max={10} defaultValue={week[i] ?? 0} className={`${input} mt-1 px-1 text-center`} aria-label={`${d} quantity`} />
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Pause from" hint="Leave empty for no pause"><input type="date" name="pauseFrom" min={start} defaultValue={sub.pauseFrom ?? ""} className={input} /></Field>
              <Field label="Pause until" hint="Empty = until resumed"><input type="date" name="pauseTo" min={start} defaultValue={sub.pauseTo ?? ""} className={input} /></Field>
            </div>
            <button className={btn}>Save plan</button>
            <p className="text-[12px] text-ink-3">Saving re-activates the plan. To stop it completely, use Cancel on the subscriptions list.</p>
          </form>
        </Card>

        <Card title="Next three weeks" pad={false}>
          <ul className="divide-y divide-line">
            {days.map((d) => {
              const hol = holidays.list.find((h) => h.date === d);
              const q = qtyOn(sub, d, overrides, holidays.set);
              const changed = d in overrides;
              const paused = isPaused(sub, d);
              return (
                <li key={d} className={cx("flex flex-wrap items-center gap-3 px-4 py-2.5 text-[13.5px]", hol && "bg-clay-soft/50")}>
                  <span className="w-32 font-semibold">{prettyDate(d, { weekday: "short", day: "numeric", month: "short" })}</span>
                  <span className="w-28">
                    {hol ? <Pill tone="bad">Holiday{hol.note ? ` · ${hol.note}` : ""}</Pill> : paused ? <Pill tone="warn">Paused</Pill> : q ? <b className="tabular-nums">× {q}</b> : <span className="text-ink-3">No delivery</span>}
                    {changed && !hol && <span className="ml-1.5 text-[11px] text-ghee-deep">changed</span>}
                  </span>
                  {!hol && (
                    <form action={adminSetDay} className="ml-auto flex items-center gap-1.5">
                      <input type="hidden" name="id" value={sub.id} />
                      <input type="hidden" name="date" value={d} />
                      {[0, 1, 2, 3].map((n) => (
                        <button key={n} name="qty" value={n} className={cx(btnSm, "h-7 px-2", q === n && !paused && "border-ink bg-ink text-white hover:bg-ink")}>{n === 0 ? "Skip" : `×${n}`}</button>
                      ))}
                      {changed && <button name="clear" value="1" className={cx(btnSm, "h-7 px-2 text-ink-3")}>Reset</button>}
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
