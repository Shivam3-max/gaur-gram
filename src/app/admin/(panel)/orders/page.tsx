import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ORDER_STATUS, cx, parseJSON, rupees } from "@/lib/format";
import { setOrderStatus } from "../../actions";
import { Card, PageHead, Pill, btnSm, input } from "@/components/admin/ui";

export const metadata = { title: "Orders" };

const FILTERS = [["", "All"], ["open", "To fulfil"], ["DELIVERED", "Delivered"], ["CANCELLED", "Cancelled"]] as const;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const { s = "", q = "" } = await searchParams;
  const where: Prisma.OrderWhereInput = {};
  if (s === "open") where.status = { in: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] };
  else if (s) where.status = s;
  if (q) where.OR = [{ number: { contains: q.toUpperCase() } }, { user: { phone: { contains: q, mode: "insensitive" } } }, { user: { name: { contains: q, mode: "insensitive" } } }];
  const orders = await db.order.findMany({ where, include: { user: true, items: true }, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <>
      <PageHead title="Orders" sub={`${orders.length} shown`}>
        <form className="flex gap-2">
          {s && <input type="hidden" name="s" value={s} />}
          <input name="q" defaultValue={q} placeholder="Order no., phone or name" className={`${input} w-64`} />
        </form>
      </PageHead>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([k, l]) => (
          <Link key={k} href={`/admin/orders${k ? `?s=${k}` : ""}`} className={cx("rounded-full px-3.5 py-1.5 text-[13px] font-medium", s === k ? "bg-ink text-white" : "bg-white text-ink-2 ring-1 ring-line hover:bg-malai")}>{l}</Link>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map((o) => {
          const a = parseJSON<{ name?: string; line1?: string; city?: string; pincode?: string }>(o.address, {});
          return (
            <Card key={o.id} pad={false}>
              <div className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1.4fr_1fr_auto] lg:items-center *:min-w-0">
                <div>
                  <p className="font-mono text-[13px] font-semibold">{o.number}</p>
                  <p className="text-[12.5px] text-ink-3">{o.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                  <p className="mt-1 text-[13.5px]"><b>{o.user.name || "Customer"}</b> · {o.user.phone}</p>
                  <p className="text-[12.5px] text-ink-3">{a.line1}, {a.city} {a.pincode}</p>
                </div>
                <ul className="text-[13.5px]">
                  {o.items.map((i) => <li key={i.id}>{i.qty} × {i.name} <span className="text-ink-3">{i.label}</span></li>)}
                  {o.note && <li className="mt-1 text-[12.5px] italic text-ink-3">“{o.note}”</li>}
                </ul>
                <div className="space-y-1.5">
                  <p className="text-[16px] font-bold tabular-nums">{rupees(o.total)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Pill tone={o.paymentStatus === "PAID" ? "good" : "info"}>{o.payment} · {o.paymentStatus.toLowerCase()}</Pill>
                    <Pill tone="neutral">{o.slot}</Pill>
                  </div>
                </div>
                <form action={setOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={o.status} className={`${input} w-44`} aria-label={`Status of ${o.number}`}>
                    {Object.entries(ORDER_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <button className={btnSm}>Update</button>
                </form>
              </div>
            </Card>
          );
        })}
        {orders.length === 0 && <Card><p className="text-[14px] text-ink-3">No orders match.</p></Card>}
      </div>
    </>
  );
}
