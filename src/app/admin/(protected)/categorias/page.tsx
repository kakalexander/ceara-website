"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = { id: number; name: string; slug: string; isActive: boolean };
type DeleteModal = { categoryId: number; categoryName: string; productCount: number };

export default function AdminCategoriesPage(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [moveTo, setMoveTo] = useState<number>(0);
  const [deleting, setDeleting] = useState(false);

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
    if (!deleteModal) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [deleteModal]);

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

  async function handleDeleteClick(c: Category): Promise<void> {
    if (!window.confirm("Tem certeza que deseja excluir a categoria \"" + c.name + "\"?")) return;

    const res = await fetch("/api/admin/categories/" + c.id, { method: "DELETE" });

    if (res.ok) {
      await loadCategories();
      return;
    }

    const payload = (await res.json().catch(() => null)) as {
      error?: string;
      productCount?: number;
      message?: string;
    } | null;

    if (res.status === 409 && payload?.error === "categoria_has_products") {
      const others = categories.filter((cat) => cat.id !== c.id);
      setDeleteModal({
        categoryId: c.id,
        categoryName: c.name,
        productCount: payload.productCount ?? 0
      });
      setMoveTo(others[0]?.id ?? 0);
    } else {
      setError(payload?.error ?? "Erro ao excluir categoria.");
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

      {deleteModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Excluir categoria</h2>
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
                  style={{ background: "var(--danger)" }}
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
