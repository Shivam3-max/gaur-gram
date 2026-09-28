import type { Metadata } from "next";
import { currentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Print · Gaurgram Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Bare layout for printable sheets: white paper, no sidebar, no texture. */
export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  if (!(await currentAdmin())) redirect("/admin/login");
  return (
    <div className="print-sheet min-h-dvh bg-white text-ink">
      <style>{`
        body { background: #fff !important; background-image: none !important; }
        @page { size: A4; margin: 12mm; }
        @media print { .no-print { display: none !important; } .break-after { break-after: page; } a { color: inherit; text-decoration: none; } }
      `}</style>
      <div className="mx-auto max-w-[800px] px-6 py-8 print:max-w-none print:p-0">{children}</div>
    </div>
  );
}
