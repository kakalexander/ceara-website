"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Category = { id: number; name: string; slug: string; isActive: boolean };
type DeleteModal = { categoryId: number; categoryName: string; productCount: number };
type ConfirmModal = { categoryId: number; categoryName: string };
type EditModal = { categoryId: number; name: string };
type ImportRow = Record<string, string>;

const PAGE_SIZES = [10, 25, 50, 100];

/* ---- helpers de export ---- */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(categories: Category[]) {
  const header = "id,nome,slug,ativo";
  const rows = categories.map((c) =>
    `${c.id},"${c.name}",${c.slug},${c.isActive ? "sim" : "não"}`
  );
  downloadBlob(
    new Blob(["﻿" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" }),
    "categorias.csv"
  );
}

async function exportExcel(categories: Category[]) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(
    categories.map((c) => ({
      ID: c.id,
      Nome: c.name,
      Slug: c.slug,
      Ativo: c.isActive ? "Sim" : "Não"
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Categorias");
  XLSX.writeFile(wb, "categorias.xlsx");
}

const CSV_TEMPLATE = "﻿nome,ativo\nBaterias,sim\nAuto Elétrica,sim\n";

async function parseImportFile(file: File): Promise<ImportRow[]> {
  if (file.name.match(/\.csv$/i)) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^﻿/, "").toLowerCase());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
    });
  }
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  return rows.map((r) => ({
    nome: String(r["nome"] ?? r["Nome"] ?? "").trim(),
    ativo: String(r["ativo"] ?? r["Ativo"] ?? "sim").trim()
  }));
}

