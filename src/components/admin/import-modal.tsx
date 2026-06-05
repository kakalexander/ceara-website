"use client";

import { useRef, useState } from "react";

import { parseImportFile } from "@/lib/export-import";
import { AdminModal } from "./admin-modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  csvTemplate: string;
  templateFilename: string;
  previewColumns: { key: string; label: string }[];
  onImport: (rows: Record<string, string>[]) => Promise<{ ok: number; fail: number }>;
};

type ImportState = {
  rows: Record<string, string>[];
  filename: string;
  loading: boolean;
  result: { ok: number; fail: number } | null;
};

const INITIAL_STATE: ImportState = { rows: [], filename: "", loading: false, result: null };

export function ImportModal({
  isOpen,
  onClose,
  csvTemplate,
  templateFilename,
  previewColumns,
  onImport
}: Props): JSX.Element {
  const [state, setState] = useState<ImportState>(INITIAL_STATE);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setState(INITIAL_STATE);
    onClose();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const rows = await parseImportFile(file);
    setState((s) => ({ ...s, rows, filename: file.name, result: null }));
  }

  async function handleImport() {
    if (!state.rows.length) return;
    setState((s) => ({ ...s, loading: true }));
    const result = await onImport(state.rows);
    setState((s) => ({ ...s, loading: false, result }));
  }

  function downloadTemplate() {
    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFilename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminModal isOpen={isOpen} title="Importar arquivo" maxWidth={620} onClose={handleClose}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn--outline btn--sm" onClick={downloadTemplate} type="button">
          Baixar template CSV
        </button>
        <span style={{ fontSize: "0.82rem", color: "var(--text-mute)" }}>Aceita CSV ou Excel (.xlsx)</span>
      </div>

      <div className="field field--simple" style={{ marginBottom: 16 }}>
        <label>Selecionar arquivo</label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFile}
          style={{ padding: "8px 0" }}
        />
      </div>

      {state.rows.length > 0 && !state.result && (
        <>
          <p style={{ fontSize: "0.85rem", color: "var(--text-mute)", marginBottom: 10 }}>
            Prévia: {state.rows.length} linha(s) encontrada(s) em <strong>{state.filename}</strong>
          </p>
          <div style={{ overflowX: "auto", marginBottom: 16, maxHeight: 200 }}>
            <table className="admin-table" style={{ fontSize: "0.8rem" }}>
              <thead>
                <tr>{previewColumns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {state.rows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {previewColumns.map((c) => <td key={c.key}>{row[c.key] ?? ""}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {state.result && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: state.result.fail > 0
              ? "rgba(255,80,80,0.08)"
              : "rgba(34,197,94,0.08)",
            border: `1px solid ${state.result.fail > 0 ? "var(--danger)" : "var(--success)"}`,
            marginBottom: 16,
            fontSize: "0.9rem"
          }}
        >
          ✅ <strong>{state.result.ok}</strong> importado(s)
          {state.result.fail > 0 && <> · ❌ <strong>{state.result.fail}</strong> ignorado(s)</>}
        </div>
      )}

      <div className="modal-actions">
        <button className="btn btn--ghost btn--sm" type="button" onClick={handleClose}>
          {state.result ? "Fechar" : "Cancelar"}
        </button>
        {!state.result && (
          <button
            className="btn btn--sm"
            type="button"
            onClick={handleImport}
            disabled={!state.rows.length || state.loading}
          >
            {state.loading ? "Importando..." : `Importar ${state.rows.length} linha(s)`}
          </button>
        )}
      </div>
    </AdminModal>
  );
}
