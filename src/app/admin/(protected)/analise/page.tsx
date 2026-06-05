"use client";

import { useEffect, useState } from "react";

function extractGaId(raw: string): string {
  const match = raw.match(/['"]?(G-[A-Z0-9]+)['"]?/i);
  return match ? match[1].toUpperCase() : raw.trim();
}

function extractPixelId(raw: string): string {
  const match = raw.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"]?(\d{10,20})['"]?/)
    ?? raw.match(/\b(\d{10,20})\b/);
  return match ? match[1] : raw.trim();
}

function extractSearchConsole(raw: string): string {
  const match = raw.match(/content=['"]([\w-]+)['"]/i);
  return match ? match[1] : raw.trim();
}

type Settings = {
  ga_measurement_id?: string;
  meta_pixel_id?: string;
  google_site_verification?: string;
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
  const [searchConsoleTag, setSearchConsoleTag] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setGaId(data.ga_measurement_id ?? "");
        setPixelId(data.meta_pixel_id ?? "");
        setSearchConsoleTag(data.google_site_verification ?? "");
      })
      .catch(() => setLoadError("Não foi possível carregar as configurações."));
  }, []);

  async function handleSave(): Promise<void> {
    setSaveState("saving");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ga_measurement_id: gaId.trim(),
        meta_pixel_id: pixelId.trim(),
        google_site_verification: searchConsoleTag.trim()
      })
    });
    if (res.ok) {
      setSettings({ ga_measurement_id: gaId.trim(), meta_pixel_id: pixelId.trim(), google_site_verification: searchConsoleTag.trim() });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("error");
    }
  }

  const gaActive = Boolean(settings.ga_measurement_id);
  const pixelActive = Boolean(settings.meta_pixel_id);
  const searchConsoleActive = Boolean(settings.google_site_verification);

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

        <div className="field field--simple" style={{ maxWidth: 500 }}>
          <label htmlFor="ga-id">ID ou tag HTML do Google Analytics</label>
          <textarea
            id="ga-id"
            rows={2}
            placeholder={"G-XXXXXXXXXX  ou cole a tag <script> completa"}
            value={gaId}
            onChange={(e) => setGaId(e.target.value)}
            onBlur={(e) => setGaId(extractGaId(e.target.value))}
            spellCheck={false}
            style={{ fontFamily: "monospace", fontSize: "0.88rem", resize: "vertical" }}
          />
          <small style={{ color: "var(--text-mute)" }}>
            Cole o ID (G-...) ou a tag &lt;script&gt; completa — o ID será extraído automaticamente.
          </small>
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

        <div className="field field--simple" style={{ maxWidth: 500 }}>
          <label htmlFor="pixel-id">ID ou tag HTML do Meta Pixel</label>
          <textarea
            id="pixel-id"
            rows={2}
            placeholder={"123456789012345  ou cole o código fbq('init',...) completo"}
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            onBlur={(e) => setPixelId(extractPixelId(e.target.value))}
            spellCheck={false}
            style={{ fontFamily: "monospace", fontSize: "0.88rem", resize: "vertical" }}
          />
          <small style={{ color: "var(--text-mute)" }}>
            Cole o ID numérico ou o bloco fbq completo — o ID será extraído automaticamente.
          </small>
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

      {/* Google Search Console */}
      <div className="admin-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="#4285F4" opacity=".15" />
            <path d="M15.5 9.5a5 5 0 11-7 7L5 20l3.5-3.5a5 5 0 017-7z" stroke="#4285F4" strokeWidth="1.5" fill="none"/>
            <circle cx="13" cy="11" r="2" fill="#4285F4"/>
          </svg>
          <h2 style={{ margin: 0 }}>Google Search Console</h2>
          <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: searchConsoleActive ? "var(--success)" : "var(--text-mute)" }}>
            <StatusDot active={searchConsoleActive} />
            {searchConsoleActive ? "Verificado" : "Não verificado"}
          </span>
        </div>
        <p className="muted" style={{ marginBottom: 20 }}>
          Monitora como o site aparece nos resultados do Google: palavras-chave, cliques, erros de indexação e cobertura de páginas.
        </p>

        <div className="field field--simple" style={{ maxWidth: 500, marginBottom: 14 }}>
          <label htmlFor="gsc-tag">Código de verificação ou tag HTML</label>
          <textarea
            id="gsc-tag"
            rows={2}
            placeholder={'abc123xyz...  ou cole a <meta name="google-site-verification" ...> completa'}
            value={searchConsoleTag}
            onChange={(e) => setSearchConsoleTag(e.target.value)}
            onBlur={(e) => setSearchConsoleTag(extractSearchConsole(e.target.value))}
            spellCheck={false}
            style={{ fontFamily: "monospace", fontSize: "0.88rem", resize: "vertical" }}
          />
          <small style={{ color: "var(--text-mute)" }}>
            Cole a meta tag completa ou apenas o valor do atributo content — será extraído automaticamente.
          </small>
        </div>

        <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid var(--line-soft)", fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text)" }}>Como verificar:</strong> acesse{" "}
          <strong>search.google.com/search-console</strong> → Adicionar propriedade → Prefixo de URL → Método &ldquo;Tag HTML&rdquo;.
          Copie apenas o conteúdo do atributo <code style={{ fontFamily: "monospace" }}>content=&quot;...&quot;</code> e cole acima.
          Após salvar, clique em &ldquo;Verificar&rdquo; no Search Console.
        </div>
      </div>

      {/* Checklist SEO / Performance */}
      <div className="admin-card">
        <h2 style={{ marginBottom: 20 }}>Status de SEO e Performance</h2>
        <p className="muted" style={{ marginBottom: 20 }}>Recursos ativos para melhor desempenho no Google e nos navegadores.</p>
        {[
          { label: "Otimização de imagens", detail: "Sharp + WebP/AVIF automático para carregamento mais rápido", ok: true },
          { label: "Cache ISR nas páginas públicas", detail: "Revalidação a cada 60s — serve HTML estático sem consulta ao banco", ok: true },
          { label: "Security headers", detail: "X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy", ok: true },
          { label: "Sitemap dinâmico", detail: "/sitemap.xml com todas as páginas de produto, atualizado automaticamente", ok: true },
          { label: "Metadados Open Graph", detail: "Título e imagem otimizados para compartilhamento em redes sociais", ok: true },
          { label: "Página individual por produto", detail: "URLs únicas /produtos/[slug] com título e descrição próprios por produto", ok: true },
          { label: "Google Analytics 4", detail: "Rastreamento de tráfego e comportamento", ok: gaActive },
          { label: "Meta Pixel", detail: "Rastreamento de conversões para campanhas no Facebook/Instagram", ok: pixelActive },
          { label: "Google Search Console", detail: "Monitoramento de indexação e performance nos resultados de busca", ok: searchConsoleActive }
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: item.ok ? "var(--success)" : "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              {item.ok
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" aria-hidden><path d="M20 6L9 17l-5-5"/></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-mute)" strokeWidth="3" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>}
            </span>
            <div>
              <strong style={{ fontSize: "0.92rem", color: "var(--text)" }}>{item.label}</strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-mute)", marginTop: 2 }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status e ações */}
      {saveState === "error" && (
        <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <strong>Erro ao salvar.</strong> Verifique a conexão e tente novamente.
        </div>
      )}

      <div style={{ paddingBottom: 100 }} />

      <div className="form-actions-fixed">
        {saveState === "error" && (
          <span style={{ color: "var(--danger)", fontSize: "0.85rem" }}>Erro ao salvar.</span>
        )}
        {saveState === "saved" && (
          <span style={{ color: "var(--success)", fontSize: "0.85rem" }}>✓ Salvo!</span>
        )}
        <button
          className="btn"
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
        >
          {saveState === "saving" ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </>
  );
}
