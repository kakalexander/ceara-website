"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CartItem, ProductCard } from "@/types/product";

const STORAGE_KEY = "ceara_cart_v2";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  add: (product: Pick<ProductCard, "id" | "name" | "price" | "promoPrice" | "imageMain">) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function unitPrice(item: { price: number; promoPrice: number | null }): number {
  if (item.promoPrice && item.promoPrice > 0 && item.promoPrice < item.price) {
    return item.promoPrice;
  }
  return item.price;
}

export function CartProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw) as CartItem[]);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback<CartContextValue["add"]>((product) => {
    setItems((curr) => {
      const found = curr.find((i) => i.id === product.id);
      if (found) {
        return curr.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...curr,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          promoPrice: product.promoPrice,
          imageMain: product.imageMain,
          quantity: 1
        }
      ];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((curr) => curr.filter((i) => i.id !== productId));
  }, []);

  const setQty = useCallback((productId: number, qty: number) => {
    setItems((curr) => {
      if (qty <= 0) {
        return curr.filter((i) => i.id !== productId);
      }
      return curr.map((i) => (i.id === productId ? { ...i, quantity: qty } : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + unitPrice(i) * i.quantity, 0), [items]);

  // lock body when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value: CartContextValue = { items, count, total, isOpen, add, remove, setQty, clear, open, close };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart precisa estar dentro de <CartProvider>");
  }
  return ctx;
}

export { unitPrice };
