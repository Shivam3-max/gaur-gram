"use client";

let mode: Promise<{ blob: boolean }> | null = null;

/** Uploads one admin file and returns its public URL. Uses Vercel Blob in production, local disk in development. */
export async function uploadFile(file: File): Promise<string> {
  mode ??= fetch("/api/admin/upload").then((r) => (r.ok ? r.json() : { blob: false }));
  const { blob } = await mode;

  if (blob) {
    const { upload } = await import("@vercel/blob/client");
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60) || "file";
    const res = await upload(`uploads/${safe}`, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload/blob",
      multipart: file.size > 8 * 1024 * 1024,
    });
    return res.url;
  }

  const body = new FormData();
  body.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Upload failed");
  return d.url as string;
}
