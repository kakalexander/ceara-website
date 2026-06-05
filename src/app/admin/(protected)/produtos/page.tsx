"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatCurrency } from "@/lib/currency";
import type { Product } from "./_components";

type DeleteTarget = { id: number; name: string };
type ImportRow = Record<string, string>;

const PAGE_SIZES = [10, 25, 50, 100];

/* ---- export helpers ---- */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(products: Product[]) {
  const header = "id,nome,categoria,preco,preco_promo,marca,sku,ativo,destaque";
  const rows = products.map((p) =>
    `${p.id},"${p.name.replace(/"/g, '""')}","${p.category.name}",${p.price},${p.promoPrice ?? ""},"${p.brand ?? ""}","${p.sku ?? ""}",${p.isActive},${p.isFeatured}`
  );
  downloadBlob(
    new Blob(["﻿" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" }),
    "produtos.csv"
  );
}

async function exportExcel(products: Product[]) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(products.map((p) => ({
    ID: p.id,
    Nome: p.name,
    Categoria: p.category.name,
    Preço: p.price,
    "Preço Promo": p.promoPrice ?? "",
    Marca: p.brand ?? "",
    SKU: p.sku ?? "",
    Ativo: p.isActive ? "Sim" : "Não",
    Destaque: p.isFeatured ? "Sim" : "Não"
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");
  XLSX.writeFile(wb, "produtos.xlsx");
}

function exportPDF(products: Product[]) {
  const rows = products.map((p) =>
    `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.category.name}</td><td>R$ ${p.price.toFixed(2).replace(".", ",")}</td><td>${p.promoPrice ? "R$ " + p.promoPrice.toFixed(2).replace(".", ",") : "—"}</td><td>${p.isActive ? "Ativo" : "Inativo"}</td></tr>`
  ).join("");
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Produtos</title>
  <style>body{font-family:Arial,sans-serif;font-size:12px;color:#111}h2{margin-bottom:12px}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}
  th{background:#f0f0f0;font-weight:600}tr:nth-child(even){background:#f9f9f9}
  @media print{@page{size:A4 landscape;margin:1cm}}</style></head>
  <body><h2>Produtos — Ceará Auto Elétrica e Bateria</h2>
  <table><thead><tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Promo</th><th>Status</th></tr></thead>
  <tbody>${rows}</tbody></table></body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); win.close(); }, 300);
}

const CSV_TEMPLATE = "﻿nome,categoria,preco,preco_promo,descricao_curta,descricao,marca,sku,ativo,destaque\n\"Sensor NOx Euro 5\",\"Sensores\",350.00,,\"Sensor NOx para Volvo FH\",\"Sensor NOx para sistema Arla 32 Euro 5...\",\"Bosch\",\"0258027069\",sim,não\n";

async function parseImportFile(file: File): Promise<ImportRow[]> {
  if (file.name.match(/\.csv$/i)) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^﻿/, "").toLowerCase().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const vals: string[] = [];
      let inQ = false; let cur = "";
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; } else if (ch === "," && !inQ) { vals.push(cur); cur = ""; } else { cur += ch; }
      }
      vals.push(cur);
      return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").trim()]));
    });
  }
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return (XLSX.utils.sheet_to_json<ImportRow>(ws)).map((r) => ({
    nome: String(r.nome ?? r.Nome ?? "").trim(),
    categoria: String(r.categoria ?? r.Categoria ?? "").trim(),
    preco: String(r.preco ?? r["Preço"] ?? "0").trim(),
    preco_promo: String(r.preco_promo ?? r["Preço Promo"] ?? "").trim(),
    descricao_curta: String(r.descricao_curta ?? r["Descrição Curta"] ?? "").trim(),
    descricao: String(r.descricao ?? r["Descrição"] ?? "").trim(),
    marca: String(r.marca ?? r.Marca ?? "").trim(),
    sku: String(r.sku ?? r.SKU ?? "").trim(),
    ativo: String(r.ativo ?? r.Ativo ?? "sim").trim(),
    destaque: String(r.destaque ?? r.Destaque ?? "não").trim()
  }));
}

