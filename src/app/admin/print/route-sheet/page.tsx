import Link from "next/link";
import { can } from "@/lib/permissions";
import { currentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { addDays, prettyDate, today as istToday } from "@/lib/dates";
import { buildManifest, litres } from "@/lib/manifest";
import { rupees } from "@/lib/format";
import { db } from "@/lib/db";
import PrintButton from "@/components/admin/PrintButton";
import { Mark } from "@/components/Logo";

export default async function RouteSheet({ searchParams }: { searchParams: Promise<{ date?: string; city?: string }> }) {
  const admin = await currentAdmin();
  if (!admin || !can(admin.role, "manifest")) redirect("/admin");
  const sp = await searchParams;
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : addDays(istToday(), 1);
  const { stops, totals, holiday } = await buildManifest(date);
  const bottleProducts = new Set((await db.product.findMany({ where: { pack: "bottle" }, select: { name: true } })).map((p) => p.name));

  // One doorstep per customer + address
  const doors = Object.values(
    stops.reduce<Record<string, { city: string; stops: typeof stops }>>((m, s) => {
      const id = `${s.userId}|${s.address}`;
      (m[id] ??= { city: s.city, stops: [] }).stops.push(s);
      return m;
    }, {}),
  ).filter((d) => !sp.city || d.city === sp.city);
  const byCity = doors.reduce<Record<string, typeof doors>>((m, d) => ((m[d.city] ??= []).push(d), m), {});
  const milk = totals.reduce((t, x) => t + (x.name.toLowerCase().includes("milk") ? litres(x.label, x.qty) : 0), 0);

  return (
    <>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/manifest?date=${date}`} className="text-[13px] font-semibold text-ghee-deep">← Back to manifest</Link>
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(byCity).length > 1 && !sp.city && <span className="text-[12.5px] text-ink-3">One sheet per rider:</span>}
          {!sp.city && Object.keys(byCity).map((c) => <Link key={c} href={`/admin/print/route-sheet?date=${date}&city=${encodeURIComponent(c)}`} className="rounded-full border border-line px-3 py-1 text-[12.5px]">{c}</Link>)}
          <PrintButton label="Print route sheet" />
        </div>
      </div>

      <header className="flex items-start justify-between border-b-2 border-ink pb-3">
        <div className="flex items-center gap-2.5">
          <Mark className="h-9 w-8" />
          <div>
            <p className="font-display text-[22px] leading-none">Route sheet{sp.city ? ` · ${sp.city}` : ""}</p>
            <p className="text-[12px]">{prettyDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · 5–8 AM</p>
          </div>
        </div>
        <div className="text-right text-[12px]">
          <p><b>{doors.length}</b> doorsteps · <b>{milk.toFixed(1)} L</b> milk</p>
          <p>Rider: ______________________</p>
        </div>
      </header>

      {holiday && <p className="mt-4 rounded border border-ink p-3 text-[13px] font-semibold">Delivery holiday: {holiday.note || "no subscription deliveries"}. Only one-time orders are listed.</p>}

      <section className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider">Load the crates</p>
        <p className="mt-1 text-[13px]">{totals.map((t) => `${t.name} ${t.label} × ${t.qty}`).join("  ·  ") || "Nothing to load."}</p>
      </section>

      {Object.entries(byCity).map(([city, list]) => (
        <section key={city} className="mt-6">
          <h2 className="border-b border-ink pb-1 text-[14px] font-bold uppercase tracking-wider">{city} · {list.length} stops</h2>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-wider">
                <th className="w-7 py-1.5">#</th><th className="py-1.5">Customer & address</th><th className="py-1.5">Deliver</th><th className="w-16 py-1.5">Bottles back</th><th className="w-20 py-1.5">Collect</th><th className="w-10 py-1.5">✓</th>
              </tr>
            </thead>
            <tbody>
              {list.map((door, i) => {
                const s = door.stops[0];
                const items = door.stops.flatMap((x) => x.items);
                const bottles = items.filter((it) => bottleProducts.has(it.name)).reduce((t, it) => t + it.qty, 0);
                const cod = door.stops.filter((x) => x.kind === "ORDER").length;
                return (
                  <tr key={i} className="border-t border-ink/30 align-top">
                    <td className="py-2 font-bold tabular-nums">{i + 1}</td>
                    <td className="py-2 pr-2"><b>{s.customer}</b> · {s.phone}<br />{s.address}, {s.pincode}<br /><span className="text-[11px]">{s.slot}{s.kind === "SUB" && s.wallet < 100 ? ` · low wallet ${rupees(s.wallet)}` : ""}</span></td>
                    <td className="py-2 pr-2">{items.map((it, j) => <div key={j}><b>{it.qty}×</b> {it.name} {it.label}</div>)}</td>
                    <td className="py-2 tabular-nums">{bottles ? `${bottles} ☐` : "—"}</td>
                    <td className="py-2">{cod ? door.stops.filter((x) => x.kind === "ORDER").map((x) => x.orderNumber).join(", ") : "—"}</td>
                    <td className="py-2"><span className="inline-block h-4 w-4 border border-ink" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
      {doors.length === 0 && <p className="mt-8 text-[14px]">No deliveries on this day.</p>}
      <p className="mt-8 text-[11px]">Leave glass bottles rinsed outside. Photograph any doorstep you can’t reach and WhatsApp the office.</p>
    </>
  );
}
