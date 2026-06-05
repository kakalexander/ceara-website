"use client";

const PAGE_SIZES = [10, 25, 50, 100];

type Props = {
  page: number;
  limit: number;
  total: number;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
};

export function Pagination({ page, limit, total, onPage, onLimit }: Props): JSX.Element {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pages: (number | "...")[] = [];
  const addPage = (n: number) => {
    if (!pages.includes(n)) pages.push(n);
  };
  addPage(1);
  if (page > 3) pages.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) addPage(i);
  if (page < totalPages - 2) pages.push("...");
  if (totalPages > 1) addPage(totalPages);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {total === 0 ? "0 registros" : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} de ${total}`}
      </span>
      <div className="pagination-btns">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          aria-label="Página anterior"
        >‹</button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="page-btn" style={{ cursor: "default", opacity: 0.4 }}>…</span>
          ) : (
            <button
              key={p}
              className={`page-btn${page === p ? " is-current" : ""}`}
              onClick={() => onPage(p as number)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          aria-label="Próxima página"
        >›</button>
      </div>
      <select
        className="page-size-select"
        value={limit}
        onChange={(e) => { onLimit(Number(e.target.value)); onPage(1); }}
        aria-label="Itens por página"
      >
        {PAGE_SIZES.map((s) => (
          <option key={s} value={s}>{s} por página</option>
        ))}
      </select>
    </div>
  );
}
