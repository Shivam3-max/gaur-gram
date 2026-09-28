import { adminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { HOME_SECTIONS, getSettings, homeSectionOrder } from "@/lib/settings";
import { prettyDate, today as istToday } from "@/lib/dates";
import { cx } from "@/lib/format";
import { deleteBanner, saveBanner, saveFestival } from "../../actions";
import HomeSectionsEditor from "@/components/admin/HomeSectionsEditor";
import MediaField from "@/components/admin/MediaField";
import { Card, Field, PageHead, Pill, btn, btnSm, input } from "@/components/admin/ui";

export const metadata = { title: "Homepage & banners" };

const FESTIVALS = [
  ["none", "No theme", "The everyday look"],
  ["diwali", "Diwali", "Marigold toran under the header, glowing diyas in the hero"],
  ["holi", "Holi", "Gulal colour clouds and a flower toran"],
  ["lohri", "Lohri", "Bonfire with dancers and kites in the sky"],
] as const;

type B = Awaited<ReturnType<typeof db.banner.findMany>>[number];

function bannerStatus(b: B, t: string) {
  if (!b.active) return { tone: "neutral" as const, text: "Off" };
  if (b.startsOn && t < b.startsOn) return { tone: "info" as const, text: `Starts ${prettyDate(b.startsOn)}` };
  if (b.endsOn && t > b.endsOn) return { tone: "neutral" as const, text: `Ended ${prettyDate(b.endsOn)}` };
  return { tone: "good" as const, text: b.endsOn ? `Live until ${prettyDate(b.endsOn)}` : "Live" };
}

function bannerForm(b?: B) {
  return (
    <form action={saveBanner} className="grid gap-3 sm:grid-cols-2 *:min-w-0">
      <input type="hidden" name="id" value={b?.id ?? ""} />
      <Field label="Where">
        <select name="placement" defaultValue={b?.placement ?? "HOME"} className={input}>
          <option value="HOME">Homepage promo card</option>
          <option value="BAR">Top announcement bar</option>
        </select>
      </Field>
      <Field label="Colour">
        <select name="tone" defaultValue={b?.tone ?? "ghee"} className={input}>
          <option value="ghee">Ghee gold</option><option value="tulsi">Tulsi green</option><option value="clay">Matka clay</option><option value="ink">Dark</option>
        </select>
      </Field>
      <Field label="Headline" className="sm:col-span-2"><input name="title" required defaultValue={b?.title} placeholder="Diwali ghee hampers are here" className={input} /></Field>
      <Field label="Small line" className="sm:col-span-2"><input name="subtitle" defaultValue={b?.subtitle} placeholder="Two jars in a wooden crate, shipped across India" className={input} /></Field>
      <Field label="Button text"><input name="cta" defaultValue={b?.cta} placeholder="Shop hampers" className={input} /></Field>
      <Field label="Button link"><input name="href" defaultValue={b?.href} placeholder="/product/ghee-gift-box" className={input} /></Field>
      <Field label="Show from" hint="Empty = now"><input type="date" name="startsOn" defaultValue={b?.startsOn ?? ""} className={input} /></Field>
      <Field label="Show until" hint="Empty = no end"><input type="date" name="endsOn" defaultValue={b?.endsOn ?? ""} className={input} /></Field>
      <Field label="Image (homepage card only)" className="sm:col-span-2"><MediaField name="image" defaultValue={b?.image} /></Field>
      <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="active" defaultChecked={b?.active ?? true} className="h-4 w-4 accent-[var(--tulsi)]" /> Active</label>
      <div className="flex gap-2 sm:justify-end"><button className={btn}>{b ? "Save banner" : "Add banner"}</button></div>
    </form>
  );
}

export default async function HomepageAdmin() {
  await adminPage("homepage");
  const [s, banners] = await Promise.all([getSettings(), db.banner.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }] })]);
  const t = istToday();
  const order = homeSectionOrder(s.homeSections).map((x) => ({ ...x, label: HOME_SECTIONS.find((h) => h.key === x.key)!.label }));

  return (
    <>
      <PageHead title="Homepage & banners" sub="Arrange the homepage, switch on a festival look, and schedule promotions to start and stop by themselves." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr] *:min-w-0">
        <div className="space-y-6">
          <Card title="Homepage sections"><HomeSectionsEditor initial={order} /></Card>
          <Card title="Festival theme">
            <form action={saveFestival} className="space-y-2">
              {FESTIVALS.map(([k, l, d]) => (
                <label key={k} className={cx("flex cursor-pointer items-start gap-3 rounded-xl border p-3", s.festival === k ? "border-ink bg-malai" : "border-line bg-white")}>
                  <input type="radio" name="festival" value={k} defaultChecked={s.festival === k} className="mt-1 accent-[var(--tulsi)]" />
                  <span><b className="block text-[14px] font-semibold">{l}</b><span className="text-[12.5px] text-ink-3">{d}</span></span>
                </label>
              ))}
              <button className={cx(btn, "mt-2")}>Apply theme</button>
            </form>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Add a banner">{bannerForm()}</Card>
          {banners.map((b) => {
            const st = bannerStatus(b, t);
            return (
              <Card key={b.id} title={b.title} action={<span className="flex items-center gap-2"><Pill tone={st.tone}>{st.text}</Pill><Pill tone="neutral">{b.placement === "BAR" ? "Top bar" : "Homepage"}</Pill></span>}>
                {bannerForm(b)}
                <form action={deleteBanner} className="mt-3 border-t border-line pt-3">
                  <input type="hidden" name="id" value={b.id} />
                  <button className={`${btnSm} text-clay`}>Delete banner</button>
                </form>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
