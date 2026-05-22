"use client";

import { useMemo, useState } from "react";

import { ProductCardItem } from "@/components/product-card-item";
import type { CategoryItem } from "@/lib/categories";
import type { ProductCard } from "@/types/product";

type Props = {
  products: ProductCard[];
  categories: CategoryItem[];
};

export function ProductCatalog({ products, categories }: Props): JSX.Element {
  const [activeSlug, setActiveSlug] = useState<string>("todos");
  const [term, setTerm] = useState<string>("");

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = activeSlug === "todos" || p.categorySlug === activeSlug;
      const matchTerm =
        !t ||
        p.name.toLowerCase().includes(t) ||
        (p.shortDescription?.toLowerCase().includes(t) ?? false) ||
        p.categoryName.toLowerCase().includes(t);
      return matchCat && matchTerm;
    });
  }, [products, activeSlug, term]);

  return (
    <>
      <div className="toolbar" data-reveal>
        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Buscar peça, modelo ou marca..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Buscar produtos"
          />
        </div>

        <div className="filters">
          <button
            className={`chip ${activeSlug === "todos" ? "is-active" : ""}`}
            onClick={() => setActiveSlug("todos")}
            type="button"
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${activeSlug === c.slug ? "is-active" : ""}`}
              onClick={() => setActiveSlug(c.slug)}
              type="button"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outro termo ou outra categoria.</p>
        </div>
      ) : (
        <div className="products-grid" data-stagger>
          {filtered.map((p) => (
            <ProductCardItem key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
