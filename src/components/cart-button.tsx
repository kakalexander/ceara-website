"use client";

import { useCart } from "@/components/cart-provider";

export function CartButton(): JSX.Element {
  const { count, open } = useCart();

  return (
    <button className="cart-btn" onClick={open} aria-label={`Abrir carrinho com ${count} itens`} type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M6 6l-1-3H2" />
      </svg>
      {count > 0 && <span className="cart-count">{count}</span>}
    </button>
  );
}
