import { db } from "@/lib/db";
import { adminPage } from "@/lib/auth";
import { parseJSON } from "@/lib/format";
import { saveStory } from "../../actions";
import MediaField from "@/components/admin/MediaField";
import { Card, Field, PageHead, btn, input } from "@/components/admin/ui";

export const metadata = { title: "Making videos" };

export default async function MakingAdmin() {
  await adminPage("making");
  const stories = await db.makingStory.findMany({ orderBy: { sort: "asc" } });
  return (
    <>
      <PageHead title="Making videos" sub="The “How we make it” films on the homepage, product pages and /making. Upload your own footage and set when each step starts." />
      <div className="space-y-6">
        {stories.map((s) => {
          const steps = parseJSON<{ at: number; title: string; body: string }[]>(s.steps, []);
          const rows = [...steps, ...Array.from({ length: Math.max(0, 6 - steps.length) }, () => ({ at: 0, title: "", body: "" }))];
          return (
            <Card key={s.id} title={s.title} action={<span className="font-deva text-[14px] text-ghee">{s.hindi}</span>}>
              <form action={saveStory} className="grid gap-6 xl:grid-cols-[360px_1fr] *:min-w-0">
                <input type="hidden" name="id" value={s.id} />
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-ink">
                    <video src={s.video} poster={s.poster} controls muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  </div>
                  <Field label="Video (MP4)"><MediaField name="video" defaultValue={s.video} accept="video/mp4,video/webm" /></Field>
                  <Field label="Poster image" hint="Shown before the video loads"><MediaField name="poster" defaultValue={s.poster} /></Field>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title"><input name="title" defaultValue={s.title} className={input} /></Field>
                    <Field label="Hindi title"><input name="hindi" defaultValue={s.hindi} className={`${input} font-deva`} /></Field>
                    <Field label="Intro line" className="sm:col-span-2"><input name="intro" defaultValue={s.intro} className={input} /></Field>
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink-2">Steps <span className="font-normal text-ink-3">(starts at, in seconds · leave a title empty to remove)</span></p>
                    <div className="mt-2 space-y-2">
                      {rows.map((st, i) => (
                        <div key={i} className="grid grid-cols-[70px_1fr_1.6fr] gap-2">
                          <input name={`s_${i}_at`} defaultValue={st.title ? st.at : ""} inputMode="numeric" placeholder="0" className={input} aria-label={`Step ${i + 1} start second`} />
                          <input name={`s_${i}_title`} defaultValue={st.title} placeholder={`Step ${i + 1}`} className={input} aria-label={`Step ${i + 1} title`} />
                          <input name={`s_${i}_body`} defaultValue={st.body} placeholder="One sentence" className={input} aria-label={`Step ${i + 1} description`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" name="active" defaultChecked={s.active} className="h-4 w-4 accent-[var(--tulsi)]" /> Show on website</label>
                    <button className={btn}>Save {s.title}</button>
                  </div>
                </div>
              </form>
            </Card>
          );
        })}
      </div>
    </>
  );
}
