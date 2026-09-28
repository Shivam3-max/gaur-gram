"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { saveHomeSections } from "@/app/admin/actions";
import { cx } from "@/lib/format";
import { btn } from "./ui";

type Row = { key: string; label: string; visible: boolean };

export default function HomeSectionsEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const n = [...rows];
    [n[i], n[j]] = [n[j], n[i]];
    setRows(n);
    setDirty(true);
  };
  return (
    <form action={async (f) => { await saveHomeSections(f); setDirty(false); }}>
      <input type="hidden" name="sections" value={JSON.stringify(rows.map((r) => ({ key: r.key, visible: r.visible })))} />
      <p className="mb-3 text-[12.5px] text-ink-3">The hero and promise strip always come first. Arrange everything below them.</p>
      <ol className="space-y-1.5">
        {rows.map((r, i) => (
          <li key={r.key} className={cx("flex items-center gap-3 rounded-xl border px-3 py-2", r.visible ? "border-line bg-white" : "border-dashed border-line bg-malai/60 text-ink-3")}>
            <span className="w-5 text-center font-mono text-[12px] text-ink-3">{i + 1}</span>
            <span className={cx("flex-1 text-[13.5px] font-medium", !r.visible && "line-through")}>{r.label}</span>
            <button type="button" onClick={() => { setRows(rows.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x))); setDirty(true); }} className="rounded-md p-1.5 hover:bg-malai" aria-label={r.visible ? `Hide ${r.label}` : `Show ${r.label}`}>
              {r.visible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1.5 hover:bg-malai disabled:opacity-30" aria-label="Move up"><ArrowUp size={15} /></button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="rounded-md p-1.5 hover:bg-malai disabled:opacity-30" aria-label="Move down"><ArrowDown size={15} /></button>
          </li>
        ))}
      </ol>
      <button className={cx(btn, "mt-4")} disabled={!dirty}>{dirty ? "Save order" : "Saved"}</button>
    </form>
  );
}
