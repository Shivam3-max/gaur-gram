"use client";

import { Minus, Plus } from "lucide-react";
import { useCart, type CartItem } from "./CartProvider";
import { cx } from "@/lib/format";
import { flyToCart } from "./flyToCart";

type Props = {
  item: Omit<CartItem, "qty">;
  size?: "sm" | "lg";
  className?: string;
};

export default function AddButton({ item, size = "sm", className }: Props) {
  const { qtyOf, add, setQty } = useCart();
  const qty = qtyOf(item.variantId);
  const big = size === "lg";

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={(e) => {
          flyToCart(e.currentTarget, item.liquid, item.pack);
          add(item);
        }}
        className={cx(
          "rounded-lg border-[1.5px] border-tulsi bg-white font-semibold text-tulsi transition hover:bg-tulsi-soft active:scale-95",
          big ? "h-12 px-8 text-[15px]" : "h-9 min-w-[68px] px-3 text-[13px] min-[400px]:min-w-[76px] min-[400px]:px-4",
          className,
        )}
        aria-label={`Add ${item.name} ${item.label} to cart`}
      >
        ADD
      </button>
    );
  }

  return (
    <div
      className={cx(
        "inline-flex items-center justify-between rounded-lg bg-tulsi font-semibold text-white",
        big ? "h-12 min-w-[150px] text-[15px]" : "h-9 min-w-[68px] text-[13px] min-[400px]:min-w-[76px]",
        className,
      )}
    >
      <button type="button" onClick={() => setQty(item.variantId, qty - 1)} className={cx("grid h-full place-items-center", big ? "w-12" : "w-7")} aria-label="Remove one">
        <Minus size={big ? 16 : 13} strokeWidth={2.6} />
      </button>
      <span className="tabular-nums" aria-live="polite">{qty}</span>
      <button type="button" onClick={(e) => { flyToCart(e.currentTarget, item.liquid, item.pack); add(item); }} className={cx("grid h-full place-items-center", big ? "w-12" : "w-7")} aria-label="Add one">
        <Plus size={big ? 16 : 13} strokeWidth={2.6} />
      </button>
    </div>
  );
}