export default function AdminCategoriesPage(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  /* modals */
  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [moveTo, setMoveTo] = useState<number>(0);
  const [deleting, setDeleting] = useState(false);

  /* import */
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFile, setImportFile] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; fail: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const anyModal = !!editModal || !!confirmModal || !!deleteModal || importOpen;

  async function loadCategories(): Promise<void> {
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    if (!res.ok) { setError("Não foi possível carregar categorias."); return; }
    setCategories((await res.json()) as Category[]);
  }

  useEffect(() => { void loadCategories(); }, []);

  useEffect(() => {
    document.body.style.overflow = anyModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModal]);

  useEffect(() => {
    if (!anyModal) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setEditModal(null); setConfirmModal(null); setDeleteModal(null); setImportOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [anyModal]);

  /* close export dropdown on outside click */
  useEffect(() => {
    if (!exportOpen) return;
    const h = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [exportOpen]);

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
      ? "/api/admin/categories/" + deleteModal.categoryId + "?moveTo=" + moveTo
      : "/api/admin/categories/" + deleteModal.categoryId;
    const res = await fetch(url, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const p = await res.json().catch(() => null) as { error?: string } | null;
      setError(p?.error ?? "Erro ao excluir."); setDeleteModal(null); return;
    }
    setDeleteModal(null); await loadCategories();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file.name);
    setImportResult(null);
    try {
      setImportRows(await parseImportFile(file));
    } catch {
      setError("Erro ao ler arquivo."); setImportRows([]);
    }
  }

  async function handleImport() {
    if (!importRows.length) return;
    setImporting(true);
    let ok = 0; let fail = 0;
    for (const row of importRows) {
      if (!row.nome?.trim()) { fail++; continue; }
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: row.nome.trim(), isActive: row.ativo?.toLowerCase() !== "não" && row.ativo?.toLowerCase() !== "nao" })
      });
      if (res.ok) ok++; else fail++;
    }
    setImporting(false);
    setImportResult({ ok, fail });
    await loadCategories();
    if (fileRef.current) fileRef.current.value = "";
    setImportRows([]); setImportFile("");
  }

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(categories.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginated = categories.slice((currentPage - 1) * limit, currentPage * limit);
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
            <div className="export-dropdown" ref={exportRef}>
              <button className="btn btn--ghost btn--sm" type="button" onClick={() => setExportOpen((o) => !o)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exportar
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {exportOpen && (
                <div className="export-menu">
                  <button type="button" onClick={() => { exportCSV(categories); setExportOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    CSV
                  </button>
                  <button type="button" onClick={() => { void exportExcel(categories); setExportOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
            <button className="btn btn--ghost btn--sm" type="button" onClick={() => { setImportOpen(true); setImportResult(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Importar
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
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
                          <button className="row-btn-icon" title="Editar" type="button" onClick={() => openEdit(c)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="row-btn-icon row-btn-icon--danger" title="Excluir" type="button" onClick={() => setConfirmModal({ categoryId: c.id, categoryName: c.name })}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="pagination">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label className="pagination-info" htmlFor="cat-limit">Itens por página:</label>
                <select id="cat-limit" className="page-size-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="pagination-btns">
                <button className="page-btn" type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={"e" + i} className="page-btn" style={{ cursor: "default" }}>…</span>
                    ) : (
                      <button key={p} className={"page-btn" + (p === currentPage ? " is-current" : "")} type="button" onClick={() => setPage(p as number)}>{p}</button>
                    )
                  )}
                <button className="page-btn" type="button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
              <span className="pagination-info">
                {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, categories.length)} de {categories.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Modal: Editar categoria */}
      {editModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">Editar categoria</h2>
              <button className="modal-close" onClick={() => setEditModal(null)} type="button" aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="field field--simple" style={{ marginBottom: 0 }}>
                <label htmlFor="edit-cat-name">Nome da categoria</label>
                <input id="edit-cat-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus onKeyDown={(e) => { if (e.key === "Enter") void handleEditSave(); }} />
              </div>
              <div className="modal-actions">
                <button className="btn btn--ghost" onClick={() => setEditModal(null)} type="button">Cancelar</button>
                <button className="btn" onClick={handleEditSave} disabled={editLoading || !editName.trim()} type="button">
                  {editLoading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmação simples */}
      {confirmModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal(null); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">Excluir categoria</h2>
              <button className="modal-close" onClick={() => setConfirmModal(null)} type="button" aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: 1.6 }}>Tem certeza que deseja excluir a categoria <strong>&ldquo;{confirmModal.categoryName}&rdquo;</strong>? Esta ação não pode ser desfeita.</p>
              <div className="modal-actions">
                <button className="btn btn--ghost" onClick={() => setConfirmModal(null)} type="button">Cancelar</button>
                <button className="btn" style={{ background: "var(--danger)", borderColor: "var(--danger)" }} onClick={handleSimpleDeleteConfirm} disabled={deleting} type="button">
                  {deleting ? "Excluindo..." : "Sim, excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: categoria com produtos vinculados */}
      {deleteModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Categoria com produtos vinculados</h2>
              <button className="modal-close" onClick={() => setDeleteModal(null)} type="button" aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 14 }}>A categoria <strong>&ldquo;{deleteModal.categoryName}&rdquo;</strong> possui <strong>{deleteModal.productCount} produto(s)</strong> vinculado(s) e não pode ser excluída diretamente.</p>
              {otherCategories.length === 0 ? (
                <div style={{ padding: "12px 16px", background: "rgba(255,90,96,0.1)", border: "1px solid rgba(255,90,96,0.3)", borderRadius: 8, color: "var(--danger)", marginBottom: 20 }}>
                  Não há outra categoria disponível. Crie outra ou remova os produtos antes de excluir.
                </div>
              ) : (
                <>
                  <p style={{ color: "var(--text-soft)", marginBottom: 14 }}>Escolha para onde os produtos serão transferidos:</p>
                  <div className="field field--simple" style={{ marginBottom: 22 }}>
                    <label htmlFor="move-to">Mover produtos para</label>
                    <select id="move-to" value={moveTo} onChange={(e) => setMoveTo(Number(e.target.value))}>
                      {otherCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button className="btn btn--ghost" onClick={() => setDeleteModal(null)} type="button">Cancelar</button>
                <button className="btn" style={{ background: "var(--danger)", borderColor: "var(--danger)" }} onClick={handleDeleteConfirm} disabled={deleting || otherCategories.length === 0} type="button">
                  {deleting ? "Excluindo..." : "Excluir e transferir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Importar */}
      {importOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setImportOpen(false); }}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 className="modal-title">Importar categorias</h2>
              <button className="modal-close" onClick={() => setImportOpen(false)} type="button" aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                Faça upload de um arquivo CSV ou Excel (.xlsx). Colunas esperadas: <code style={{ fontFamily: "monospace" }}>nome</code>, <code style={{ fontFamily: "monospace" }}>ativo</code> (opcional).
              </p>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                style={{ marginBottom: 20 }}
                onClick={() => downloadBlob(new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" }), "template_categorias.csv")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar template CSV
              </button>
              <div className="field field--simple" style={{ marginBottom: 16 }}>
                <label>Arquivo (CSV ou .xlsx)</label>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                {importFile && <small className="muted" style={{ marginTop: 4 }}>{importFile} — {importRows.length} linha(s) detectada(s)</small>}
              </div>
              {importRows.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p className="muted" style={{ marginBottom: 8, fontSize: "0.82rem" }}>Prévia (primeiras 3 linhas):</p>
                  <div className="table-wrap" style={{ maxHeight: 140 }}>
                    <table className="admin-table" style={{ fontSize: "0.82rem" }}>
                      <thead><tr><th>Nome</th><th>Ativo</th></tr></thead>
                      <tbody>
                        {importRows.slice(0, 3).map((r, i) => (
                          <tr key={i}><td>{r.nome}</td><td>{r.ativo ?? "sim"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {importResult && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: importResult.fail > 0 ? "rgba(255,90,96,0.1)" : "rgba(37,211,102,0.1)", color: importResult.fail > 0 ? "var(--danger)" : "var(--success)", marginBottom: 16, fontSize: "0.88rem" }}>
                  ✓ {importResult.ok} importadas com sucesso{importResult.fail > 0 ? ` · ${importResult.fail} falharam (duplicadas ou inválidas)` : ""}.
                </div>
              )}
              <div className="modal-actions">
                <button className="btn btn--ghost" onClick={() => setImportOpen(false)} type="button">Fechar</button>
                <button className="btn" onClick={handleImport} disabled={importing || importRows.length === 0} type="button">
                  {importing ? `Importando...` : `Importar ${importRows.length} linha(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
