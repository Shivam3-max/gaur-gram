"use client";

import { useRef, useState } from "react";
import { Upload, X, Film, FileText } from "lucide-react";
import { uploadFile } from "./uploadFile";

/** Text field for a media URL with an upload button. Uploaded files are stored on the server under /uploads. */
export default function MediaField({ name, defaultValue = "", accept = "image/*", placeholder }: { name: string; defaultValue?: string | null; accept?: string; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const isVideo = /\.(mp4|webm)$/i.test(value);
  const isPdf = /\.pdf$/i.test(value);

  async function upload(f: File) {
    setErr("");
    setBusy(true);
    try {
      setValue(await uploadFile(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-malai">
          {value ? (
            isVideo ? <Film size={16} className="text-ink-3" /> : isPdf ? <FileText size={16} className="text-ink-3" /> : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : null}
        </span>
        <input name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder ?? "/images/… or upload"} className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-[13.5px] outline-none focus:border-ghee" />
        {value && (
          <button type="button" onClick={() => setValue("")} className="grid h-10 w-10 place-items-center rounded-lg border border-line hover:bg-malai" aria-label="Clear">
            <X size={15} />
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => file.current?.click()} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-semibold hover:bg-malai disabled:opacity-50">
          <Upload size={14} /> {busy ? "Uploading…" : "Upload"}
        </button>
        <input ref={file} type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
      {err && <p className="mt-1 text-[12px] text-clay">{err}</p>}
    </div>
  );
}
