"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/actions";
import { btn, input } from "./ui";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end *:min-w-0">
      <label><span className="text-[12.5px] font-semibold text-ink-2">Current password</span><input id="pw-current" name="current" type="password" autoComplete="current-password" required className={`${input} mt-1`} /></label>
      <label><span className="text-[12.5px] font-semibold text-ink-2">New password</span><input id="pw-next" name="next" type="password" autoComplete="new-password" minLength={10} required className={`${input} mt-1`} /></label>
      <button disabled={pending} className={btn}>Change</button>
      {state && "error" in state && <p className="text-[13px] text-clay sm:col-span-3">{state.error}</p>}
      {state && "ok" in state && <p className="text-[13px] text-tulsi sm:col-span-3">{state.ok}</p>}
    </form>
  );
}
