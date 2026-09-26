import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { currentAdmin } from "@/lib/auth";

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "application/pdf": ".pdf",
};
const MAX = 80 * 1024 * 1024;

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/** Stores images, videos and lab-report PDFs uploaded from the admin panel. Served from /uploads/…. */
export async function POST(req: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Upload a JPG, PNG, WebP, MP4, WebM or PDF file." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "File is larger than 80 MB." }, { status: 400 });
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "file";
  const name = `${base}-${randomBytes(4).toString("hex")}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
