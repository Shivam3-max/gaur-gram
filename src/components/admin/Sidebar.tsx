"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, CalendarClock, Truck, Package, Clapperboard, Users, FlaskConical,
  MessageSquareQuote, BellRing, TicketPercent, MapPinned, Settings, ExternalLink, Menu, X, LogOut,
  Boxes, CalendarOff, BarChart3, LayoutTemplate, UserCog, History,
} from "lucide-react";
import { Mark } from "../Logo";
import { adminLogout } from "@/app/admin/actions";
import { cx } from "@/lib/format";
import { can, normalizeRole, ROLE_LABEL, type Area } from "@/lib/permissions";

type Item = readonly [href: string, label: string, icon: typeof LayoutDashboard, area: Area];

const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Operations", items: [
    ["/admin", "Dashboard", LayoutDashboard, "dashboard"],
    ["/admin/manifest", "Delivery manifest", Truck, "manifest"],
    ["/admin/orders", "Orders", ShoppingBag, "orders"],
    ["/admin/subscriptions", "Subscriptions", CalendarClock, "subscriptions"],
    ["/admin/customers", "Customers & wallet", Users, "customers"],
    ["/admin/stock", "Stock & expiry", Boxes, "stock"],
    ["/admin/holidays", "Delivery holidays", CalendarOff, "holidays"],
  ] },
  { title: "Catalogue", items: [
    ["/admin/products", "Products", Package, "products"],
    ["/admin/batches", "Batches & lab reports", FlaskConical, "batches"],
    ["/admin/coupons", "Coupons", TicketPercent, "coupons"],
    ["/admin/zones", "Delivery zones", MapPinned, "zones"],
  ] },
  { title: "Website", items: [
    ["/admin/homepage", "Homepage & banners", LayoutTemplate, "homepage"],
    ["/admin/making", "Making videos", Clapperboard, "making"],
    ["/admin/popups", "Live pop-ups", BellRing, "popups"],
    ["/admin/reviews", "Reviews", MessageSquareQuote, "reviews"],
  ] },
  { title: "Business", items: [
    ["/admin/reports", "Reports & GST", BarChart3, "reports"],
    ["/admin/staff", "Staff & roles", UserCog, "staff"],
    ["/admin/activity", "Activity log", History, "audit"],
    ["/admin/settings", "Site settings", Settings, "settings"],
  ] },
];

export default function Sidebar({ name, role }: { name: string; role: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const nav = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
        <Mark className="h-8 w-7 text-ink" />
        <span className="leading-none">
          <span className="block font-display text-[21px]">Gaurgram</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Admin</span>
        </span>
      </Link>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => can(role, it[3])) })).filter((g) => g.items.length).map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map(([href, label, Icon]) => (
                <li key={href}>
                  <Link href={href} onClick={() => setOpen(false)} className={cx("flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition", active(href) ? "bg-ink text-white" : "text-ink-2 hover:bg-malai-2")}>
                    <Icon size={16} /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-1 border-t border-line p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-ink-2 hover:bg-malai-2"><ExternalLink size={15} /> View store</Link>
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="text-[12.5px] leading-tight"><b className="block">{name}</b><span className="text-ink-3">{ROLE_LABEL[normalizeRole(role)]}</span></span>
          <form action={adminLogout}><button className="rounded-md p-1.5 text-ink-3 hover:bg-malai-2 hover:text-ink" aria-label="Sign out"><LogOut size={15} /></button></form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2 font-display text-[20px]"><Mark className="h-7 w-6" /> Admin</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-malai"><Menu size={20} /></button>
      </div>
      <aside className="fixed inset-y-0 left-0 hidden w-[252px] border-r border-line bg-malai lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[270px] bg-malai">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-2" aria-label="Close menu"><X size={18} /></button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
