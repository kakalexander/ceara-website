"use client";

import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/currency";
import type { ProductCard } from "@/types/product";

type Props = {
  product: ProductCard;
};

export function ProductCardItem({ product }: Props): JSX.Element {
  const { add } = useCart();
  const isPromo = Boolean(product.promoPrice && product.promoPrice < product.price);
  const displayPrice = isPromo ? product.promoPrice! : product.price;
  const discount = isPromo ? Math.round(((product.price - product.promoPrice!) / product.price) * 100) : 0;
  const hasImage = product.imageMain && product.imageMain !== "/placeholder-product.svg";

  return (
    <article className="product-card">
      <div className="product-thumb">
        {isPromo && <span className="badge">-{discount}%</span>}
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageMain} alt={product.name} loading="lazy" />
        ) : (
          <svg className="placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M3 7v10l9 4 9-4V7" />
            <path d="M12 11v10" />
          </svg>
        )}
      </div>

      <div className="product-info">
        <span className="product-cat">{product.categoryName}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="price-row">
          {isPromo && <span className="price-old">{formatCurrency(product.price)}</span>}
          <span className="price-now">{formatCurrency(displayPrice)}</span>
        </div>
        <button className="product-add" onClick={() => add(product)} type="button" aria-label={`Adicionar ${product.name} ao carrinho`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6h15l-1.5 9h-12z" />
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
          </svg>
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  );
}
