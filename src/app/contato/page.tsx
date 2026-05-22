import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contato | Ceará Auto Elétrica e Bateria",
  description:
    "WhatsApp, telefone, e-mail e localização. Atendimento técnico para sua linha pesada com resposta em até 30 minutos."
};

export default function ContactPage(): JSX.Element {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";
  const phoneFixed = process.env.NEXT_PUBLIC_WHATSAPP_SECONDARY ?? "556230986879";

  return (
    <>
      <section className="page-hero">
        <div className="floating-dots" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 820 }}>
            <span className="eyebrow" data-reveal>Contato</span>
            <h1 data-reveal>
              Resposta em <span className="accent">30 minutos</span> ou menos.
            </h1>
            <p className="lead" data-reveal>
              WhatsApp é o canal mais rápido. Mas se preferir, ligue, mande e-mail ou venha tomar um café aqui na oficina.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container contact-grid">
          <div className="contact-info" data-reveal="left">
            <a className="info-card" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
              <div className="ic-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
                </svg>
              </div>
              <div>
                <strong>WhatsApp principal</strong>
                <span>(62) 99200-2643 — atendimento técnico e orçamentos</span>
              </div>
            </a>

            <a className="info-card" href={`tel:+${phoneFixed}`}>
              <div className="ic-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 1.9.6 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.5 2.8.6a2 2 0 011.7 2z" />
                </svg>
              </div>
              <div>
                <strong>Telefone fixo</strong>
                <span>(62) 3098-6879</span>
              </div>
            </a>

            <a className="info-card" href="mailto:contato@cearaautoeletrica.com.br">
              <div className="ic-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 6l8 6 8-6" />
                </svg>
              </div>
              <div>
                <strong>E-mail</strong>
                <span>contato@cearaautoeletrica.com.br</span>
              </div>
            </a>

            <div className="info-card">
              <div className="ic-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <strong>Endereço</strong>
                <span>Av. das Indústrias, 1234 — Aparecida de Goiânia / GO</span>
              </div>
            </div>

            <div className="info-card">
              <div className="ic-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div>
                <strong>Horário</strong>
                <span>Seg–Sex 08–18h · Sábado 08–12h</span>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* mapa placeholder */}
      <section className="section section--darker" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            data-reveal="scale"
            style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--line)",
              position: "relative",
              aspectRatio: "16 / 7",
              background:
                "radial-gradient(circle at 30% 40%, rgba(216,35,42,0.3), transparent 50%), linear-gradient(180deg, #0d0d12, #050507)",
              display: "grid",
              placeItems: "center"
            }}
          >
            <div style={{ textAlign: "center" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" aria-hidden>
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 style={{ marginTop: 12 }}>Av. das Indústrias, 1234</h3>
              <p style={{ color: "var(--text-soft)", marginTop: 8 }}>Aparecida de Goiânia · GO</p>
              <a
                href="https://maps.google.com/?q=Aparecida+de+Goiania"
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost"
                style={{ marginTop: 20 }}
              >
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
