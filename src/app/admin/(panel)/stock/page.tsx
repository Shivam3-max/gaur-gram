import Link from "next/link";
import { AlertTriangle, PackageX } from "lucide-react";
import { adminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysLeft, stockAlerts } from "@/lib/stock";
import { cx } from "@/lib/format";
import { updateStock } from "../../actions";
import { Card, PageHead, Pill, Table, btnSm, input, td } from "@/components/admin/ui";

export const metadata = { title: "Stock & expiry" };

export default async function StockPage() {
  await adminPage("stock");
  const [alerts, variants] = await Promise.all([
    stockAlerts(),
    db.variant.findMany({ include: { product: { include: { category: true } } }, orderBy: [{ product: { sort: "asc" } }, { sort: "asc" }] }),
  ]);

  const StockForm = ({ id, stock }: { id: string; stock: number }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <form action={updateStock} className="flex gap-1.5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="mode" value="add" />
        <input name="value" inputMode="numeric" placeholder="+ qty" required className={`${input} h-8 w-20 text-[12.5px]`} aria-label="Add stock" />
        <button className={btnSm}>Restock</button>
      </form>
      <form action={updateStock} className="flex gap-1.5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="mode" value="set" />
        <input name="value" inputMode="numeric" defaultValue={stock} required className={`${input} h-8 w-20 text-[12.5px]`} aria-label="Exact stock" />
        <button className={btnSm}>Set</button>
      </form>
    </div>
  );

  return (
    <>
      <PageHead title="Stock & expiry" sub={`Low stock means ${alerts.threshold} or fewer left (change this in Site settings). Batch expiry dates come from Batches & lab reports.`} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { n: alerts.low.filter((v) => v.stock === 0).length, t: "Out of stock", tone: "text-clay" },
          { n: alerts.low.filter((v) => v.stock > 0).length, t: "Running low", tone: "text-ghee-deep" },
          { n: alerts.expired.length + alerts.expiring.length, t: "Batches expired or expiring in 30 days", tone: alerts.expired.length ? "text-clay" : "text-ghee-deep" },
        ].map((k) => (
          <div key={k.t} className="rounded-2xl border border-line bg-white p-5">
            <p className={cx("font-display text-[34px] leading-none tabular-nums", k.n ? k.tone : "text-tulsi")}>{k.n}</p>
            <p className="mt-2 text-[13px] text-ink-3">{k.t}</p>
          </div>
        ))}
      </div>

      {alerts.low.length > 0 && (
        <Card title="Needs restocking" className="mt-6" pad={false} action={<AlertTriangle size={15} className="text-ghee" />}>
          <Table head={["Product", "Size", "Left", "Update"]}>
            {alerts.low.map((v) => (
              <tr key={v.id}>
                <td className={`${td} font-semibold`}>{v.product.name}</td>
                <td className={td}>{v.label}</td>
                <td className={td}>{v.stock === 0 ? <Pill tone="bad">Out of stock</Pill> : <Pill tone="warn">{v.stock} left</Pill>}</td>
                <td className={td}><StockForm id={v.id} stock={v.stock} /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {(alerts.expired.length > 0 || alerts.expiring.length > 0) && (
        <Card title="Batch expiry" className="mt-6" pad={false} action={<PackageX size={15} className="text-clay" />}>
          <Table head={["Batch", "Product", "Expires", "Status"]}>
            {[...alerts.expired, ...alerts.expiring].map((b) => {
              const d = daysLeft(b.expiresOn!);
              return (
                <tr key={b.id}>
                  <td className={td}><Link href="/admin/batches" className="font-mono text-[12.5px] font-semibold hover:underline">{b.code}</Link></td>
                  <td className={td}>{b.product.name}</td>
                  <td className={`${td} tabular-nums`}>{b.expiresOn!.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className={td}>{d < 0 ? <Pill tone="bad">Expired {-d} days ago · remove from sale</Pill> : <Pill tone="warn">{d} days left</Pill>}</td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}

      <Card title="All stock" className="mt-6" pad={false}>
        <Table head={["Product", "Size", "Stock", "Update"]}>
          {variants.map((v) => (
            <tr key={v.id} className={v.product.active ? "" : "opacity-50"}>
              <td className={td}><b className="font-semibold">{v.product.name}</b><span className="block text-[12px] text-ink-3">{v.product.category.name}{v.product.active ? "" : " · hidden"}</span></td>
              <td className={td}>{v.label}</td>
              <td className={`${td} font-semibold tabular-nums ${v.stock === 0 ? "text-clay" : v.stock <= alerts.threshold ? "text-ghee-deep" : ""}`}>{v.stock}</td>
              <td className={td}><StockForm id={v.id} stock={v.stock} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
