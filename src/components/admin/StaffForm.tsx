"use client";

import { useActionState } from "react";
import { createStaff } from "@/app/admin/actions";
import { ROLE_HELP, ROLE_LABEL, type Role } from "@/lib/permissions";
import { btn, input } from "./ui";

export default function StaffForm() {
  const [state, action, pending] = useActionState(createStaff, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 *:min-w-0">
      <label><span className="text-[12.5px] font-semibold text-ink-2">Name</span><input id="staff-name" name="name" required className={`${input} mt-1`} /></label>
      <label><span className="text-[12.5px] font-semibold text-ink-2">Email (sign-in)</span><input id="staff-email" name="email" type="email" required autoComplete="off" className={`${input} mt-1`} /></label>
      <label>
        <span className="text-[12.5px] font-semibold text-ink-2">Role</span>
        <select id="staff-role" name="role" defaultValue="OPS" className={`${input} mt-1`}>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
      </label>
      <label><span className="text-[12.5px] font-semibold text-ink-2">Temporary password</span><input id="staff-password" name="password" type="text" minLength={10} required autoComplete="new-password" className={`${input} mt-1`} /></label>
      <ul className="space-y-1 text-[12px] text-ink-3 sm:col-span-2">
        {(Object.keys(ROLE_HELP) as Role[]).map((r) => <li key={r}><b className="text-ink-2">{ROLE_LABEL[r]}:</b> {ROLE_HELP[r]}</li>)}
      </ul>
      {state && "error" in state && <p className="text-[13px] text-clay sm:col-span-2">{state.error}</p>}
      {state && "ok" in state && <p className="text-[13px] text-tulsi sm:col-span-2">{state.ok} Ask them to change the password after signing in.</p>}
      <button disabled={pending} className={`${btn} sm:col-span-2 sm:justify-self-start`}>{pending ? "Adding…" : "Add staff member"}</button>
    </form>
  );
}
