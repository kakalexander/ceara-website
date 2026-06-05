"use client";

import { useCart } from "@/components/cart-provider";
import type { ProductCard } from "@/types/product";

type Props = {
  product: Pick<ProductCard, "id" | "name" | "price" | "promoPrice" | "imageMain">;
};

export function AddToCartButton({ product }: Props): JSX.Element {
  const { add } = useCart();

  return (
    <button
      className="btn btn--lg product-detail-add"
      type="button"
      onClick={() => add(product)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
      Adicionar ao carrinho
    </button>
  );
}
