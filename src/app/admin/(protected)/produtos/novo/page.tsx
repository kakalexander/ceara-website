"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  CategoryCombobox,
  CurrencyInput,
  ImageUploadGrid,
  initialForm,
  toPayload,
  type Category,
  type ProductFormData
} from "../_components";

export default function NovoProdutoPage(): JSX.Element {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormData>({ ...initialForm });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        setForm((c) => ({ ...c, categoryId: data[0]?.id ?? 0 }));
      })
      .catch(() => setError("Não foi possível carregar categorias."));
  }, []);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form))
    });
    setLoading(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Erro ao salvar produto.");
      return;
    }
    router.push("/admin/produtos");
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Novo produto</h1>
          <p className="small">Preencha os campos abaixo e clique em Criar produto.</p>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => router.push("/admin/produtos")}
        >
          ← Voltar
        </button>
      </div>

      {error && (
        <div
          className="admin-card"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        >
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="admin-card" style={{ paddingBottom: 40 }}>
        <form id="novo-produto-form" onSubmit={handleSubmit}>
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
                onChange={(e) => setForm((c) => ({ ...c, shortDescription: e.target.value }))}
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
                  onChange={(e) => setForm((c) => ({ ...c, isFeatured: e.target.checked }))}
                />
                <span className="switch-toggle" />
                Destaque na home
              </label>
            </div>

          </div>
        </form>
      </div>

      <div className="form-actions-fixed">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => router.push("/admin/produtos")}
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="novo-produto-form"
          className="btn"
          disabled={loading || categories.length === 0}
        >
          {loading ? "Salvando..." : "Criar produto"}
        </button>
      </div>
    </>
  );
}
