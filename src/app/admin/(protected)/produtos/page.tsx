"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/currency";
import type { Product } from "./_components";

type DeleteTarget = { id: number; name: string };

export default function AdminProductsPage(): JSX.Element {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProducts(): Promise<void> {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) throw new Error("Não foi possível carregar produtos.");
    const data = (await res.json()) as Product[];
    setProducts(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadProducts();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!deleteTarget) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [deleteTarget]);

  useEffect(() => {
    if (!deleteTarget) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setDeleteTarget(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteTarget]);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    const list = [...products].sort((a, b) => b.id - a.id);
    if (!t) return list;
    return list.filter(
      (p) => p.name.toLowerCase().includes(t) || p.category.name.toLowerCase().includes(t)
    );
  }, [products, search]);

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch("/api/admin/products/" + deleteTarget.id, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Erro ao remover produto.");
      setDeleteTarget(null);
      return;
    }
    setDeleteTarget(null);
    await loadProducts();
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
        <button
          className="btn"
          onClick={() => router.push("/admin/produtos/novo")}
          type="button"
        >
          + Novo produto
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
                          onClick={() => router.push("/admin/produtos/" + p.id + "/editar")}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="row-btn row-btn--danger"
                          onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
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

      {deleteTarget && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">Excluir produto</h2>
              <button
                className="modal-close"
                onClick={() => setDeleteTarget(null)}
                type="button"
                aria-label="Fechar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 20, lineHeight: 1.6 }}>
                Tem certeza que deseja remover o produto{" "}
                <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>?{" "}
                Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  className="btn"
                  style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  type="button"
                >
                  {deleting ? "Excluindo..." : "Sim, excluir produto"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setDeleteTarget(null)}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
