"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="no-print inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-[13.5px] font-semibold text-white hover:bg-ink/85">
      <Printer size={15} /> {label}
    </button>
  );
}
