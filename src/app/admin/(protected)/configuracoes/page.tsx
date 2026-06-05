"use client";

import { useEffect, useState } from "react";

type FormData = {
  whatsapp_primary: string;
  whatsapp_secondary: string;
  email: string;
  instagram_url: string;
  facebook_url: string;
  business_hours_weekdays: string;
  business_hours_saturday: string;
  business_hours_sunday: string;
  address: string;
};

const INITIAL: FormData = {
  whatsapp_primary: "",
  whatsapp_secondary: "",
  email: "",
  instagram_url: "",
  facebook_url: "",
  business_hours_weekdays: "",
  business_hours_saturday: "",
  business_hours_sunday: "",
  address: ""
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function ConfiguracoesPage(): JSX.Element {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setForm({
          whatsapp_primary: data.whatsapp_primary ?? "",
          whatsapp_secondary: data.whatsapp_secondary ?? "",
          email: data.email ?? "",
          instagram_url: data.instagram_url ?? "",
          facebook_url: data.facebook_url ?? "",
          business_hours_weekdays: data.business_hours_weekdays ?? "Seg–Sex: 08h às 18h",
          business_hours_saturday: data.business_hours_saturday ?? "Sábado: 08h às 12h",
          business_hours_sunday: data.business_hours_sunday ?? "Domingo: fechado",
          address: data.address ?? ""
        });
      })
      .catch(() => setLoadError("Não foi possível carregar as configurações."));
  }, []);

  function set(key: keyof FormData, value: string): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(): Promise<void> {
    setSaveState("saving");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("error");
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Configurações do site</h1>
          <p className="small">
            Gerencie contatos, horários e redes sociais exibidos no site.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <strong>Erro:</strong> {loadError}
        </div>
      )}

      {/* WhatsApp */}
      <div className="admin-card">
        <h2 style={{ marginBottom: 20 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "middle", marginRight: 8, color: "var(--whatsapp)" }} aria-hidden>
            <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
          </svg>
          WhatsApp
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field field--simple">
            <label htmlFor="wpp-primary">Número principal <small className="muted">(somente dígitos com DDD + DDI)</small></label>
            <input
              id="wpp-primary"
              type="text"
              placeholder="5562992002643"
              value={form.whatsapp_primary}
              onChange={(e) => set("whatsapp_primary", e.target.value)}
            />
          </div>
          <div className="field field--simple">
            <label htmlFor="wpp-secondary">Número secundário / fixo</label>
            <input
              id="wpp-secondary"
              type="text"
              placeholder="556230986879"
              value={form.whatsapp_secondary}
              onChange={(e) => set("whatsapp_secondary", e.target.value)}
            />
          </div>
        </div>

        <p className="muted" style={{ marginTop: 8, fontSize: "0.82rem" }}>
          Formato: país + DDD + número, sem espaços ou traços. Ex: <code style={{ fontFamily: "monospace" }}>5562992002643</code>
        </p>
      </div>

      {/* Email e endereço */}
      <div className="admin-card">
        <h2 style={{ marginBottom: 20 }}>Contato e localização</h2>

        <div className="field field--simple" style={{ maxWidth: 400, marginBottom: 16 }}>
          <label htmlFor="email">E-mail de contato</label>
          <input
            id="email"
            type="email"
            placeholder="contato@cearaautoeletrica.com.br"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div className="field field--simple">
          <label htmlFor="address">Endereço completo</label>
          <input
            id="address"
            type="text"
            placeholder="Rua Exemplo, 123 — Bairro, Goiânia – GO"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
      </div>

      {/* Redes sociais */}
      <div className="admin-card">
        <h2 style={{ marginBottom: 20 }}>Redes sociais</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field field--simple">
            <label htmlFor="instagram">Instagram (URL completa)</label>
            <input
              id="instagram"
              type="url"
              placeholder="https://instagram.com/cearaautoeletrica"
              value={form.instagram_url}
              onChange={(e) => set("instagram_url", e.target.value)}
            />
          </div>
          <div className="field field--simple">
            <label htmlFor="facebook">Facebook (URL completa)</label>
            <input
              id="facebook"
              type="url"
              placeholder="https://facebook.com/cearaautoeletrica"
              value={form.facebook_url}
              onChange={(e) => set("facebook_url", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Horários */}
      <div className="admin-card">
        <h2 style={{ marginBottom: 20 }}>Horário de atendimento</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div className="field field--simple">
            <label htmlFor="hours-week">Segunda a sexta</label>
            <input
              id="hours-week"
              type="text"
              placeholder="Seg–Sex: 08h às 18h"
              value={form.business_hours_weekdays}
              onChange={(e) => set("business_hours_weekdays", e.target.value)}
            />
          </div>
          <div className="field field--simple">
            <label htmlFor="hours-sat">Sábado</label>
            <input
              id="hours-sat"
              type="text"
              placeholder="Sábado: 08h às 12h"
              value={form.business_hours_saturday}
              onChange={(e) => set("business_hours_saturday", e.target.value)}
            />
          </div>
          <div className="field field--simple">
            <label htmlFor="hours-sun">Domingo</label>
            <input
              id="hours-sun"
              type="text"
              placeholder="Domingo: fechado"
              value={form.business_hours_sunday}
              onChange={(e) => set("business_hours_sunday", e.target.value)}
            />
          </div>
        </div>
      </div>

      {saveState === "error" && (
        <div className="admin-card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <strong>Erro ao salvar.</strong> Verifique a conexão e tente novamente.
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", paddingBottom: 56 }}>
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
