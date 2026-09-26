import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { moderateReview } from "../../actions";
import { Card, PageHead, Pill, btnSm } from "@/components/admin/ui";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({ include: { product: true }, orderBy: [{ approved: "asc" }, { createdAt: "desc" }] });
  const pending = reviews.filter((r) => !r.approved).length;
  return (
    <>
      <PageHead title="Reviews" sub={`${pending} waiting for approval · featured reviews appear on the homepage`} />
      <div className="grid gap-3 lg:grid-cols-2">
        {reviews.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < r.rating ? "fill-ghee text-ghee" : "text-line"} />)}</div>
                <p className="mt-2 text-[14.5px] leading-relaxed">“{r.body}”</p>
                <p className="mt-2 text-[12.5px] text-ink-3"><b className="text-ink-2">{r.name}</b> · {r.city} · {r.product?.name ?? "General"}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {r.approved ? <Pill tone="good">Published</Pill> : <Pill tone="warn">Pending</Pill>}
                {r.featured && <Pill tone="info">Homepage</Pill>}
              </div>
            </div>
            <form action={moderateReview} className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
              <input type="hidden" name="id" value={r.id} />
              {!r.approved && <button name="action" value="approve" className={`${btnSm} border-tulsi text-tulsi`}>Approve</button>}
              {r.approved && <button name="action" value="hide" className={btnSm}>Unpublish</button>}
              {r.approved && (r.featured ? <button name="action" value="unfeature" className={btnSm}>Remove from homepage</button> : <button name="action" value="feature" className={btnSm}>Feature on homepage</button>)}
              <button name="action" value="delete" className={`${btnSm} ml-auto text-clay`}>Delete</button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
