import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { cx } from "@/lib/format";
import { Card, PageHead, Table, td } from "@/components/admin/ui";

export const metadata = { title: "Activity log" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  await adminPage("audit");
  const { who = "" } = await searchParams;
  const [logs, people] = await Promise.all([
    db.auditLog.findMany({ where: who ? { adminName: who } : {}, orderBy: { createdAt: "desc" }, take: 300 }),
    db.auditLog.findMany({ distinct: ["adminName"], select: { adminName: true } }),
  ]);
  return (
    <>
      <PageHead title="Activity log" sub="Every change made in the admin panel: who, what and when. Latest 300 entries." />
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ adminName: "" }, ...people].map((p) => (
          <Link key={p.adminName || "all"} href={p.adminName ? `/admin/activity?who=${encodeURIComponent(p.adminName)}` : "/admin/activity"} className={cx("rounded-full px-3.5 py-1.5 text-[13px] font-medium", who === p.adminName ? "bg-ink text-white" : "bg-white text-ink-2 ring-1 ring-line hover:bg-malai")}>
            {p.adminName || "Everyone"}
          </Link>
        ))}
      </div>
      <Card pad={false}>
        <Table head={["When", "Who", "What", "On", "Details"]} empty={logs.length ? undefined : "Nothing recorded yet."}>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className={`${td} whitespace-nowrap tabular-nums text-ink-3`}>{l.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
              <td className={`${td} font-semibold`}>{l.adminName}</td>
              <td className={td}>{l.action}</td>
              <td className={`${td} font-mono text-[12.5px]`}>{l.target}</td>
              <td className={`${td} text-ink-3`}>{l.detail}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
