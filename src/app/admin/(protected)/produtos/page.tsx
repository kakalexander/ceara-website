"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  AdminModal,
  ExportDropdown,
  ImportModal,
  Pagination
} from "@/components/admin";
import { formatCurrency } from "@/lib/currency";
import {
  CSV_TEMPLATE_PRODUCTS,
  exportCSV,
  exportExcel,
  exportPDF
} from "@/lib/export-import";
import type { Product } from "./_components";

type DeleteTarget = { id: number; name: string };

export default function AdminProductsPage(): JSX.Element {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [importOpen, setImportOpen] = useState(false);

  async function loadProducts(): Promise<void> {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) throw new Error("Não foi possível carregar produtos.");
    setProducts((await res.json()) as Product[]);
  }

  useEffect(() => {
    (async () => {
      try { await loadProducts(); } catch (e) { setError(e instanceof Error ? e.message : "Erro."); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    const list = [...products].sort((a, b) => b.id - a.id);
    if (!t) return list;
    return list.filter((p) =>
      p.name.toLowerCase().includes(t) ||
      p.category.name.toLowerCase().includes(t) ||
      (p.sku ?? "").toLowerCase().includes(t)
    );
  }, [products, search]);

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / limit)));
  const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteTarget) return; setDeleting(true);
    const res = await fetch("/api/admin/products/" + deleteTarget.id, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const p = await res.json().catch(() => null) as { error?: string } | null;
      setError(p?.error ?? "Erro ao remover."); setDeleteTarget(null); return;
    }
    setDeleteTarget(null); await loadProducts();
  }

  async function handleImport(rows: Record<string, string>[]): Promise<{ ok: number; fail: number }> {
    let ok = 0; let fail = 0;
    /* Cache categorias uma única vez fora do loop (evita N+1) */
    const catRes = await fetch("/api/admin/categories");
    const cats = (await catRes.json()) as Array<{ id: number; name: string }>;

    for (const row of rows) {
      if (!row.nome?.trim() || !row.categoria?.trim()) { fail++; continue; }
      const price = parseFloat(row.preco?.replace(",", ".") ?? "0");
      if (!price || isNaN(price)) { fail++; continue; }
      const promoPrice = row.preco_promo ? parseFloat(row.preco_promo.replace(",", ".")) : null;
      const cat = cats.find((c) => c.name.toLowerCase() === row.categoria.toLowerCase());
      if (!cat) { fail++; continue; }
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: cat.id,
          name: row.nome.trim(),
          shortDescription: row.descricao_curta || null,
          description: row.descricao || row.nome,
          price,
          promoPrice: promoPrice && promoPrice > 0 && promoPrice < price ? promoPrice : null,
          brand: row.marca || null,
          sku: row.sku || null,
          imageMain: "/placeholder-product.svg",
          isActive: row.ativo?.toLowerCase() !== "não" && row.ativo?.toLowerCase() !== "nao",
          isFeatured: row.destaque?.toLowerCase() === "sim"
        })
      });
      if (res.ok) ok++; else fail++;
    }
    await loadProducts();
    return { ok, fail };
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const rows = filtered.map((p) => ({
      id: p.id,
      nome: p.name,
      categoria: p.category.name,
      preco: p.price.toFixed(2),
      preco_promo: p.promoPrice ? p.promoPrice.toFixed(2) : "",
      marca: p.brand ?? "",
      sku: p.sku ?? "",
      ativo: p.isActive ? "Sim" : "Não",
      destaque: p.isFeatured ? "Sim" : "Não"
    }));
    const headers = [
      { key: "id", label: "ID" }, { key: "nome", label: "Nome" },
      { key: "categoria", label: "Categoria" }, { key: "preco", label: "Preço" },
      { key: "preco_promo", label: "Promo" }, { key: "marca", label: "Marca" },
      { key: "sku", label: "SKU" }, { key: "ativo", label: "Ativo" }, { key: "destaque", label: "Destaque" }
    ];
    if (format === "csv") exportCSV(rows, headers, "produtos.csv");
    else if (format === "excel") void exportExcel(rows, headers, "produtos.xlsx");
    else exportPDF(
      "Produtos — Ceará Auto Elétrica",
      headers.slice(0, 6),
      filtered.map((p) => [String(p.id), p.name, p.category.name, formatCurrency(p.price), p.promoPrice ? formatCurrency(p.promoPrice) : "—", p.brand ?? ""])
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Produtos</h1>
          <p className="small">{products.length} cadastrados — gerencie nome, preço, promoção, imagem e status.</p>
        </div>
        <button className="btn" onClick={() => router.push("/admin/produtos/novo")} type="button">+ Novo produto</button>
      </div>

      {error && (
        <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="admin-card">
        <div className="table-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>
              Produtos ({filtered.length}{search ? ` de ${products.length}` : ""})
            </h2>
            <div className="search" style={{ maxWidth: 280 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                type="search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="table-toolbar-right">
            <ExportDropdown onExport={handleExport} />
            <button className="btn btn--outline btn--sm" type="button" onClick={() => setImportOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Importar
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>
            <h3>{products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}</h3>
            <p>{products.length === 0 ? "Clique em \"+ Novo produto\" para adicionar." : "Tente outro termo de busca."}</p>
          </div>
        ) : (
          <>
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
                    <th style={{ width: 80 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        <strong>{p.name}</strong>
                        {p.isFeatured && <> <span className="tag tag--star">Destaque</span></>}
                      </td>
                      <td className="hide-sm">{p.category.name}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td className="hide-sm">
                        {p.promoPrice
                          ? <span className="tag tag--promo">{formatCurrency(p.promoPrice)}</span>
                          : <span style={{ color: "var(--text-mute)" }}>—</span>}
                      </td>
                      <td className="hide-sm">
                        <span className={"tag " + (p.isActive ? "tag--on" : "tag--off")}>
                          {p.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="row-btn-icon"
                            title="Editar"
                            type="button"
                            aria-label="Editar produto"
                            onClick={() => router.push("/admin/produtos/" + p.id + "/editar")}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            className="row-btn-icon row-btn-icon--danger"
                            title="Excluir"
                            type="button"
                            aria-label="Excluir produto"
                            onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} limit={limit} total={filtered.length} onPage={setPage} onLimit={setLimit} />
          </>
        )}
      </div>

      {/* Modal excluir */}
      <AdminModal isOpen={!!deleteTarget} title="Excluir produto" maxWidth={480} onClose={() => setDeleteTarget(null)}>
        <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
          Tem certeza que deseja remover o produto <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="modal-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setDeleteTarget(null)} type="button">Cancelar</button>
          <button
            className="btn btn--sm"
            style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
            onClick={handleDeleteConfirm}
            disabled={deleting}
            type="button"
          >
            {deleting ? "Excluindo..." : "Sim, excluir produto"}
          </button>
        </div>
      </AdminModal>

      {/* Import Modal */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        csvTemplate={CSV_TEMPLATE_PRODUCTS}
        templateFilename="template_produtos.csv"
        previewColumns={[
          { key: "nome", label: "Nome" },
          { key: "categoria", label: "Categoria" },
          { key: "preco", label: "Preço" },
          { key: "marca", label: "Marca" }
        ]}
        onImport={handleImport}
      />
    </>
  );
}
