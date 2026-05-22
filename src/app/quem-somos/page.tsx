import type { Metadata } from "next";
import Link from "next/link";

import { Counter } from "@/components/counter";

export const metadata: Metadata = {
  title: "Quem Somos | Ceará Auto Elétrica e Bateria",
  description:
    "Mais de 15 anos cuidando da linha pesada. Diagnóstico técnico, peças certas e equipe treinada em Arla, Euro 5 e Euro 6."
};

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Honestidade",
    desc: "Se a peça não precisa trocar, nós dizemos. Diagnóstico antes do orçamento — sempre."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
    ),
    title: "Agilidade",
    desc: "Tempo parado é dinheiro perdido. Atendemos em ordem de urgência operacional."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 17l5-5 4 4 7-9" /><path d="M15 7h5v5" />
      </svg>
    ),
    title: "Técnica",
    desc: "Equipe atualizada, scanner profissional e procedimentos baseados nos manuais de fábrica."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" />
      </svg>
    ),
    title: "Garantia",
    desc: "Peças certificadas e serviço com garantia formal — feito com tranquilidade pra rodar."
  }
];

const TIMELINE = [
  { year: 2010, title: "O começo", desc: "Fundação da Ceará Auto Elétrica em Goiás, com foco em reparos elétricos para caminhões da região." },
  { year: 2014, title: "Especialização técnica", desc: "Treinamento da equipe em sistemas eletrônicos Bosch, Delphi e nas novas tecnologias Euro 5." },
  { year: 2018, title: "Sistemas Arla 32 — Euro 5", desc: "Investimento em scanner OEM e estrutura para diagnóstico completo de sistemas SCR." },
  { year: 2022, title: "Atendimento Euro 6 + frotas", desc: "Estrutura ampliada para atender Euro 6 e contratos com transportadoras e frotas locadas." },
  { year: 2026, title: "Catálogo online", desc: "Lançamento da loja virtual de peças com cotação direta no WhatsApp — a evolução do nosso atendimento." }
];

export default function AboutPage(): JSX.Element {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";

  return (
    <>
      <section className="page-hero">
        <div className="floating-dots" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 820 }}>
            <span className="eyebrow" data-reveal>Nossa história</span>
            <h1 data-reveal>
              Mais de <span className="accent">uma década e meia</span> cuidando do que move o Brasil.
            </h1>
            <p className="lead" data-reveal>
              Começamos pequeno, com uma bancada, um multímetro e a vontade de resolver de verdade.
              Hoje somos referência em auto elétrica pesada e sistemas Arla 32 — Euro 5 e Euro 6 — atendendo
              autônomos, frotas e transportadoras com a mesma seriedade do primeiro dia.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--dark" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="stats" data-stagger>
            <div className="stat-card">
              <div className="stat-num"><Counter to={15} /><small>+</small></div>
              <div className="stat-label">Anos de mercado</div>
            </div>
            <div className="stat-card">
              <div className="stat-num"><Counter to={3200} /><small>+</small></div>
              <div className="stat-label">Caminhões atendidos</div>
            </div>
            <div className="stat-card">
              <div className="stat-num"><Counter to={12} /></div>
              <div className="stat-label">Profissionais na equipe</div>
            </div>
            <div className="stat-card">
              <div className="stat-num"><Counter to={450} /><small>+</small></div>
              <div className="stat-label">Frotas parceiras</div>
            </div>
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="section section--dark">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">Linha do tempo</span>
            <h2>De bancada de bairro a referência regional.</h2>
          </div>

          <div className="timeline">
            {TIMELINE.map((it) => (
              <article className="tl-item" key={it.year} data-reveal="left">
                <div className="tl-year">{it.year}</div>
                <h3>{it.title}</h3>
                <p>{it.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* valores */}
      <section className="section section--surface">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">Como trabalhamos</span>
            <h2>Os 4 pilares que sustentam nossa oficina.</h2>
          </div>

          <div className="cat-grid" data-stagger>
            {VALUES.map((v) => (
              <div className="cat-card" key={v.title} data-tilt>
                <div className="cat-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-stripe">
        <div className="container cta-inner" data-reveal>
          <div>
            <span className="eyebrow">Vem pra Ceará</span>
            <h2>
              Conheça a oficina <span className="accent">por dentro.</span>
            </h2>
            <p>Agende uma visita ou mande sua dúvida no WhatsApp. A gente atende como gostaria de ser atendido.</p>
          </div>
          <div className="cta-actions">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn btn--wpp btn--lg" data-magnetic>
              Falar agora no WhatsApp
            </a>
            <Link href="/contato" className="btn btn--ghost btn--lg">Ver localização</Link>
          </div>
        </div>
      </section>
    </>
  );
}
