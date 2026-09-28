import { adminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeRole, ROLE_LABEL, type Role } from "@/lib/permissions";
import { updateStaff } from "../../actions";
import StaffForm from "@/components/admin/StaffForm";
import { Card, PageHead, Pill, Table, btnSm, input, td } from "@/components/admin/ui";

export const metadata = { title: "Staff & roles" };

export default async function StaffPage() {
  const me = await adminPage("staff");
  const staff = await db.admin.findMany({ orderBy: { createdAt: "asc" } });
  const owners = staff.filter((a) => normalizeRole(a.role) === "OWNER").length;

  return (
    <>
      <PageHead title="Staff & roles" sub="Give delivery and content staff their own sign-in. Each role only sees the pages it needs." />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] *:min-w-0">
        <Card pad={false} title={`${staff.length} people`}>
          <Table head={["Name", "Role", "Change role", "Reset password", ""]}>
            {staff.map((a) => {
              const role = normalizeRole(a.role);
              const lastOwner = role === "OWNER" && owners === 1;
              return (
                <tr key={a.id}>
                  <td className={td}><b className="font-semibold">{a.name}</b>{a.id === me.id && <span className="ml-1.5 text-[11px] text-ink-3">(you)</span>}<span className="block text-[12px] text-ink-3">{a.email}</span></td>
                  <td className={td}><Pill tone={role === "OWNER" ? "warn" : role === "OPS" ? "info" : "good"}>{ROLE_LABEL[role]}</Pill></td>
                  <td className={td}>
                    <form action={updateStaff} className="flex gap-1.5">
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="action" value="role" />
                      <select name="role" defaultValue={role} disabled={lastOwner} className={`${input} h-8 w-40 text-[12.5px]`} aria-label={`Role for ${a.name}`}>
                        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                      <button disabled={lastOwner} className={btnSm}>Save</button>
                    </form>
                  </td>
                  <td className={td}>
                    <form action={updateStaff} className="flex gap-1.5">
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="action" value="reset" />
                      <input name="password" type="text" minLength={10} required placeholder="New password" autoComplete="new-password" className={`${input} h-8 w-36 text-[12.5px]`} aria-label={`New password for ${a.name}`} />
                      <button className={btnSm}>Reset</button>
                    </form>
                  </td>
                  <td className={`${td} text-right`}>
                    {a.id !== me.id && !lastOwner && (
                      <form action={updateStaff}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="action" value="delete" />
                        <button className={`${btnSm} text-clay`}>Remove</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
        <Card title="Add a staff member">
          <StaffForm />
        </Card>
      </div>
    </>
  );
}
