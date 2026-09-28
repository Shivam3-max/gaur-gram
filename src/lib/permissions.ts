/** Staff roles and what each can open in the admin panel. */

export type Role = "OWNER" | "OPS" | "CONTENT";

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  OPS: "Delivery & orders",
  CONTENT: "Content & catalogue",
};

export const ROLE_HELP: Record<Role, string> = {
  OWNER: "Everything, including staff, settings, reports and coupons.",
  OPS: "Manifest, printouts, orders, phone orders, subscriptions, customers, stock, holidays and zones.",
  CONTENT: "Products, making videos, homepage, banners, pop-ups, reviews and lab batches.",
};

export type Area =
  | "dashboard"
  | "manifest"
  | "orders"
  | "subscriptions"
  | "customers"
  | "stock"
  | "holidays"
  | "zones"
  | "products"
  | "batches"
  | "making"
  | "homepage"
  | "popups"
  | "reviews"
  | "coupons"
  | "reports"
  | "settings"
  | "staff"
  | "audit";

const ACCESS: Record<Role, Area[] | "*"> = {
  OWNER: "*",
  OPS: ["dashboard", "manifest", "orders", "subscriptions", "customers", "stock", "holidays", "zones", "batches"],
  CONTENT: ["dashboard", "products", "batches", "making", "homepage", "popups", "reviews"],
};

export function normalizeRole(role: string): Role {
  return role === "OPS" || role === "CONTENT" ? role : "OWNER"; // legacy "SUPER" becomes OWNER
}

export function can(role: string, area: Area) {
  const a = ACCESS[normalizeRole(role)];
  return a === "*" || a.includes(area);
}
