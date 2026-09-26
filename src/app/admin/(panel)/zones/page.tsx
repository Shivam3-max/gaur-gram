import { db } from "@/lib/db";
import { savePincode, togglePincode } from "../../actions";
import { Card, Field, PageHead, btn, btnSm, input } from "@/components/admin/ui";
import { cx } from "@/lib/format";

export const metadata = { title: "Delivery zones" };

export default async function ZonesPage() {
  const pins = await db.pincode.findMany({ orderBy: [{ city: "asc" }, { code: "asc" }] });
  const byCity = pins.reduce<Record<string, typeof pins>>((m, p) => ((m[p.city] ??= []).push(p), m), {});
  return (
    <>
      <PageHead title="Delivery zones" sub={`${pins.filter((p) => p.active).length} pincodes get fresh morning delivery. Every other pincode can still order ghee, honey and oils by courier.`} />
      <Card title="Add a pincode">
        <form action={savePincode} className="grid items-end gap-3 sm:grid-cols-[140px_1fr_1fr_auto_auto] *:min-w-0">
          <Field label="Pincode"><input name="code" required inputMode="numeric" maxLength={6} className={input} /></Field>
          <Field label="Area"><input name="area" placeholder="Sector 70" className={input} /></Field>
          <Field label="City"><input name="city" placeholder="Mohali" className={input} /></Field>
          <label className="flex h-10 items-center gap-2 text-[13px]"><input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[var(--tulsi)]" /> Active</label>
          <button className={btn}>Add</button>
        </form>
      </Card>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(byCity).map(([city, list]) => (
          <Card key={city} title={`${city} · ${list.length}`} pad={false}>
            <ul className="divide-y divide-line">
              {list.map((p) => (
                <li key={p.code} className={cx("flex items-center justify-between gap-2 px-4 py-2.5", !p.active && "opacity-50")}>
                  <span className="text-[13px]"><b className="font-mono">{p.code}</b> <span className="text-ink-3">{p.area}</span></span>
                  <form action={togglePincode}><input type="hidden" name="code" value={p.code} /><button className={btnSm}>{p.active ? "Pause" : "Enable"}</button></form>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
