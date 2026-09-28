"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "./CartProvider";
import { rupees } from "@/lib/format";

/** Blinkit-style cart bar pinned to the bottom of the screen on phones. */
export default function StickyCartBar() {
  const { count, subtotal, setOpen, open } = useCart();
  const path = usePathname();
  const hidden = open || count === 0 || path.startsWith("/checkout") || path.startsWith("/admin") || path.startsWith("/subscribe");

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] lg:hidden"
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-14 w-full items-center justify-between rounded-2xl bg-tulsi px-4 text-white shadow-[0_12px_30px_-10px_rgba(44,81,41,.6)]"
          >
            <span className="flex items-center gap-3">
              <span data-cart-target className="grid h-9 w-9 place-items-center rounded-lg bg-white/15"><ShoppingBag size={18} /></span>
              <span className="text-left leading-tight">
                <span className="block text-[13px] font-semibold">{count} {count === 1 ? "item" : "items"}</span>
                <span className="text-[13px] tabular-nums text-white/85">{rupees(subtotal)}</span>
              </span>
            </span>
            <span className="flex items-center gap-1 text-[15px] font-semibold">View cart <ChevronRight size={18} /></span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
