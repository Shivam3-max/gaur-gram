"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/admin/actions";
import { btn, input } from "./ui";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLogin, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-[13px] font-semibold">Email</span>
        <input id="admin-email" name="email" type="email" autoComplete="username" required className={`${input} mt-1 h-11`} />
      </label>
      <label className="block">
        <span className="text-[13px] font-semibold">Password</span>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required className={`${input} mt-1 h-11`} />
      </label>
      {state?.error && <p className="text-[13px] text-clay">{state.error}</p>}
      <button disabled={pending} className={`${btn} h-11 w-full`}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
