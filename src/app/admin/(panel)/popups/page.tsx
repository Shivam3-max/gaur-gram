import { db } from "@/lib/db";
import { deletePopup, savePopup } from "../../actions";
import { Card, Field, PageHead, btn, btnSm, input } from "@/components/admin/ui";

export const metadata = { title: "Live pop-ups" };

const KINDS = [["PRODUCTION", "Live from the goshala"], ["REVIEW", "Verified review"], ["INFO", "Good to know"]];

export default async function PopupsPage() {
  const popups = await db.popup.findMany({ orderBy: { sort: "asc" } });
  const row = (p?: (typeof popups)[number]) => (
    <form action={savePopup} className="grid items-end gap-2 md:grid-cols-[150px_80px_1.4fr_1.4fr_auto_auto] *:min-w-0">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <Field label="Type"><select name="kind" defaultValue={p?.kind ?? "PRODUCTION"} className={input}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
      <Field label="Badge"><input name="badge" defaultValue={p?.badge ?? ""} maxLength={6} placeholder="5:40" className={input} /></Field>
      <Field label="Headline"><input name="title" defaultValue={p?.title ?? ""} required className={input} /></Field>
      <Field label="Small line"><input name="subtitle" defaultValue={p?.subtitle ?? ""} className={input} /></Field>
      <label className="flex h-10 items-center gap-2 text-[13px]"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="h-4 w-4 accent-[var(--tulsi)]" /> On</label>
      <button className={p ? btnSm + " h-10" : btn}>{p ? "Save" : "Add pop-up"}</button>
    </form>
  );
  return (
    <>
      <PageHead title="Live pop-ups" sub="Small messages that slide in at the bottom of the store. Keep them true: today's production log, real reviews, useful info." />
      <Card title="Add a pop-up">{row()}</Card>
      <div className="mt-6 space-y-3">
        {popups.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start gap-3">
              <div className="flex-1">{row(p)}</div>
              <form action={deletePopup} className="pt-6"><input type="hidden" name="id" value={p.id} /><button className={`${btnSm} h-10 text-clay`}>Delete</button></form>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] text-ink-3">Visitors see at most 4 per visit, 22 seconds apart, and can switch them off. They never appear at checkout.</p>
    </>
  );
}
