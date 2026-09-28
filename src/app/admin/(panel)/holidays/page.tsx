import { adminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { addDays, prettyDate, today as istToday } from "@/lib/dates";
import { deleteHoliday, saveHoliday } from "../../actions";
import { Card, Field, PageHead, Pill, Table, btn, btnSm, input, td } from "@/components/admin/ui";

export const metadata = { title: "Delivery holidays" };

export default async function HolidaysPage() {
  await adminPage("holidays");
  const today = istToday();
  const [upcoming, past, affected] = await Promise.all([
    db.holiday.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" } }),
    db.holiday.findMany({ where: { date: { lt: today } }, orderBy: { date: "desc" }, take: 10 }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <>
      <PageHead title="Delivery holidays" sub={`No morning deliveries on these days. All ${affected} active subscriptions skip them automatically, wallets aren't charged, and customers see it in their calendar.`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr] *:min-w-0">
        <Card title="Add a holiday">
          <form action={saveHoliday} className="grid gap-3 sm:grid-cols-2 *:min-w-0">
            <Field label="From"><input type="date" name="date" min={addDays(today, 1)} required className={input} /></Field>
            <Field label="Until" hint="Leave empty for a single day"><input type="date" name="to" min={addDays(today, 1)} className={input} /></Field>
            <Field label="Reason shown to customers" className="sm:col-span-2"><input name="note" placeholder="Diwali" maxLength={80} className={input} /></Field>
            <button className={`${btn} sm:col-span-2 sm:justify-self-start`}>Add holiday</button>
          </form>
          <p className="mt-4 text-[12.5px] text-ink-3">Tip: add festival holidays a week ahead so customers can plan. One-time orders placed for a holiday automatically move to the next delivery day.</p>
        </Card>

        <Card title="Upcoming" pad={false}>
          <Table head={["Date", "Reason", ""]} empty={upcoming.length ? undefined : "No holidays planned."}>
            {upcoming.map((h) => (
              <tr key={h.date}>
                <td className={`${td} font-semibold`}>{prettyDate(h.date, { weekday: "short", day: "numeric", month: "long" })}{h.date === addDays(today, 1) && <span className="ml-2"><Pill tone="warn">Tomorrow</Pill></span>}</td>
                <td className={td}>{h.note || <span className="text-ink-3">—</span>}</td>
                <td className={`${td} text-right`}>
                  <form action={deleteHoliday}><input type="hidden" name="date" value={h.date} /><button className={`${btnSm} text-clay`}>Remove</button></form>
                </td>
              </tr>
            ))}
          </Table>
          {past.length > 0 && <p className="border-t border-line px-4 py-3 text-[12px] text-ink-3">Recent: {past.map((h) => `${prettyDate(h.date)}${h.note ? ` (${h.note})` : ""}`).join(" · ")}</p>}
        </Card>
      </div>
    </>
  );
}
