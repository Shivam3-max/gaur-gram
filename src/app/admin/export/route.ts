import { currentAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { gstRegister, reportRange, salesByProduct, subscriberMonths, toCsv } from "@/lib/reports";
import { audit } from "@/lib/audit";

/** CSV downloads for the Reports page. Opens directly in Excel and Google Sheets. */
export async function GET(req: Request) {
  const admin = await currentAdmin();
  if (!admin || !can(admin.role, "reports")) return new Response("Not allowed", { status: 403 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const { from, to } = reportRange(url.searchParams.get("from") ?? undefined, url.searchParams.get("to") ?? undefined);

  let rows: (string | number)[][] = [];
  let name = "report";
  if (type === "sales") {
    const s = await salesByProduct(from, to);
    rows = [["Product", "Size", "Order units", "Subscription units", "Revenue (INR)", "GST rate %"], ...s.list.map((r) => [r.product, r.size, r.orderUnits, r.subUnits, r.revenue, r.gstRate])];
    name = `gaurgram-sales-${from}-to-${to}`;
  } else if (type === "gst") {
    const g = await gstRegister(from, to);
    rows = [["Date", "Invoice / ref", "Customer", "Place of supply", "Item", "GST rate %", "Value incl. GST", "Taxable value", "GST"], ...g.lines.map((l) => [l.date, l.ref, l.customer, l.place, l.product, l.rate, l.gross, l.taxable, l.tax])];
    name = `gaurgram-gst-${from}-to-${to}`;
  } else if (type === "subscribers") {
    const m = await subscriberMonths(12);
    rows = [["Month", "Active at start", "Started", "Cancelled", "Active at end", "Lost %"], ...m.map((x) => [x.label, x.start, x.added, x.cancelled, x.end, x.churn])];
    name = "gaurgram-subscribers";
  } else {
    return new Response("Unknown report", { status: 400 });
  }
  await audit(admin, "Downloaded report", type, `${from} → ${to}`);
  // BOM so Excel reads ₹ and Hindi correctly
  return new Response("﻿" + toCsv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}.csv"` },
  });
}
