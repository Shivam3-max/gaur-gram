"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";

export default function LogoutButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { await logout(); router.push("/"); })}
      className="flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-[13.5px] font-medium hover:bg-malai"
    >
      <LogOut size={15} /> {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
