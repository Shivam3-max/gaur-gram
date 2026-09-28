import "server-only";
import { cache } from "react";
import { db } from "./db";
import { today } from "./dates";

/** Banners switched on whose date window includes today (IST). */
export const liveBanners = cache(async () => {
  const t = today();
  const rows = await db.banner.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "desc" }] });
  return rows.filter((b) => (!b.startsOn || b.startsOn <= t) && (!b.endsOn || b.endsOn >= t));
});
