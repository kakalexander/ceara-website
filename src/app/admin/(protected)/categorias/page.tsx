"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = { id: number; name: string; slug: string; isActive: boolean };
type DeleteModal = { categoryId: number; categoryName: string; productCount: number };
type ConfirmModal = { categoryId: number; categoryName: string };

export default function AdminCategoriesPage(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [moveTo, setMoveTo] = useState<number>(0);
  const [deleting, setDeleting] = useState(false);

  const anyModal = !!confirmModal || !!deleteModal;

  async function loadCategories(): Promise<void> {
    const response = await fetch("/api/admin/categories", { cache: "no-store" });
    if (!response.ok) {
      setError("Não foi possível carregar categorias.");
      return;
    }
    const data = (await response.json()) as Category[];
    setCategories(data);
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    document.body.style.overflow = anyModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModal]);

  useEffect(() => {
    if (!anyModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmModal(null);
        setDeleteModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [anyModal]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, isActive: true })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Erro ao salvar categoria.");
      return;
    }

    setName("");
    await loadCategories();
  }

  function handleDeleteClick(c: Category): void {
    setConfirmModal({ categoryId: c.id, categoryName: c.name });
  }

  async function handleSimpleDeleteConfirm(): Promise<void> {
    if (!confirmModal) return;
    setDeleting(true);

    const res = await fetch("/api/admin/categories/" + confirmModal.categoryId, { method: "DELETE" });
    setDeleting(false);

    if (res.ok) {
      setConfirmModal(null);
      await loadCategories();
      return;
    }

    const payload = (await res.json().catch(() => null)) as {
      error?: string;
      productCount?: number;
    } | null;

    if (res.status === 409 && payload?.error === "categoria_has_products") {
      const others = categories.filter((cat) => cat.id !== confirmModal.categoryId);
      setConfirmModal(null);
      setDeleteModal({
        categoryId: confirmModal.categoryId,
        categoryName: confirmModal.categoryName,
        productCount: payload.productCount ?? 0
      });
      setMoveTo(others[0]?.id ?? 0);
    } else {
      setError(payload?.error ?? "Erro ao excluir categoria.");
      setConfirmModal(null);
    }
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteModal) return;
    setDeleting(true);

    const url = moveTo
      ? "/api/admin/categories/" + deleteModal.categoryId + "?moveTo=" + moveTo
      : "/api/admin/categories/" + deleteModal.categoryId;

    const res = await fetch(url, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Erro ao excluir categoria.");
      setDeleteModal(null);
      return;
    }

    setDeleteModal(null);
    await loadCategories();
  }

  const otherCategories = deleteModal
    ? categories.filter((c) => c.id !== deleteModal.categoryId)
    : [];

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Categorias</h1>
          <p className="small">
            Use categorias para organizar o catálogo. Crie as principais antes de cadastrar
            produtos.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h2>Nova categoria</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Ex: Baterias, Arla 32, Sensores, Auto Elétrica...
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <div
            className="field field--simple"
            style={{ flex: 1, minWidth: 240, marginBottom: 0 }}
          >
            <label htmlFor="cat-name">Nome da categoria</label>
            <input
              id="cat-name"
              type="text"
              placeholder="Ex: Baterias"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Salvando..." : "Adicionar categoria"}
          </button>
        </form>

        {error && (
          <p className="field-error" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}
      </div>

      <div className="admin-card">
        <h2>Categorias cadastradas ({categories.length})</h2>

        {categories.length === 0 ? (
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
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <h3>Nenhuma categoria ainda</h3>
            <p>Use o formulário acima para criar sua primeira categoria.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Nome</th>
                  <th className="hide-sm">Slug (URL)</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 120 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td
                      className="hide-sm"
                      style={{
                        color: "var(--text-mute)",
                        fontFamily: "monospace",
                        fontSize: "0.88rem"
                      }}
                    >
                      /{c.slug}
                    </td>
                    <td>
                      <span className={"tag " + (c.isActive ? "tag--on" : "tag--off")}>
                        {c.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="row-btn row-btn--danger"
                        type="button"
                        onClick={() => handleDeleteClick(c)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: confirmação simples */}
      {confirmModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal(null); }}
        >
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">Excluir categoria</h2>
              <button
                className="modal-close"
                onClick={() => setConfirmModal(null)}
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
                Tem certeza que deseja excluir a categoria{" "}
                <strong>&ldquo;{confirmModal.categoryName}&rdquo;</strong>?{" "}
                Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  className="btn"
                  style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
                  onClick={handleSimpleDeleteConfirm}
                  disabled={deleting}
                  type="button"
                >
                  {deleting ? "Excluindo..." : "Sim, excluir categoria"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setConfirmModal(null)}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: categoria com produtos vinculados */}
      {deleteModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(null); }}
        >
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Categoria com produtos vinculados</h2>
              <button
                className="modal-close"
                onClick={() => setDeleteModal(null)}
                type="button"
                aria-label="Fechar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 14 }}>
                A categoria <strong>&ldquo;{deleteModal.categoryName}&rdquo;</strong> possui{" "}
                <strong>{deleteModal.productCount} produto(s)</strong> vinculado(s) e não pode ser
                excluída diretamente.
              </p>

              {otherCategories.length === 0 ? (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(255,90,96,0.1)",
                    border: "1px solid rgba(255,90,96,0.3)",
                    borderRadius: 8,
                    color: "var(--danger)",
                    marginBottom: 20
                  }}
                >
                  Não há outra categoria disponível. Crie outra categoria ou remova os produtos
                  antes de excluir.
                </div>
              ) : (
                <>
                  <p style={{ color: "var(--text-soft)", marginBottom: 14 }}>
                    Escolha para onde os produtos serão transferidos:
                  </p>
                  <div className="field field--simple" style={{ marginBottom: 22 }}>
                    <label htmlFor="move-to">Mover produtos para</label>
                    <select
                      id="move-to"
                      value={moveTo}
                      onChange={(e) => setMoveTo(Number(e.target.value))}
                    >
                      {otherCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  className="btn"
                  style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
                  onClick={handleDeleteConfirm}
                  disabled={deleting || otherCategories.length === 0}
                  type="button"
                >
                  {deleting ? "Excluindo..." : "Excluir e transferir produtos"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setDeleteModal(null)}
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
