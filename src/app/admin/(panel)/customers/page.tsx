import { db } from "@/lib/db";
import { rupees } from "@/lib/format";
import { adjustWallet } from "../../actions";
import { Card, PageHead, Table, btnSm, input, td } from "@/components/admin/ui";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const users = await db.user.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] } : {},
    include: { _count: { select: { orders: true } }, subscriptions: { where: { status: "ACTIVE" }, select: { id: true } }, addresses: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHead title="Customers & wallet" sub={`${users.length} customers`}>
        <form><input name="q" defaultValue={q} placeholder="Search name or phone" className={`${input} w-64`} /></form>
      </PageHead>
      <Card pad={false}>
        <Table head={["Customer", "Area", "Orders", "Active plans", "Bottles out", "Wallet", "Adjust wallet"]}>
          {users.map((u) => (
            <tr key={u.id}>
              <td className={td}><b className="font-semibold">{u.name || "—"}</b><span className="block text-[12px] text-ink-3">{u.phone}{u.email && ` · ${u.email}`}</span></td>
              <td className={td}>{u.addresses[0] ? `${u.addresses[0].city} ${u.addresses[0].pincode}` : <span className="text-ink-3">—</span>}</td>
              <td className={`${td} tabular-nums`}>{u._count.orders}</td>
              <td className={`${td} tabular-nums`}>{u.subscriptions.length}</td>
              <td className={`${td} tabular-nums`}>{u.bottlesOut}</td>
              <td className={`${td} font-semibold tabular-nums ${u.wallet < 0 ? "text-clay" : ""}`}>{rupees(u.wallet)}</td>
              <td className={td}>
                <form action={adjustWallet} className="flex gap-1.5">
                  <input type="hidden" name="userId" value={u.id} />
                  <input name="amount" inputMode="numeric" placeholder="+500 / -98" className={`${input} h-8 w-24 text-[12.5px]`} aria-label={`Amount for ${u.name}`} />
                  <input name="note" placeholder="Reason" className={`${input} h-8 w-32 text-[12.5px]`} aria-label="Reason" />
                  <button className={btnSm}>Apply</button>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
