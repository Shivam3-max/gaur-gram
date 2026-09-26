import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code")?.trim() ?? "";
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: "Enter a 6-digit pincode." }, { status: 400 });
  }
  const row = await db.pincode.findUnique({ where: { code } });
  if (row?.active) {
    return NextResponse.json({ ok: true, code, area: row.area, city: row.city, fresh: true });
  }
  // Outside the Tricity: ghee, honey and oils still ship by courier.
  return NextResponse.json({ ok: true, code, area: "", city: "", fresh: false });
}
