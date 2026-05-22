"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/currency";

type Category = { id: number; name: string; slug: string; isActive: boolean };
type ProductImage = { id: number; imagePath: string; sortOrder: number };
type Product = {
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
type ProductFormData = {
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

const PLACEHOLDER = "/placeholder-product.svg";
const initialForm: ProductFormData = {
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

function toPayload(form: ProductFormData): Record<string, unknown> {
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

function CategoryCombobox({
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

function CurrencyInput({
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

function ImageUploadGrid({
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

export default function AdminProductsPage(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormData>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const isEditing = editingId !== null;

  async function loadCategories(): Promise<void> {
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    if (!res.ok) throw new Error("Não foi possível carregar categorias.");
    const data = (await res.json()) as Category[];
    setCategories(data);
  }

  async function loadProducts(): Promise<void> {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) throw new Error("Não foi possível carregar produtos.");
    const data = (await res.json()) as Product[];
    setProducts(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadCategories(), loadProducts()]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    const list = [...products].sort((a, b) => b.id - a.id);
    if (!t) return list;
    return list.filter(
      (p) => p.name.toLowerCase().includes(t) || p.category.name.toLowerCase().includes(t)
    );
  }, [products, search]);

  function openNew(): void {
    setEditingId(null);
    setForm({ ...initialForm, categoryId: categories[0]?.id ?? 0 });
    setError(null);
    setShowModal(true);
  }

  function closeModal(): void {
    setShowModal(false);
    setEditingId(null);
    setError(null);
  }

  function fillFromProduct(p: Product): void {
    setEditingId(p.id);
    const imgs: string[] = [
      p.imageMain,
      ...(p.images?.map((i) => i.imagePath) ?? []),
      "",
      "",
      ""
    ].slice(0, 4);
    setForm({
      categoryId: p.categoryId,
      name: p.name,
      shortDescription: p.shortDescription ?? "",
      description: p.description,
      price: p.price.toFixed(2),
      promoPrice: p.promoPrice ? p.promoPrice.toFixed(2) : "",
      sku: p.sku ?? "",
      brand: p.brand ?? "",
      images: imgs,
      isActive: p.isActive,
      isFeatured: p.isFeatured
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isEditing ? "/api/admin/products/" + editingId : "/api/admin/products";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form))
    });

    setLoading(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Erro ao salvar produto.");
      return;
    }

    await loadProducts();
    closeModal();
  }

  async function handleDelete(productId: number): Promise<void> {
    if (
      !window.confirm(
        "Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita."
      )
    )
      return;

    const res = await fetch("/api/admin/products/" + productId, { method: "DELETE" });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Erro ao remover produto.");
      return;
    }

    await loadProducts();
  }

  async function handleImageUpload(file: File, index: number): Promise<void> {
    setUploading(index);
    setError(null);

    const payload = new FormData();
    payload.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: payload });
    setUploading(null);

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Não foi possível enviar imagem.");
      return;
    }

    const body = (await res.json()) as { path: string };
    setForm((c) => {
      const imgs = [...c.images];
      imgs[index] = body.path;
      return { ...c, images: imgs };
    });
  }

  function removeImage(index: number): void {
    setForm((c) => {
      const imgs = [...c.images];
      imgs[index] = "";
      return { ...c, images: imgs };
    });
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Produtos</h1>
          <p className="small">
            {products.length} cadastrados — gerencie nome, preço, promoção, imagem e status.
          </p>
        </div>
        <button className="btn" onClick={openNew} type="button">
          + Novo produto
        </button>
      </div>

      {error && !showModal && (
        <div
          className="admin-card"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        >
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-list-header">
          <h2 style={{ margin: 0 }}>Produtos cadastrados ({products.length})</h2>
          <div className="search" style={{ maxWidth: 320 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Buscar por nome ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden
            >
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
            </svg>
            <h3>
              {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
            </h3>
            <p>
              {products.length === 0
                ? "Clique em \"+ Novo produto\" para adicionar."
                : "Tente outro termo de busca."}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Produto</th>
                  <th className="hide-sm">Categoria</th>
                  <th>Preço</th>
                  <th className="hide-sm">Promo</th>
                  <th className="hide-sm">Status</th>
                  <th style={{ width: 160 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.isFeatured && (
                        <>
                          {" "}
                          <span className="tag tag--star">Destaque</span>
                        </>
                      )}
                    </td>
                    <td className="hide-sm">{p.category.name}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td className="hide-sm">
                      {p.promoPrice ? (
                        <span className="tag tag--promo">{formatCurrency(p.promoPrice)}</span>
                      ) : (
                        <span style={{ color: "var(--text-mute)" }}>—</span>
                      )}
                    </td>
                    <td className="hide-sm">
                      <span className={"tag " + (p.isActive ? "tag--on" : "tag--off")}>
                        {p.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-btn"
                          onClick={() => fillFromProduct(p)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="row-btn row-btn--danger"
                          onClick={() => handleDelete(p.id)}
                          type="button"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? "Editar produto #" + editingId : "Novo produto"}
              </h2>
              <button
                className="modal-close"
                onClick={closeModal}
                type="button"
                aria-label="Fechar"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div
                  style={{
                    marginBottom: 18,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255,90,96,0.1)",
                    border: "1px solid rgba(255,90,96,0.3)",
                    color: "var(--danger)"
                  }}
                >
                  <strong>Erro:</strong> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="admin-grid-form">
                  <div className="field field--simple">
                    <label>Categoria *</label>
                    <CategoryCombobox
                      categories={categories}
                      value={form.categoryId}
                      onChange={(id) => setForm((c) => ({ ...c, categoryId: id }))}
                    />
                  </div>

                  <div className="field field--simple">
                    <label htmlFor="p-name">Nome do produto *</label>
                    <input
                      id="p-name"
                      type="text"
                      placeholder="Ex: Bomba Arla 32 Bosch"
                      value={form.name}
                      onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="field field--simple full">
                    <label htmlFor="p-short">Descrição curta</label>
                    <input
                      id="p-short"
                      type="text"
                      placeholder="Aparece no card do produto (até 160 caracteres)"
                      value={form.shortDescription}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, shortDescription: e.target.value }))
                      }
                      maxLength={160}
                    />
                  </div>

                  <div className="field field--simple full">
                    <label htmlFor="p-desc">Descrição completa *</label>
                    <textarea
                      id="p-desc"
                      placeholder="Detalhes técnicos, compatibilidade, observações..."
                      value={form.description}
                      onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                      required
                      rows={4}
                    />
                  </div>

                  <div className="field field--simple">
                    <label htmlFor="p-price">Preço *</label>
                    <CurrencyInput
                      id="p-price"
                      value={form.price}
                      onChange={(v) => setForm((c) => ({ ...c, price: v }))}
                      required
                    />
                    <p className="field-help">Preço normal do produto.</p>
                  </div>

                  <div className="field field--simple">
                    <label htmlFor="p-promo">Preço promocional</label>
                    <CurrencyInput
                      id="p-promo"
                      value={form.promoPrice}
                      onChange={(v) => setForm((c) => ({ ...c, promoPrice: v }))}
                      placeholder="Opcional"
                    />
                    <p className="field-help">Deve ser menor que o preço normal.</p>
                  </div>

                  <div className="field field--simple">
                    <label htmlFor="p-sku">SKU</label>
                    <input
                      id="p-sku"
                      type="text"
                      placeholder="Código interno (opcional)"
                      value={form.sku}
                      onChange={(e) => setForm((c) => ({ ...c, sku: e.target.value }))}
                    />
                  </div>

                  <div className="field field--simple">
                    <label htmlFor="p-brand">Marca</label>
                    <input
                      id="p-brand"
                      type="text"
                      placeholder="Bosch, Delphi, Moura..."
                      value={form.brand}
                      onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))}
                    />
                  </div>

                  <div className="full">
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontSize: "0.78rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--text-soft)"
                      }}
                    >
                      Imagens do produto
                    </label>
                    <ImageUploadGrid
                      images={form.images}
                      onUpload={handleImageUpload}
                      onRemove={removeImage}
                      uploading={uploading}
                    />
                  </div>

                  <div
                    className="full"
                    style={{ display: "flex", gap: 22, flexWrap: "wrap", paddingTop: 6 }}
                  >
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))}
                      />
                      <span className="switch-toggle" />
                      Produto ativo
                    </label>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) =>
                          setForm((c) => ({ ...c, isFeatured: e.target.checked }))
                        }
                      />
                      <span className="switch-toggle" />
                      Destaque na home
                    </label>
                  </div>

                  <div
                    className="full"
                    style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}
                  >
                    <button
                      type="submit"
                      className="btn"
                      disabled={loading || categories.length === 0}
                    >
                      {loading
                        ? "Salvando..."
                        : isEditing
                          ? "Atualizar produto"
                          : "Criar produto"}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
