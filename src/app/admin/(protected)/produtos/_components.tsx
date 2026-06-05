"use client";

import { useState } from "react";

export type Category = { id: number; name: string; slug: string; isActive: boolean };
export type ProductImage = { id: number; imagePath: string; sortOrder: number };
export type Product = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  price: number;
  promoPrice: number | null;
  sku: string | null;
  brand: string | null;
  imageMain: string;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: number; name: string };
  images: ProductImage[];
};
export type ProductFormData = {
  categoryId: number;
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  promoPrice: string;
  sku: string;
  brand: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
};

export const PLACEHOLDER = "/placeholder-product.svg";
export const initialForm: ProductFormData = {
  categoryId: 0,
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  promoPrice: "",
  sku: "",
  brand: "",
  images: ["", "", "", ""],
  isActive: true,
  isFeatured: false
};

export function toPayload(form: ProductFormData): Record<string, unknown> {
  return {
    categoryId: Number(form.categoryId),
    name: form.name,
    shortDescription: form.shortDescription || null,
    description: form.description,
    price: Number(form.price.replace(",", ".")),
    promoPrice: form.promoPrice ? Number(form.promoPrice.replace(",", ".")) : null,
    sku: form.sku || null,
    brand: form.brand || null,
    imageMain: form.images[0] || PLACEHOLDER,
    extraImages: form.images.slice(1).filter(Boolean),
    isActive: form.isActive,
    isFeatured: form.isFeatured
  };
}

export function CategoryCombobox({
  categories,
  value,
  onChange
}: {
  categories: Category[];
  value: number;
  onChange: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="combobox">
      <input
        type="text"
        placeholder={categories.length === 0 ? "— Crie uma categoria antes —" : "Buscar categoria..."}
        value={open ? query : (selected?.name ?? "")}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        readOnly={categories.length === 0}
      />
      {open && filtered.length > 0 && (
        <ul className="combobox-list">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={"combobox-option" + (c.id === value ? " combobox-option--sel" : "")}
                onMouseDown={() => {
                  onChange(c.id);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CurrencyInput({
  id,
  value,
  onChange,
  required,
  placeholder
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);

  const displayValue = (() => {
    if (!value) return "";
    if (editing) return value.replace(".", ",");
    const num = parseFloat(value);
    if (isNaN(num)) return value.replace(".", ",");
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  })();

  return (
    <div className="currency-wrap">
      <span className="currency-prefix">R$</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder ?? "0,00"}
        value={displayValue}
        onFocus={() => setEditing(true)}
        onBlur={() => {
          setEditing(false);
          if (!value) return;
          const num = parseFloat(value.replace(",", "."));
          if (!isNaN(num)) onChange(num.toFixed(2));
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9,]/g, "");
          onChange(raw.replace(",", "."));
        }}
        required={required}
      />
    </div>
  );
}

export function ImageUploadGrid({
  images,
  onUpload,
  onRemove,
  uploading
}: {
  images: string[];
  onUpload: (file: File, index: number) => Promise<void>;
  onRemove: (index: number) => void;
  uploading: number | null;
}) {
  return (
    <div>
      <div className="img-grid">
        {[0, 1, 2, 3].map((i) => {
          const url = images[i] ?? "";
          const hasImg = url && url !== PLACEHOLDER;
          return (
            <div key={i} className={"img-slot" + (i === 0 ? " img-slot--cover" : "")}>
              {i === 0 && <span className="img-slot-badge">Capa</span>}
              {hasImg ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={"Imagem " + (i + 1)} />
                  <button
                    type="button"
                    className="img-slot-remove"
                    onClick={() => onRemove(i)}
                    aria-label="Remover imagem"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <label className="img-slot-upload">
                  {uploading === i ? (
                    <span className="img-slot-loading">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    </span>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <path d="M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      <span>{i === 0 ? "Foto capa" : "Foto " + (i + 1)}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onUpload(file, i);
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
      <p className="field-help" style={{ marginTop: 8 }}>
        Primeira imagem é a capa. JPG, PNG ou WEBP · máx 4MB por foto.
      </p>
    </div>
  );
}
