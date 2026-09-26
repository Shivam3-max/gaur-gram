import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentAdmin } from "@/lib/auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { Mark } from "@/components/Logo";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLogin() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center bg-malai px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-8 shadow-[0_30px_60px_-30px_rgba(60,40,10,.3)]">
        <Mark className="h-11 w-10 text-ink" />
        <h1 className="mt-4 font-display text-[32px] leading-tight">Gaurgram Admin</h1>
        <p className="mb-6 mt-1 text-[14px] text-ink-3">Sign in to manage orders, deliveries and the website.</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
