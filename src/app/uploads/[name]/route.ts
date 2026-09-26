import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif",
  ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf",
};

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(name)) return new Response("Not found", { status: 404 });
  const file = path.join(process.cwd(), "uploads", name);
  const type = TYPES[path.extname(name)];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(file);
    const range = req.headers.get("range");
    const buf = await readFile(file);
    const headers = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=31536000, immutable" };
    // Videos need byte-range support to seek and play on iOS Safari.
    if (range) {
      const m = range.match(/bytes=(\d*)-(\d*)/);
      const start = m?.[1] ? Number(m[1]) : 0;
      const end = m?.[2] ? Math.min(Number(m[2]), info.size - 1) : info.size - 1;
      return new Response(buf.subarray(start, end + 1), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${info.size}`, "Content-Length": String(end - start + 1) } });
    }
    return new Response(buf, { headers: { ...headers, "Content-Length": String(info.size) } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
