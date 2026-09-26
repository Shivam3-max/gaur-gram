import Link from "next/link";
import { db } from "@/lib/db";
import { today as istToday } from "@/lib/dates";
import { saveBatch } from "../../actions";
import MediaField from "@/components/admin/MediaField";
import { Card, Field, PageHead, Pill, Table, btn, input, td } from "@/components/admin/ui";

export const metadata = { title: "Batches & lab reports" };

export default async function BatchesPage() {
  const [batches, products] = await Promise.all([
    db.batch.findMany({ include: { product: true }, orderBy: { madeOn: "desc" } }),
    db.product.findMany({ where: { delivery: "SHIP" }, orderBy: { sort: "asc" } }),
  ]);
  const t = istToday();
  return (
    <>
      <PageHead title="Batches & lab reports" sub="Every batch code printed on a jar can be traced by customers at /trace/CODE." />
      <div className="grid gap-6 xl:grid-cols-[1fr_400px] *:min-w-0">
        <Card pad={false}>
          <Table head={["Code", "Product", "Made", "Qty", "Result", "Report"]}>
            {batches.map((b) => (
              <tr key={b.id}>
                <td className={td}><Link href={`/trace/${b.code}`} target="_blank" className="font-mono text-[12.5px] font-semibold hover:underline">{b.code}</Link></td>
                <td className={td}>{b.product.name}</td>
                <td className={`${td} tabular-nums`}>{b.madeOn.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                <td className={td}>{b.quantity}</td>
                <td className={td}><Pill tone={b.result === "PASS" ? "good" : "bad"}>{b.result}</Pill></td>
                <td className={td}>{b.reportUrl ? <a href={b.reportUrl} target="_blank" rel="noreferrer" className="text-[12.5px] font-semibold text-ghee-deep hover:underline">PDF</a> : <span className="text-[12.5px] text-ink-3">Missing</span>}</td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Add a batch">
          <form action={saveBatch} className="space-y-3">
            <Field label="Batch code" hint="As printed on the label, e.g. GG-GHEE-261003A"><input name="code" required className={`${input} font-mono uppercase`} /></Field>
            <Field label="Product"><select name="productId" className={input}>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Made on"><input type="date" name="madeOn" defaultValue={t} required className={input} /></Field>
              <Field label="Milk collected"><input type="date" name="milkedOn" className={input} /></Field>
              <Field label="Batch size"><input name="quantity" placeholder="40 jars × 500 ml" className={input} /></Field>
              <Field label="Result"><select name="result" className={input}><option>PASS</option><option>FAIL</option></select></Field>
              <Field label="Purity / fat"><input name="fat" placeholder="99.6%" className={input} /></Field>
              <Field label="Moisture"><input name="moisture" placeholder="0.1%" className={input} /></Field>
            </div>
            <Field label="Lab name"><input name="lab" className={input} /></Field>
            <Field label="Lab report PDF"><MediaField name="reportUrl" accept="application/pdf" placeholder="Upload the PDF" /></Field>
            <Field label="Notes shown to customers"><input name="notes" placeholder="No vegetable fat detected…" className={input} /></Field>
            <button className={`${btn} w-full`}>Add batch</button>
          </form>
        </Card>
      </div>
    </>
  );
}
