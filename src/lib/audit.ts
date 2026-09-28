import "server-only";
import { db } from "./db";

/** Records who changed what in the admin panel. Never blocks the action it describes. */
export async function audit(admin: { id: string; name: string } | null, action: string, target = "", detail = "") {
  try {
    await db.auditLog.create({ data: { adminId: admin?.id ?? null, adminName: admin?.name ?? "System", action, target: target.slice(0, 200), detail: detail.slice(0, 500) } });
  } catch {}
}
