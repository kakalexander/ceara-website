"use client";

import { useEffect, useState } from "react";

type Settings = {
  ga_measurement_id?: string;
  meta_pixel_id?: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? "var(--success)" : "var(--text-mute)",
        marginRight: 7,
        verticalAlign: "middle"
      }}
    />
  );
}

export default function AnalysePage(): JSX.Element {
  const [settings, setSettings] = useState<Settings>({});
  const [gaId, setGaId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setGaId(data.ga_measurement_id ?? "");
        setPixelId(data.meta_pixel_id ?? "");
      })
      .catch(() => setLoadError("Não foi possível carregar as configurações."));
  }, []);

  async function saveSetting(key: string, value: string): Promise<boolean> {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value })
    });
    return res.ok;
  }

  async function handleSave(): Promise<void> {
    setSaveState("saving");
    const results = await Promise.all([
      saveSetting("ga_measurement_id", gaId.trim()),
      saveSetting("meta_pixel_id", pixelId.trim())
    ]);
    if (results.every(Boolean)) {
      setSettings({ ga_measurement_id: gaId.trim(), meta_pixel_id: pixelId.trim() });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("error");
    }
  }

  const gaActive = Boolean(settings.ga_measurement_id);
  const pixelActive = Boolean(settings.meta_pixel_id);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Configurações</span>
          <h1>Análise e Rastreamento</h1>
          <p className="small">
            Configure integrações de análise de tráfego e conversão.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <strong>Erro:</strong> {loadError}
        </div>
      )}

      {/* Google Analytics */}
      <div className="admin-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="2" y="13" width="4" height="9" rx="1" fill="#E37400" />
            <rect x="10" y="7" width="4" height="15" rx="1" fill="#E37400" />
            <rect x="18" y="2" width="4" height="20" rx="1" fill="#E37400" />
          </svg>
          <h2 style={{ margin: 0 }}>Google Analytics 4</h2>
          <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: gaActive ? "var(--success)" : "var(--text-mute)" }}>
            <StatusDot active={gaActive} />
            {gaActive ? "Ativo" : "Inativo"}
          </span>
        </div>
        <p className="muted" style={{ marginBottom: 20 }}>
          Monitora visitas, origem de tráfego, comportamento e conversões no site.
          O ID tem formato <code style={{ fontFamily: "monospace", color: "var(--text-soft)" }}>G-XXXXXXXXXX</code>.
        </p>

        <div className="field field--simple" style={{ maxWidth: 400 }}>
          <label htmlFor="ga-id">Measurement ID</label>
          <input
            id="ga-id"
            type="text"
            placeholder="G-XXXXXXXXXX"
            value={gaId}
            onChange={(e) => setGaId(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            border: "1px solid var(--line-soft)",
            fontSize: "0.85rem",
            color: "var(--text-soft)",
            lineHeight: 1.6
          }}
        >
          <strong style={{ color: "var(--text)" }}>Como obter o ID:</strong> acesse{" "}
          <strong>Google Analytics → Administrador → Fluxos de dados → Web</strong> e copie
          o &ldquo;ID de medição&rdquo; (começa com G-). Deixe em branco para desativar o rastreamento.
        </div>
      </div>

      {/* Meta Pixel */}
      <div className="admin-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V9h2v7zm4 0h-2V9h2v7z"
              fill="#1877F2"
            />
          </svg>
          <h2 style={{ margin: 0 }}>Meta Pixel (Facebook)</h2>
          <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: pixelActive ? "var(--success)" : "var(--text-mute)" }}>
            <StatusDot active={pixelActive} />
            {pixelActive ? "Ativo" : "Inativo"}
          </span>
        </div>
        <p className="muted" style={{ marginBottom: 20 }}>
          Rastreia ações dos visitantes para otimizar campanhas no Facebook e Instagram.
          O Pixel ID é um número com ~15 dígitos.
        </p>

        <div className="field field--simple" style={{ maxWidth: 400 }}>
          <label htmlFor="pixel-id">Pixel ID</label>
          <input
            id="pixel-id"
            type="text"
            placeholder="Ex: 123456789012345"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            border: "1px solid var(--line-soft)",
            fontSize: "0.85rem",
            color: "var(--text-soft)",
            lineHeight: 1.6
          }}
        >
          <strong style={{ color: "var(--text)" }}>Como obter o ID:</strong> acesse{" "}
          <strong>Meta Business Suite → Gerenciador de Eventos → Pixels</strong> e copie o
          ID do pixel vinculado à sua conta de anúncios. Deixe em branco para desativar.
        </div>
      </div>

      {/* Status e ações */}
      {saveState === "error" && (
        <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <strong>Erro ao salvar.</strong> Verifique a conexão e tente novamente.
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 40
        }}
      >
        <button
          className="btn"
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
        >
          {saveState === "saving" ? "Salvando..." : "Salvar configurações"}
        </button>

        {saveState === "saved" && (
          <span style={{ color: "var(--success)", fontSize: "0.9rem" }}>
            ✓ Configurações salvas com sucesso.
          </span>
        )}
      </div>
    </>
  );
}
