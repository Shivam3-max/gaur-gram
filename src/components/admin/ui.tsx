import { cx } from "@/lib/format";

export const input = "h-10 w-full rounded-lg border border-line bg-white px-3 text-[14px] outline-none focus:border-ghee";
export const textarea = "w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ghee";
export const btn = "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-[13.5px] font-semibold text-white transition hover:bg-ink/85 disabled:opacity-50";
export const btnGhost = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-[13.5px] font-semibold transition hover:bg-malai";
export const btnSm = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[12.5px] font-semibold transition hover:bg-malai";

export function PageHead({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[34px] leading-tight">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-ink-3">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ title, action, children, className, pad = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cx("rounded-2xl border border-line bg-white", className)}>
      {title && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[14.5px] font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "good" | "warn" | "bad" | "neutral" | "info"; children: React.ReactNode }) {
  const tones = {
    good: "bg-tulsi-soft text-tulsi",
    warn: "bg-ghee-soft text-ghee-deep",
    bad: "bg-clay-soft text-clay",
    info: "bg-[#e7eef7] text-[#2f5d8a]",
    neutral: "bg-malai-2 text-ink-2",
  };
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", tones[tone])}>{children}</span>;
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="text-[12.5px] font-semibold text-ink-2">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-[11.5px] text-ink-3">{hint}</span>}
    </label>
  );
}

export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[13.5px]">
        <thead className="border-b border-line bg-malai/70 text-[11px] uppercase tracking-wider text-ink-3">
          <tr>{head.map((h, i) => <th key={i} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="p-6 text-center text-[13.5px] text-ink-3">{empty}</p>}
    </div>
  );
}

export const td = "px-4 py-3 align-middle";
