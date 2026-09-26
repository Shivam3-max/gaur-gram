import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentAdmin } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Gaurgram Admin" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="min-h-dvh bg-[#fcfbf8]">
      <Sidebar name={admin.name} role={admin.role} />
      <div className="lg:pl-[252px]">
        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
