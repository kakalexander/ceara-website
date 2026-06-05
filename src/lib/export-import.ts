export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(
  rows: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  filename: string
): void {
  const headerLine = headers.map((h) => h.label).join(",");
  const lines = rows.map((row) =>
    headers.map((h) => JSON.stringify(row[h.key] ?? "")).join(",")
  );
  const blob = new Blob([[headerLine, ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;"
  });
  downloadBlob(blob, filename);
}

export async function exportExcel(
  rows: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  filename: string
): Promise<void> {
  const XLSX = await import("xlsx");
  const data = rows.map((row) =>
    Object.fromEntries(headers.map((h) => [h.label, row[h.key] ?? ""]))
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  XLSX.writeFile(wb, filename);
}

export function exportPDF(
  title: string,
  headers: { label: string }[],
  rows: string[][]
): void {
  const win = window.open("", "_blank");
  if (!win) return;
  const headerCells = headers.map((h) => `<th>${h.label}</th>`).join("");
  const bodyRows = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${title}</title>
<style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}
th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f2f2f2}</style>
</head><body><h2>${title}</h2><table><thead><tr>${headerCells}</tr></thead>
<tbody>${bodyRows}</tbody></table></body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

export async function parseImportFile(
  file: File
): Promise<Record<string, string>[]> {
  if (file.name.match(/\.csv$/i)) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const rawHeaders = lines[0].split(",").map((h) =>
      h.trim().replace(/^﻿/, "").toLowerCase()
    );
    return lines.slice(1).map((line) => {
      const vals: string[] = [];
      let inQ = false;
      let cur = "";
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; continue; }
        cur += ch;
      }
      vals.push(cur.trim());
      return Object.fromEntries(rawHeaders.map((h, i) => [h, vals[i] ?? ""]));
    });
  }
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  return rows.map((r) =>
    Object.fromEntries(
      Object.entries(r).map(([k, v]) => [k.toLowerCase().trim(), String(v ?? "").trim()])
    )
  );
}

export const CSV_TEMPLATE_PRODUCTS =
  "nome,categoria,preco,preco_promo,descricao_curta,marca,sku,ativo,destaque\n" +
  "Exemplo Produto,Categoria Exemplo,199.90,,Descrição curta,Marca,SKU-001,sim,nao";

export const CSV_TEMPLATE_CATEGORIES = "nome,ativo\nExemplo Categoria,sim";
