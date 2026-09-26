"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MapPin, ChevronDown, ShoppingBag, User, Menu, X } from "lucide-react";
import Logo from "../Logo";
import { useCart } from "../cart/CartProvider";
import { cx, rupees } from "@/lib/format";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/making", label: "How we make it" },
  { href: "/goshala", label: "Our goshala" },
  { href: "/lab-reports", label: "Lab reports" },
];

export default function Header({ announcement }: { announcement: string }) {
  const { count, subtotal, setOpen, pin, setPinOpen } = useCart();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  }

  const location = (
    <button
      type="button"
      onClick={() => setPinOpen(true)}
      className="flex min-w-0 items-center gap-2 rounded-xl text-left transition hover:bg-malai lg:px-2 lg:py-1"
    >
      <MapPin size={18} className="shrink-0 text-ghee" />
      <span className="min-w-0 leading-tight">
        <span className="block text-[13px] font-bold">{pin?.fresh ? "Delivery tomorrow, 6–8 AM" : pin ? "Ships in 3–6 days" : "Set delivery location"}</span>
        <span className="flex items-center gap-0.5 truncate text-[12px] text-ink-3">
          {pin ? `${pin.code}${pin.city ? " · " + pin.city : ""}` : "Tricity & all-India"} <ChevronDown size={12} />
        </span>
      </span>
    </button>
  );

  const locationCompact = (
    <button
      type="button"
      onClick={() => setPinOpen(true)}
      className="flex h-11 max-w-[128px] shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white/70 px-2.5 text-left"
      aria-label="Set delivery location"
    >
      <MapPin size={16} className="shrink-0 text-ghee" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[11.5px] font-bold">{pin?.fresh ? "Tomorrow 6–8 AM" : pin ? "3–6 days" : "Deliver to"}</span>
        <span className="flex items-center gap-0.5 truncate text-[11px] text-ink-3">
          {pin ? pin.code : "Set pincode"} <ChevronDown size={11} className="shrink-0" />
        </span>
      </span>
    </button>
  );

  return (
    <>
      <div className="bg-ink text-center text-[11px] text-white/85 sm:text-[12px]">
        <p className="container-x truncate py-1.5 sm:py-2">{announcement}</p>
      </div>
      <header className={cx("sticky top-0 z-50 border-b bg-[#fbf8f1]/95 backdrop-blur transition-[border-color,box-shadow]", scrolled ? "border-line shadow-[0_6px_24px_-18px_rgba(0,0,0,.25)]" : "border-transparent")}>
        <div className="container-x flex h-[64px] items-center gap-3 sm:h-[72px] sm:gap-4 lg:gap-6">
          <button type="button" className="-ml-1 rounded-lg p-1.5 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link href="/" aria-label="Gaurgram home" className="shrink-0">
            <Logo />
          </Link>
          <div className="hidden border-l border-line pl-4 lg:block">{location}</div>
          <div className="hidden md:block lg:hidden">{locationCompact}</div>

          <form onSubmit={submit} className="relative hidden flex-1 md:block" role="search">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="site-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search "bilona ghee", "lassi", "honey"…'
              className="h-12 w-full rounded-xl border border-line bg-malai pl-11 pr-4 text-[14px] outline-none transition focus:border-ghee focus:bg-white"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link href="/account" aria-label="My account" className="hidden h-11 items-center gap-2 rounded-xl px-3 text-[14px] font-medium hover:bg-malai sm:flex">
              <User size={18} /> <span className="hidden xl:inline">Account</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cx(
                "relative flex h-11 items-center gap-2.5 rounded-xl px-3 text-[14px] font-semibold transition sm:h-12 sm:px-4",
                count ? "bg-tulsi text-white hover:bg-tulsi-deep" : "bg-malai text-ink-2 hover:bg-malai-2",
              )}
              aria-label={`Cart, ${count} items`}
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ghee px-1 text-[11px] font-bold text-white ring-2 ring-[#fbf8f1] sm:hidden">
                  {count}
                </span>
              )}
              {count ? (
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-[12px]">{count} {count === 1 ? "item" : "items"}</span>
                  <span className="block text-[13px] tabular-nums">{rupees(subtotal)}</span>
                </span>
              ) : (
                <span className="hidden lg:inline">My cart</span>
              )}
            </button>
          </div>
        </div>

        <div className="container-x flex items-center gap-2 pb-3 md:hidden">
          {locationCompact}
          <form onSubmit={submit} className="relative min-w-0 flex-1" role="search">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="site-search-mobile"
              type="search"
              enterKeyHint="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search "ghee", "dahi"…'
              className="h-11 w-full rounded-xl border border-line bg-white/70 pl-9 pr-3 text-[16px] outline-none placeholder:text-[14px] focus:border-ghee focus:bg-white"
            />
          </form>
        </div>

        <nav className="hidden border-t border-line lg:block" aria-label="Main">
          <div className="container-x flex h-11 items-center gap-8 text-[14px]">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cx("relative font-medium transition hover:text-ghee-deep", path.startsWith(n.href) ? "text-ink" : "text-ink-2")}
              >
                {n.label}
                {path.startsWith(n.href) && <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-ghee" />}
              </Link>
            ))}
            <span className="ml-auto font-deva text-[14px] text-ghee">शुद्ध · देसी · सीधा गौशाला से</span>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-[90] bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.nav
              aria-label="Mobile"
              className="fixed inset-y-0 left-0 z-[91] flex w-[86%] max-w-[360px] flex-col bg-white p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button type="button" onClick={() => setMenu(false)} className="rounded-full p-2 hover:bg-malai" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <ul className="mt-8 space-y-1">
                {[{ href: "/", label: "Home" }, ...NAV, { href: "/account", label: "My account" }].map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} onClick={() => setMenu(false)} className="block rounded-xl px-3 py-3 font-display text-[26px] hover:bg-malai">{n.label}</Link>
                  </li>
                ))}
              </ul>
              <p className="mt-auto font-deva text-lg text-ghee">गौशाला से घर तक</p>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
