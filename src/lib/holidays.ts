import "server-only";
import { cache } from "react";
import { db } from "./db";
import { addDays, today } from "./dates";

/** All delivery holidays from two months ago onwards (enough for calendars and manifests). */
export const getHolidays = cache(async () => {
  const rows = await db.holiday.findMany({ where: { date: { gte: addDays(today(), -62) } }, orderBy: { date: "asc" } });
  return { set: new Set(rows.map((r) => r.date)), list: rows };
});
