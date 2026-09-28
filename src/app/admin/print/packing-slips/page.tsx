import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { currentAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { parseJSON, rupees } from "@/lib/format";
import PrintButton from "@/components/admin/PrintButton";
import { Mark } from "@/components/Logo";

/** Packing slips: ?ids=a,b for chosen orders, ?date=YYYY-MM-DD for that morning's Tricity orders, or all open orders. */
export default async function PackingSlips({ searchParams }: { searchParams: Promise<{ ids?: string; date?: string }> }) {
  const admin = await currentAdmin();
  if (!admin || !can(admin.role, "orders")) redirect("/admin");
  const sp = await searchParams;
  const where: Prisma.OrderWhereInput = sp.ids
    ? { id: { in: sp.ids.split(",").filter(Boolean) } }
    : sp.date
      ? { deliverOn: sp.date, status: { not: "CANCELLED" } }
      : { status: { in: ["PLACED", "CONFIRMED", "PACKED"] } };
  const [orders, s] = await Promise.all([
    db.order.findMany({ where, include: { user: true, items: { include: { variant: { include: { product: { include: { batches: { orderBy: { madeOn: "desc" }, take: 1 } } } } } } } }, orderBy: { createdAt: "asc" } }),
    getSettings(),
  ]);

  return (
    <>
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href="/admin/orders" className="text-[13px] font-semibold text-ghee-deep">← Back to orders</Link>
        <PrintButton label={`Print ${orders.length} slip${orders.length === 1 ? "" : "s"}`} />
      </div>
      {orders.length === 0 && <p className="text-[14px]">No orders to pack.</p>}
      {orders.map((o, i) => {
        const a = parseJSON<{ name?: string; line1?: string; line2?: string; landmark?: string; city?: string; state?: string; pincode?: string }>(o.address, {});
        return (
          <article key={o.id} className={`${i < orders.length - 1 ? "break-after mb-10 border-b border-dashed border-ink/40 pb-10" : ""}`}>
            <header className="flex items-start justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2.5">
                <Mark className="h-9 w-8" />
                <div>
                  <p className="font-display text-[22px] leading-none">Gaurgram</p>
                  <p className="text-[11px]">{s.address} · FSSAI {s.fssai}</p>
                </div>
              </div>
              <div className="text-right text-[12px]">
                <p className="font-mono text-[15px] font-bold">{o.number}</p>
                <p>{o.createdAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })} · {o.slot}</p>
                {o.source === "PHONE" && <p>Phone order{o.createdBy ? ` by ${o.createdBy}` : ""}</p>}
              </div>
            </header>
            <div className="mt-4 grid grid-cols-2 gap-6 text-[13px]">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider">Deliver to</p>
                <p className="mt-1 text-[15px] font-bold">{a.name}</p>
                <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                {a.landmark && <p>Near {a.landmark}</p>}
                <p>{a.city}{a.state ? `, ${a.state}` : ""} – {a.pincode}</p>
                <p className="mt-1 font-semibold">+91 {o.user.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider">Payment</p>
                {o.payment === "COD" && o.paymentStatus !== "PAID" ? (
                  <p className="mt-1 text-[18px] font-bold">Collect {rupees(o.total)}</p>
                ) : (
                  <p className="mt-1 text-[15px] font-bold">Prepaid · {rupees(o.total)}</p>
                )}
                {o.note && <p className="mt-2 rounded border border-ink/40 p-2 text-left text-[12px]">Note: {o.note}</p>}
              </div>
            </div>
            <table className="mt-5 w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-ink text-left text-[10.5px] uppercase tracking-wider"><th className="py-1.5">Item</th><th className="py-1.5">Batch</th><th className="py-1.5 text-right">Qty</th><th className="w-10 py-1.5 text-right">✓</th></tr>
              </thead>
              <tbody>
                {o.items.map((it) => (
                  <tr key={it.id} className="border-b border-ink/20">
                    <td className="py-2">{it.name} · {it.label}</td>
                    <td className="py-2 font-mono text-[11.5px]">{it.variant.product.delivery === "SHIP" ? (it.variant.product.batches[0]?.code ?? "—") : "Today’s"}</td>
                    <td className="py-2 text-right font-bold tabular-nums">{it.qty}</td>
                    <td className="py-2 text-right"><span className="inline-block h-4 w-4 border border-ink" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 flex justify-between text-[12px]">
              <p>Packed by: ____________________</p>
              <p>Glass packed with paper wrap ☐ · Ice gel ☐</p>
            </div>
          </article>
        );
      })}
    </>
  );
}
