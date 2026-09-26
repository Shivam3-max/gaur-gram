"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  variantId: string;
  slug: string;
  name: string;
  label: string;
  price: number;
  mrp: number;
  pack: string;
  liquid: string;
  labelColor: string;
  labelTitle: string;
  image: string | null;
  delivery: string; // FRESH | SHIP
  qty: number;
};

type Pin = { code: string; area: string; city: string; fresh: boolean } | null;

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  mrpTotal: number;
  hasFresh: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  qtyOf: (variantId: string) => number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  pin: Pin;
  setPin: (p: Pin) => void;
  pinOpen: boolean;
  setPinOpen: (v: boolean) => void;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "gg_cart_v1";
const PIN_KEY = "gg_pin_v1";

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [pin, setPinState] = useState<Pin>(null);
  const [open, setOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate from storage after mount so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(read<CartItem[]>(KEY, []));
    setPinState(read<Pin>(PIN_KEY, null));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const setPin = useCallback((p: Pin) => {
    setPinState(p);
    try {
      if (p) localStorage.setItem(PIN_KEY, JSON.stringify(p));
      else localStorage.removeItem(PIN_KEY);
    } catch {}
  }, []);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.variantId === item.variantId);
      if (found) return prev.map((i) => (i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...item, qty }];
    });
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.variantId !== variantId) : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
    );
  }, []);

  const value = useMemo<Ctx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const mrpTotal = items.reduce((s, i) => s + i.qty * i.mrp, 0);
    return {
      items,
      count,
      subtotal,
      mrpTotal,
      hasFresh: items.some((i) => i.delivery === "FRESH"),
      open,
      setOpen,
      qtyOf: (id) => items.find((i) => i.variantId === id)?.qty ?? 0,
      add,
      setQty,
      clear: () => setItems([]),
      pin,
      setPin,
      pinOpen,
      setPinOpen,
    };
  }, [items, open, pin, pinOpen, add, setQty, setPin]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
