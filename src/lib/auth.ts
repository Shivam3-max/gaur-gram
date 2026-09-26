import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const SECRET = process.env.SESSION_SECRET || "dev-only-secret";
const USER_COOKIE = "gg_session";
const ADMIN_COOKIE = "gg_admin";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(value: string) {
  const mac = createHmac("sha256", SECRET).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function verify(token: string | undefined) {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const value = token.slice(0, i);
  const expected = sign(value);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [id, exp] = value.split(":");
  if (!id || Number(exp) < Date.now()) return null;
  return id;
}

async function setCookie(name: string, id: string) {
  const jar = await cookies();
  jar.set(name, sign(`${id}:${Date.now() + MAX_AGE * 1000}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function startUserSession(userId: string) {
  await setCookie(USER_COOKIE, userId);
}
export async function startAdminSession(adminId: string) {
  await setCookie(ADMIN_COOKIE, adminId);
}

export async function endUserSession() {
  (await cookies()).delete(USER_COOKIE);
}
export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function currentUser() {
  const id = verify((await cookies()).get(USER_COOKIE)?.value);
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}

export async function currentAdmin() {
  const id = verify((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!id) return null;
  return db.admin.findUnique({ where: { id } });
}

export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) throw new Error("Not signed in as admin");
  return admin;
}
