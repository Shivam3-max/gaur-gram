"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScanLine } from "lucide-react";

export default function TraceBox({ example }: { example?: string }) {
  const [code, setCode] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) router.push(`/trace/${encodeURIComponent(code.trim().toUpperCase())}`);
      }}
      className="flex w-full max-w-md gap-2"
    >
      <label className="relative flex-1">
        <span className="sr-only">Batch code</span>
        <ScanLine size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          id="trace-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={example ? `e.g. ${example}` : "Batch code on your jar"}
          className="h-12 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-[14px] uppercase outline-none placeholder:normal-case focus:border-ghee"
        />
      </label>
      <button className="h-12 rounded-xl bg-ink px-5 text-[14px] font-semibold text-white hover:bg-ink/85">Trace</button>
    </form>
  );
}
