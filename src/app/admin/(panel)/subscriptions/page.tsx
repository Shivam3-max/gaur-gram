import Link from "next/link";
import { db } from "@/lib/db";
import { addDays, today as istToday } from "@/lib/dates";
import { describePattern, qtyOn } from "@/lib/schedule";
import { cx, rupees } from "@/lib/format";
import { adminSubscription } from "../../actions";
import { Card, PageHead, Pill, Table, btnSm, td } from "@/components/admin/ui";

export const metadata = { title: "Subscriptions" };

export default async function SubsPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s = "ACTIVE" } = await searchParams;
  const tomorrow = addDays(istToday(), 1);
  const subs = await db.subscription.findMany({
    where: s === "ALL" ? {} : { status: s },
    include: { user: true, address: true, variant: { include: { product: true } }, overrides: { where: { date: tomorrow } } },
    orderBy: { createdAt: "desc" },
  });
  const counts = await db.subscription.groupBy({ by: ["status"], _count: true });
  const count = (k: string) => counts.find((c) => c.status === k)?._count ?? 0;

  return (
    <>
      <PageHead title="Subscriptions" sub="Daily and custom-day plans. Customers manage their own calendars; you can pause or cancel here." />
      <div className="mb-4 flex flex-wrap gap-2">
        {[["ACTIVE", `Active · ${count("ACTIVE")}`], ["PAUSED", `Paused · ${count("PAUSED")}`], ["CANCELLED", `Cancelled · ${count("CANCELLED")}`], ["ALL", "All"]].map(([k, l]) => (
          <Link key={k} href={`/admin/subscriptions?s=${k}`} className={cx("rounded-full px-3.5 py-1.5 text-[13px] font-medium", s === k ? "bg-ink text-white" : "bg-white text-ink-2 ring-1 ring-line hover:bg-malai")}>{l}</Link>
        ))}
      </div>
      <Card pad={false}>
        <Table head={["Customer", "Product", "Plan", "Tomorrow", "Wallet", "Status", ""]} empty={subs.length ? undefined : "No subscriptions here."}>
          {subs.map((x) => {
            const t = qtyOn(x, tomorrow, Object.fromEntries(x.overrides.map((o) => [o.date, o.qty])));
            return (
              <tr key={x.id}>
                <td className={td}><b className="font-semibold">{x.user.name || "Customer"}</b><span className="block text-[12px] text-ink-3">{x.user.phone} · {x.address.city} {x.address.pincode}</span></td>
                <td className={td}>{x.variant.product.name}<span className="block text-[12px] text-ink-3">{x.variant.label} · {rupees(x.variant.subPrice ?? x.variant.price)}</span></td>
                <td className={td}>{describePattern(x)}<span className="block text-[12px] text-ink-3">{x.slot} · since {x.startDate}</span></td>
                <td className={`${td} font-semibold tabular-nums`}>{t ? `× ${t}` : <span className="text-ink-3">—</span>}</td>
                <td className={`${td} tabular-nums ${x.user.wallet < 200 ? "font-semibold text-clay" : ""}`}>{rupees(x.user.wallet)}</td>
                <td className={td}><Pill tone={x.status === "ACTIVE" ? "good" : x.status === "PAUSED" ? "warn" : "neutral"}>{x.status.toLowerCase()}{x.pauseFrom ? " (dates)" : ""}</Pill></td>
                <td className={`${td} text-right`}>
                  {x.status !== "CANCELLED" && (
                    <form action={adminSubscription} className="inline-flex gap-1.5">
                      <input type="hidden" name="id" value={x.id} />
                      {x.status === "ACTIVE" ? <button name="action" value="pause" className={btnSm}>Pause</button> : <button name="action" value="resume" className={btnSm}>Resume</button>}
                      <button name="action" value="cancel" className={`${btnSm} text-clay`}>Cancel</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
