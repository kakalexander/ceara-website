"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  AdminModal,
  ExportDropdown,
  ImportModal,
  Pagination
} from "@/components/admin";
import {
  CSV_TEMPLATE_CATEGORIES,
  exportCSV,
  exportExcel
} from "@/lib/export-import";

type Category = { id: number; name: string; slug: string; isActive: boolean };
type DeleteModal = { categoryId: number; categoryName: string; productCount: number };
type ConfirmModal = { categoryId: number; categoryName: string };
type EditModal = { categoryId: number; name: string };

export default function AdminCategoriesPage(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  /* modals */
  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [moveTo, setMoveTo] = useState<number>(0);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function loadCategories(): Promise<void> {
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    if (!res.ok) { setError("Não foi possível carregar categorias."); return; }
    setCategories((await res.json()) as Category[]);
  }

  useEffect(() => { void loadCategories(); }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault(); setLoading(true); setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, isActive: true })
    });
    setLoading(false);
    if (!res.ok) {
      const p = await res.json().catch(() => null) as { error?: string } | null;
      setError(p?.error ?? "Erro ao salvar."); return;
    }
    setName(""); await loadCategories();
  }

  function openEdit(c: Category) {
    setEditModal({ categoryId: c.id, name: c.name });
    setEditName(c.name);
  }

  async function handleEditSave(): Promise<void> {
    if (!editModal || !editName.trim()) return;
    setEditLoading(true);
    const res = await fetch("/api/admin/categories/" + editModal.categoryId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() })
    });
    setEditLoading(false);
    if (!res.ok) {
      const p = await res.json().catch(() => null) as { error?: string } | null;
      setError(p?.error ?? "Erro ao editar."); setEditModal(null); return;
    }
    setEditModal(null); await loadCategories();
  }

  async function handleSimpleDeleteConfirm(): Promise<void> {
    if (!confirmModal) return; setDeleting(true);
    const res = await fetch("/api/admin/categories/" + confirmModal.categoryId, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { setConfirmModal(null); await loadCategories(); return; }
    const payload = await res.json().catch(() => null) as { error?: string; productCount?: number } | null;
    if (res.status === 409 && payload?.error === "categoria_has_products") {
      const others = categories.filter((c) => c.id !== confirmModal.categoryId);
      setConfirmModal(null);
      setDeleteModal({ categoryId: confirmModal.categoryId, categoryName: confirmModal.categoryName, productCount: payload.productCount ?? 0 });
      setMoveTo(others[0]?.id ?? 0);
    } else {
      setError(payload?.error ?? "Erro ao excluir."); setConfirmModal(null);
    }
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteModal) return; setDeleting(true);
    const url = moveTo
      ? `/api/admin/categories/${deleteModal.categoryId}?moveTo=${moveTo}`
      : `/api/admin/categories/${deleteModal.categoryId}`;
    const res = await fetch(url, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const p = await res.json().catch(() => null) as { error?: string } | null;
      setError(p?.error ?? "Erro ao excluir."); setDeleteModal(null); return;
    }
    setDeleteModal(null); await loadCategories();
  }

  async function handleImport(rows: Record<string, string>[]): Promise<{ ok: number; fail: number }> {
    let ok = 0; let fail = 0;
    for (const row of rows) {
      if (!row.nome?.trim()) { fail++; continue; }
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.nome.trim(),
          isActive: row.ativo?.toLowerCase() !== "não" && row.ativo?.toLowerCase() !== "nao"
        })
      });
      if (res.ok) ok++; else fail++;
    }
    await loadCategories();
    return { ok, fail };
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const rows = categories.map((c) => ({
      id: c.id, nome: c.name, slug: c.slug, ativo: c.isActive ? "Sim" : "Não"
    }));
    const headers = [
      { key: "id", label: "ID" },
      { key: "nome", label: "Nome" },
      { key: "slug", label: "Slug" },
      { key: "ativo", label: "Ativo" }
    ];
    if (format === "csv") exportCSV(rows, headers, "categorias.csv");
    else if (format === "excel") void exportExcel(rows, headers, "categorias.xlsx");
  }

  const paginated = categories.slice((page - 1) * limit, page * limit);
  const otherCategories = deleteModal ? categories.filter((c) => c.id !== deleteModal.categoryId) : [];

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Categorias</h1>
          <p className="small">Organize o catálogo com categorias. Crie-as antes de cadastrar produtos.</p>
        </div>
      </div>

      {/* Formulário nova categoria */}
      <div className="admin-card">
        <h2>Nova categoria</h2>
        <p className="muted" style={{ marginBottom: 16 }}>Ex: Baterias, Arla 32, Sensores, Auto Elétrica...</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field field--simple" style={{ flex: 1, minWidth: 240, marginBottom: 0 }}>
            <label htmlFor="cat-name">Nome da categoria</label>
            <input id="cat-name" type="text" placeholder="Ex: Baterias" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button type="submit" className="btn" disabled={loading}>{loading ? "Salvando..." : "Adicionar categoria"}</button>
        </form>
        {error && <p className="field-error" style={{ marginTop: 12 }}>{error}</p>}
      </div>

      {/* Listagem */}
      <div className="admin-card">
        <div className="table-toolbar">
          <h2 style={{ margin: 0 }}>Categorias cadastradas ({categories.length})</h2>
          <div className="table-toolbar-right">
            <ExportDropdown onExport={handleExport} formats={["csv", "excel"]} />
            <button className="btn btn--outline btn--sm" type="button" onClick={() => setImportOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Importar
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <h3>Nenhuma categoria ainda</h3>
            <p>Use o formulário acima para criar sua primeira categoria.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>Nome</th>
                    <th className="hide-sm">Slug (URL)</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 90 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><strong>{c.name}</strong></td>
                      <td className="hide-sm" style={{ color: "var(--text-mute)", fontFamily: "monospace", fontSize: "0.88rem" }}>/{c.slug}</td>
                      <td><span className={"tag " + (c.isActive ? "tag--on" : "tag--off")}>{c.isActive ? "Ativa" : "Inativa"}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="row-btn-icon" title="Editar" type="button" aria-label="Editar" onClick={() => openEdit(c)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="row-btn-icon row-btn-icon--danger" title="Excluir" type="button" aria-label="Excluir" onClick={() => setConfirmModal({ categoryId: c.id, categoryName: c.name })}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} limit={limit} total={categories.length} onPage={setPage} onLimit={setLimit} />
          </>
        )}
      </div>

      {/* Modal: Editar */}
      <AdminModal isOpen={!!editModal} title="Editar categoria" maxWidth={440} onClose={() => setEditModal(null)}>
        <div className="field field--simple" style={{ marginBottom: 0 }}>
          <label htmlFor="edit-cat-name">Nome da categoria</label>
          <input
            id="edit-cat-name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") void handleEditSave(); }}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setEditModal(null)} type="button">Cancelar</button>
          <button className="btn btn--sm" onClick={handleEditSave} disabled={editLoading || !editName.trim()} type="button">
            {editLoading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </AdminModal>

      {/* Modal: Confirmação simples */}
      <AdminModal isOpen={!!confirmModal} title="Excluir categoria" maxWidth={480} onClose={() => setConfirmModal(null)}>
        <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
          Tem certeza que deseja excluir a categoria <strong>&ldquo;{confirmModal?.categoryName}&rdquo;</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="modal-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setConfirmModal(null)} type="button">Cancelar</button>
          <button
            className="btn btn--sm"
            style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
            onClick={handleSimpleDeleteConfirm}
            disabled={deleting}
            type="button"
          >
            {deleting ? "Excluindo..." : "Sim, excluir"}
          </button>
        </div>
      </AdminModal>

      {/* Modal: Categoria com produtos */}
      <AdminModal isOpen={!!deleteModal} title="Categoria com produtos vinculados" maxWidth={500} onClose={() => setDeleteModal(null)}>
        <p style={{ marginBottom: 14 }}>
          A categoria <strong>&ldquo;{deleteModal?.categoryName}&rdquo;</strong> possui <strong>{deleteModal?.productCount} produto(s)</strong> vinculado(s) e não pode ser excluída diretamente.
        </p>
        {otherCategories.length === 0 ? (
          <div style={{ padding: "12px 16px", background: "rgba(255,90,96,0.1)", border: "1px solid rgba(255,90,96,0.3)", borderRadius: 8, color: "var(--danger)", marginBottom: 20 }}>
            Não há outra categoria disponível. Crie outra ou remova os produtos antes de excluir.
          </div>
        ) : (
          <div className="field field--simple" style={{ marginBottom: 22 }}>
            <label htmlFor="move-to">Mover produtos para</label>
            <select id="move-to" value={moveTo} onChange={(e) => setMoveTo(Number(e.target.value))}>
              {otherCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setDeleteModal(null)} type="button">Cancelar</button>
          <button
            className="btn btn--sm"
            style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
            onClick={handleDeleteConfirm}
            disabled={deleting || otherCategories.length === 0}
            type="button"
          >
            {deleting ? "Excluindo..." : "Excluir e transferir"}
          </button>
        </div>
      </AdminModal>

      {/* Import Modal */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        csvTemplate={CSV_TEMPLATE_CATEGORIES}
        templateFilename="template_categorias.csv"
        previewColumns={[{ key: "nome", label: "Nome" }, { key: "ativo", label: "Ativo" }]}
        onImport={handleImport}
      />
    </>
  );
}
