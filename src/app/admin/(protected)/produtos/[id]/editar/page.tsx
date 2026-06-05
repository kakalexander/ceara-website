"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  CategoryCombobox,
  CurrencyInput,
  ImageUploadGrid,
  toPayload,
  type Category,
  type Product,
  type ProductFormData
} from "../../_components";

export default function EditarProdutoPage(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/admin/categories", { cache: "no-store" }),
          fetch("/api/admin/products/" + productId, { cache: "no-store" })
        ]);
        if (!catRes.ok || !prodRes.ok) throw new Error("Erro ao carregar dados.");
        const cats = (await catRes.json()) as Category[];
        const prod = (await prodRes.json()) as Product;
        setCategories(cats);
        const imgs: string[] = [
          prod.imageMain,
          ...(prod.images?.map((i) => i.imagePath) ?? []),
          "",
          "",
          ""
        ].slice(0, 4);
        setForm({
          categoryId: prod.categoryId,
          name: prod.name,
          shortDescription: prod.shortDescription ?? "",
          description: prod.description,
          price: prod.price.toFixed(2),
          promoPrice: prod.promoPrice ? prod.promoPrice.toFixed(2) : "",
          sku: prod.sku ?? "",
          brand: prod.brand ?? "",
          images: imgs,
          isActive: prod.isActive,
          isFeatured: prod.isFeatured
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar produto.");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [productId]);

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
      if (!c) return c;
      const imgs = [...c.images];
      imgs[index] = body.path;
      return { ...c, images: imgs };
    });
  }

  function removeImage(index: number): void {
    setForm((c) => {
      if (!c) return c;
      const imgs = [...c.images];
      imgs[index] = "";
      return { ...c, images: imgs };
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    if (!form) return;
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/products/" + productId, {
      method: "PUT",
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

  if (loadingData) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-mute)" }}>
        Carregando produto...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
        <strong>Erro:</strong> {error ?? "Produto não encontrado."}
      </div>
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Editar produto #{productId}</h1>
          <p className="small">Altere os campos desejados e clique em Atualizar produto.</p>
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
        <form id="editar-produto-form" onSubmit={handleSubmit}>
          <div className="admin-grid-form">
            <div className="field field--simple">
              <label>Categoria *</label>
              <CategoryCombobox
                categories={categories}
                value={form.categoryId}
                onChange={(id) => setForm((c) => c ? { ...c, categoryId: id } : c)}
              />
            </div>

            <div className="field field--simple">
              <label htmlFor="p-name">Nome do produto *</label>
              <input
                id="p-name"
                type="text"
                placeholder="Ex: Bomba Arla 32 Bosch"
                value={form.name}
                onChange={(e) => setForm((c) => c ? { ...c, name: e.target.value } : c)}
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
                onChange={(e) => setForm((c) => c ? { ...c, shortDescription: e.target.value } : c)}
                maxLength={160}
              />
            </div>

            <div className="field field--simple full">
              <label htmlFor="p-desc">Descrição completa *</label>
              <textarea
                id="p-desc"
                placeholder="Detalhes técnicos, compatibilidade, observações..."
                value={form.description}
                onChange={(e) => setForm((c) => c ? { ...c, description: e.target.value } : c)}
                required
                rows={4}
              />
            </div>

            <div className="field field--simple">
              <label htmlFor="p-price">Preço *</label>
              <CurrencyInput
                id="p-price"
                value={form.price}
                onChange={(v) => setForm((c) => c ? { ...c, price: v } : c)}
                required
              />
              <p className="field-help">Preço normal do produto.</p>
            </div>

            <div className="field field--simple">
              <label htmlFor="p-promo">Preço promocional</label>
              <CurrencyInput
                id="p-promo"
                value={form.promoPrice}
                onChange={(v) => setForm((c) => c ? { ...c, promoPrice: v } : c)}
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
                onChange={(e) => setForm((c) => c ? { ...c, sku: e.target.value } : c)}
              />
            </div>

            <div className="field field--simple">
              <label htmlFor="p-brand">Marca</label>
              <input
                id="p-brand"
                type="text"
                placeholder="Bosch, Delphi, Moura..."
                value={form.brand}
                onChange={(e) => setForm((c) => c ? { ...c, brand: e.target.value } : c)}
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
                  onChange={(e) => setForm((c) => c ? { ...c, isActive: e.target.checked } : c)}
                />
                <span className="switch-toggle" />
                Produto ativo
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((c) => c ? { ...c, isFeatured: e.target.checked } : c)}
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
          form="editar-produto-form"
          className="btn"
          disabled={loading || categories.length === 0}
        >
          {loading ? "Salvando..." : "Atualizar produto"}
        </button>
      </div>
    </>
  );
}
