"use client";

import { useEffect, useRef, useState } from "react";

type ExportOption = "csv" | "excel" | "pdf";

type Props = {
  onExport: (format: ExportOption) => void;
  formats?: ExportOption[];
};

const LABELS: Record<ExportOption, string> = {
  csv: "CSV (.csv)",
  excel: "Excel (.xlsx)",
  pdf: "PDF (imprimir)"
};

export function ExportDropdown({ onExport, formats = ["csv", "excel", "pdf"] }: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="export-dropdown" ref={ref}>
      <button className="btn btn--outline btn--sm" onClick={() => setOpen((v) => !v)} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Exportar
      </button>
      {open && (
        <ul className="export-menu" role="menu">
          {formats.map((fmt) => (
            <li key={fmt}>
              <button
                role="menuitem"
                onClick={() => { onExport(fmt); setOpen(false); }}
                type="button"
              >
                {LABELS[fmt]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
