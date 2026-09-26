import { db } from "@/lib/db";
import { rupees } from "@/lib/format";
import { saveCoupon } from "../../actions";
import { Card, Field, PageHead, Pill, Table, btn, btnSm, input, td } from "@/components/admin/ui";

export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHead title="Coupons" sub="Codes customers type at checkout." />
      <Card title="Create or update a coupon">
        <form action={saveCoupon} className="grid items-end gap-3 md:grid-cols-[1fr_130px_110px_130px_1.5fr_auto_auto] *:min-w-0">
          <Field label="Code"><input name="code" required placeholder="DIWALI15" className={`${input} uppercase`} /></Field>
          <Field label="Type"><select name="kind" className={input}><option value="PERCENT">% off</option><option value="FLAT">₹ off</option></select></Field>
          <Field label="Value"><input name="value" required inputMode="numeric" className={input} /></Field>
          <Field label="Min. order ₹"><input name="minOrder" inputMode="numeric" defaultValue="0" className={input} /></Field>
          <Field label="Note"><input name="note" className={input} /></Field>
          <label className="flex h-10 items-center gap-2 text-[13px]"><input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[var(--tulsi)]" /> Active</label>
          <button className={btn}>Save</button>
        </form>
      </Card>
      <Card pad={false} className="mt-6">
        <Table head={["Code", "Discount", "Min. order", "Used", "Note", "Status", ""]}>
          {coupons.map((c) => (
            <tr key={c.id}>
              <td className={`${td} font-mono font-semibold`}>{c.code}</td>
              <td className={td}>{c.kind === "PERCENT" ? `${c.value}%` : rupees(c.value)}</td>
              <td className={`${td} tabular-nums`}>{rupees(c.minOrder)}</td>
              <td className={`${td} tabular-nums`}>{c.uses}</td>
              <td className={`${td} text-ink-2`}>{c.note}</td>
              <td className={td}>{c.active ? <Pill tone="good">Active</Pill> : <Pill>Off</Pill>}</td>
              <td className={`${td} text-right`}>
                <form action={saveCoupon}>
                  <input type="hidden" name="code" value={c.code} />
                  <input type="hidden" name="kind" value={c.kind} />
                  <input type="hidden" name="value" value={c.value} />
                  <input type="hidden" name="minOrder" value={c.minOrder} />
                  <input type="hidden" name="note" value={c.note} />
                  {!c.active && <input type="hidden" name="active" value="on" />}
                  <button className={btnSm}>{c.active ? "Turn off" : "Turn on"}</button>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
