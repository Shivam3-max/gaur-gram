"use client";

import { useRef, useState } from "react";
import { Upload, X, ArrowLeft, ArrowRight } from "lucide-react";
import { uploadFile } from "./uploadFile";

/** Ordered list of lifestyle images for a product. Submits as newline-separated paths. */
export default function GalleryField({ name, defaultValue }: { name: string; defaultValue: string[] }) {
  const [items, setItems] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setErr("");
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        const url = await uploadFile(f);
        setItems((p) => [...p, url]);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const move = (i: number, d: number) =>
    setItems((p) => {
      const n = [...p];
      const j = i + d;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div>
      <textarea name={name} value={items.join("\n")} readOnly hidden />
      <div className="grid grid-cols-3 gap-2">
        {items.map((src, i) => (
          <div key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-malai">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="grid h-6 w-6 place-items-center rounded bg-white/90" aria-label="Move left"><ArrowLeft size={12} /></button>
              <button type="button" onClick={() => move(i, 1)} className="grid h-6 w-6 place-items-center rounded bg-white/90" aria-label="Move right"><ArrowRight size={12} /></button>
            </div>
            <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded bg-white/90" aria-label="Remove image"><X size={12} /></button>
          </div>
        ))}
        <button type="button" disabled={busy} onClick={() => file.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed border-line text-[12px] font-semibold text-ink-2 hover:border-ink/30 disabled:opacity-50">
          <Upload size={16} /> {busy ? "Uploading…" : "Add images"}
        </button>
      </div>
      <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
      {err && <p className="mt-1 text-[12px] text-clay">{err}</p>}
    </div>
  );
}
