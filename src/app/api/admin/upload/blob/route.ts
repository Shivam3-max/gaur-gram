import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { currentAdmin } from "@/lib/auth";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm", "application/pdf"];

/**
 * Issues short-lived tokens so the admin's browser can upload straight to Vercel Blob.
 * This bypasses the ~4.5 MB request limit on Vercel functions, which matters for making videos.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await currentAdmin())) throw new Error("Not signed in as admin");
        return { allowedContentTypes: TYPES, maximumSizeInBytes: 200 * 1024 * 1024, addRandomSuffix: true };
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}