export default function AdminProductsPage(): JSX.Element {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  /* import */
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; fail: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadProducts(): Promise<void> {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) throw new Error("Não foi possível carregar produtos.");
    setProducts((await res.json()) as Product[]);
  }

  useEffect(() => {
    (async () => { try { await loadProducts(); } catch (e) { setError(e instanceof Error ? e.message : "Erro."); } })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!deleteTarget && !importOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [deleteTarget, importOpen]);

  useEffect(() => {
    if (!deleteTarget && !importOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setDeleteTarget(null); setImportOpen(false); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [deleteTarget, importOpen]);

  useEffect(() => {
    if (!exportOpen) return;
    const h = (e: MouseEvent) => { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [exportOpen]);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    const list = [...products].sort((a, b) => b.id - a.id);
    if (!t) return list;
    return list.filter((p) => p.name.toLowerCase().includes(t) || p.category.name.toLowerCase().includes(t) || (p.sku ?? "").toLowerCase().includes(t));
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setImportFileName(file.name); setImportResult(null);
    try { setImportRows(await parseImportFile(file)); } catch { setError("Erro ao ler arquivo."); setImportRows([]); }
  }

  async function handleImport() {
    if (!importRows.length) return; setImporting(true);
    let ok = 0; let fail = 0;
    for (const row of importRows) {
      if (!row.nome?.trim() || !row.categoria?.trim()) { fail++; continue; }
      const price = parseFloat(row.preco?.replace(",", ".") ?? "0");
      if (!price || isNaN(price)) { fail++; continue; }
      const promoPrice = row.preco_promo ? parseFloat(row.preco_promo.replace(",", ".")) : null;

      const catRes = await fetch("/api/admin/categories");
      const cats = (await catRes.json()) as Array<{ id: number; name: string }>;
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
    setImporting(false); setImportResult({ ok, fail });
    await loadProducts();
    if (fileRef.current) fileRef.current.value = "";
    setImportRows([]); setImportFileName("");
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

      {error && <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}><strong>Erro:</strong> {error}</div>}

      <div className="admin-card">
        <div className="table-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Produtos ({filtered.length}{search ? ` de ${products.length}` : ""})</h2>
            <div className="search" style={{ maxWidth: 280 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input type="search" placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="table-toolbar-right">
            <div className="export-dropdown" ref={exportRef}>
              <button className="btn btn--ghost btn--sm" type="button" onClick={() => setExportOpen((o) => !o)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exportar
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {exportOpen && (
                <div className="export-menu">
                  <button type="button" onClick={() => { exportCSV(filtered); setExportOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    CSV
                  </button>
                  <button type="button" onClick={() => { void exportExcel(filtered); setExportOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Excel (.xlsx)
                  </button>
                  <button type="button" onClick={() => { exportPDF(filtered); setExportOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6M9 11h6M9 7h4"/></svg>
                    PDF (imprimir)
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
                        {p.promoPrice ? <span className="tag tag--promo">{formatCurrency(p.promoPrice)}</span> : <span style={{ color: "var(--text-mute)" }}>—</span>}
                      </td>
                      <td className="hide-sm">
                        <span className={"tag " + (p.isActive ? "tag--on" : "tag--off")}>{p.isActive ? "Ativo" : "Inativo"}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="row-btn-icon" title="Editar" type="button" onClick={() => router.push("/admin/produtos/" + p.id + "/editar")}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="row-btn-icon row-btn-icon--danger" title="Excluir" type="button" onClick={() => setDeleteTarget({ id: p.id, name: p.name })}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label className="pagination-info" htmlFor="prod-limit">Itens por página:</label>
                <select id="prod-limit" className="page-size-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
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
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? <span key={"e" + i} className="page-btn" style={{ cursor: "default" }}>…</span>
                      : <button key={p} className={"page-btn" + (p === currentPage ? " is-current" : "")} type="button" onClick={() => setPage(p as number)}>{p}</button>
                  )}
                <button className="page-btn" type="button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
              <span className="pagination-info">{(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, filtered.length)} de {filtered.length}</span>
            </div>
          </>
        )}
      </div>

      {/* Modal excluir */}
      {deleteTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">Excluir produto</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)} type="button" aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: 1.6 }}>Tem certeza que deseja remover o produto <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>? Esta ação não pode ser desfeita.</p>
              <div className="modal-actions">
                <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)} type="button">Cancelar</button>
                <button className="btn" style={{ background: "var(--danger)", borderColor: "var(--danger)" }} onClick={handleDeleteConfirm} disabled={deleting} type="button">
                  {deleting ? "Excluindo..." : "Sim, excluir produto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal importar */}
      {importOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setImportOpen(false); }}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 className="modal-title">Importar produtos</h2>
              <button className="modal-close" onClick={() => setImportOpen(false)} type="button" aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                Faça upload de um arquivo CSV ou Excel (.xlsx). Colunas obrigatórias: <code style={{ fontFamily: "monospace" }}>nome</code>, <code style={{ fontFamily: "monospace" }}>categoria</code> (deve existir), <code style={{ fontFamily: "monospace" }}>preco</code>. Demais colunas são opcionais.
              </p>
              <button type="button" className="btn btn--ghost btn--sm" style={{ marginBottom: 20 }}
                onClick={() => downloadBlob(new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" }), "template_produtos.csv")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar template CSV
              </button>
              <div className="field field--simple" style={{ marginBottom: 16 }}>
                <label>Arquivo (CSV ou .xlsx)</label>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                {importFileName && <small className="muted" style={{ marginTop: 4 }}>{importFileName} — {importRows.length} linha(s) detectada(s)</small>}
              </div>
              {importRows.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p className="muted" style={{ marginBottom: 8, fontSize: "0.82rem" }}>Prévia (primeiras 3 linhas):</p>
                  <div className="table-wrap" style={{ maxHeight: 140 }}>
                    <table className="admin-table" style={{ fontSize: "0.82rem" }}>
                      <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Marca</th></tr></thead>
                      <tbody>
                        {importRows.slice(0, 3).map((r, i) => (
                          <tr key={i}><td>{r.nome}</td><td>{r.categoria}</td><td>{r.preco}</td><td>{r.marca || "—"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {importResult && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: importResult.fail > 0 ? "rgba(255,90,96,0.1)" : "rgba(37,211,102,0.1)", color: importResult.fail > 0 ? "var(--danger)" : "var(--success)", marginBottom: 16, fontSize: "0.88rem" }}>
                  ✓ {importResult.ok} importado(s) com sucesso{importResult.fail > 0 ? ` · ${importResult.fail} falharam (categoria inexistente, campos inválidos ou duplicados)` : ""}.
                </div>
              )}
              <div className="modal-actions">
                <button className="btn btn--ghost" onClick={() => setImportOpen(false)} type="button">Fechar</button>
                <button className="btn" onClick={handleImport} disabled={importing || importRows.length === 0} type="button">
                  {importing ? "Importando..." : `Importar ${importRows.length} produto(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
