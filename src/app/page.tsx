import Link from "next/link";

import { Counter } from "@/components/counter";
import { MarqueeBar } from "@/components/marquee-bar";
import { ProductCardItem } from "@/components/product-card-item";
import { listActiveProducts } from "@/lib/products";

export default async function HomePage(): Promise<JSX.Element> {
  const products = await listActiveProducts();
  const featured = products.slice(0, 4);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="floating-dots" />
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">Auto elétrica &amp; baterias · Linha pesada</span>
            <h1 className="split">
              Peças que <span className="red">movem</span> seu caminhão.
            </h1>
            <p className="lead">
              Equipe treinada, atendimento rápido e foco total em reduzir o tempo de parada.
              Especialistas em sistemas <strong>Arla-Euro 5 e 6</strong> com diagnóstico técnico
              de verdade — não chute.
            </p>
            <div className="hero-actions">
              <Link href="/produtos" className="btn btn--lg" data-magnetic>
                Ver catálogo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn btn--wpp btn--lg" data-magnetic>
                Falar agora
              </a>
              <Link href="/contato" className="btn btn--ghost btn--lg">
                Solicitar orçamento
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="gear" />
            <div className="gear-tag">
              <span>Especialistas</span>
              <strong>
                Arla 32<br />Euro 5 · 6
              </strong>
              <em>diagnóstico técnico</em>
            </div>
          </div>
        </div>

        <MarqueeBar />
      </section>

      {/* ============ STATS ============ */}
      <section className="section section--dark" style={{ paddingTop: "40px" }}>
        <div className="container">
          <div className="stats" data-stagger>
            <div className="stat-card">
              <div className="stat-num"><Counter to={15} /><small>+</small></div>
              <div className="stat-label">Anos de estrada</div>
            </div>
            <div className="stat-card">
              <div className="stat-num"><Counter to={3200} /><small>+</small></div>
              <div className="stat-label">Caminhões atendidos</div>
            </div>
            <div className="stat-card">
              <div className="stat-num"><Counter to={98} /><small>%</small></div>
              <div className="stat-label">Clientes satisfeitos</div>
            </div>
            <div className="stat-card">
              <div className="stat-num"><Counter to={24} /><small>h</small></div>
              <div className="stat-label">Resposta no WhatsApp</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIAS ============ */}
      <section className="section section--dark">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">O que fazemos</span>
            <h2>Soluções completas para sua linha pesada.</h2>
            <p>De sistemas Arla 32 a baterias e módulos eletrônicos — diagnóstico, peça correta e instalação no padrão técnico.</p>
          </div>

          <div className="cat-grid" data-stagger>
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M5 13l3-7h8l3 7M5 13v6h14v-6M5 13h14" />
                    <circle cx="8" cy="17" r="1.2" /><circle cx="16" cy="17" r="1.2" />
                  </svg>
                ),
                title: "Sistema Arla 32",
                desc: "Diagnóstico completo, reparo e substituição de bombas, sensores e catalisadores SCR (Euro 5 / Euro 6)."
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M6 8h12v10H6z" /><path d="M9 8V5h6v3" /><path d="M10 13h4M12 11v4" />
                  </svg>
                ),
                title: "Baterias",
                desc: "Baterias para caminhão, estacionárias e linha agrícola — Moura, Heliar e principais marcas. Teste no veículo."
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                  </svg>
                ),
                title: "Auto Elétrica",
                desc: "Alternadores, motores de partida, chicotes, módulos ECU e diagnóstico eletrônico com scanner profissional."
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                  </svg>
                ),
                title: "Sensores",
                desc: "NOx, MAP, MAF, temperatura, pressão — originais e linha homologada para cada marca e ano de fabricação."
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                  </svg>
                ),
                title: "Diagnóstico",
                desc: "Scanner OEM, leitura de DTC, calibração de injetores, verificação de circuitos e laudo técnico."
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M4 17l5-5 4 4 7-9" /><path d="M15 7h5v5" />
                  </svg>
                ),
                title: "Atendimento Frota",
                desc: "Condições especiais para transportadoras, fretes e frotas locadas. Suporte prioritário e nota fiscal."
              }
            ].map((cat) => (
              <Link href="/produtos" key={cat.title} className="cat-card" data-tilt>
                <div className="cat-icon">{cat.icon}</div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
                <span className="cat-link">
                  Ver mais
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DESTAQUES ============ */}
      {featured.length > 0 && (
        <section className="section section--surface">
          <div className="container">
            <div className="section-head" data-reveal>
              <span className="eyebrow">Em destaque</span>
              <h2>Os mais procurados da semana.</h2>
              <p>Disponibilidade real em estoque. Clique em qualquer item para adicionar e finalizar pelo WhatsApp.</p>
            </div>

            <div className="products-grid" data-stagger>
              {featured.map((p) => (
                <ProductCardItem key={p.id} product={p} />
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 40 }} data-reveal>
              <Link href="/produtos" className="btn btn--ghost btn--lg">
                Ver catálogo completo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ AUTORIDADE ============ */}
      <section className="section section--dark">
        <div className="container authority">
          <div data-reveal="left">
            <span className="eyebrow">Por que escolher a Ceará</span>
            <p className="quote">
              Não trocamos peça <span className="accent">sem diagnóstico</span>.
              Aqui o seu caminhão sai <span className="accent">resolvido</span> — não &ldquo;tentando&rdquo;.
            </p>
            <ul className="authority-list">
              {[
                "Equipe treinada em sistemas Arla, Euro 5 e Euro 6",
                "Scanner OEM para Volvo, Scania, Mercedes, Iveco, DAF, MAN",
                "Peças originais e linha homologada com nota fiscal",
                "Atendimento rápido — orçamento no WhatsApp em minutos"
              ].map((item) => (
                <li key={item}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn btn--wpp" data-magnetic>
                Chamar no WhatsApp
              </a>
              <Link href="/contato" className="btn btn--ghost">Solicitar orçamento</Link>
            </div>
          </div>

          <div className="badges-card" data-reveal="right">
            <div className="badges-inner">
              {[
                {
                  ico: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                  title: "Garantia técnica",
                  desc: "30 a 90 dias na peça e no serviço"
                },
                {
                  ico: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                    </svg>
                  ),
                  title: "Atendimento ágil",
                  desc: "Resposta em até 30 minutos no WhatsApp"
                },
                {
                  ico: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" />
                    </svg>
                  ),
                  title: "Peças certificadas",
                  desc: "Bosch, Delphi, Moura, Heliar e originais OEM"
                },
                {
                  ico: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  ),
                  title: "Diagnóstico real",
                  desc: "Scanner profissional + laudo técnico"
                }
              ].map((b) => (
                <div className="badge-pill" key={b.title}>
                  {b.ico}
                  <div>
                    <strong>{b.title}</strong>
                    <span>{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ DEPOIMENTOS ============ */}
      <section className="section section--darker">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">Quem conhece, recomenda</span>
            <h2>Caminhoneiros e frotas falam por nós.</h2>
          </div>

          <div className="testimonials" data-stagger>
            {[
              {
                text: "Tive problema de Arla no meio da estrada. Cheguei na Ceará, em 2 horas o caminhão já estava rodando. Atendimento técnico de verdade.",
                name: "Ricardo Mendes",
                role: "Caminhoneiro autônomo · Volvo FH",
                initial: "R"
              },
              {
                text: "Tenho 8 carretas Scania na empresa. Sempre que precisamos, a Ceará resolve. Preço justo, peça certa e equipe que entende do assunto.",
                name: "Marcos Silva",
                role: "Frota MS Transportes",
                initial: "M"
              },
              {
                text: "Outras oficinas trocavam peça por peça tentando descobrir o problema. Aqui fizeram o diagnóstico certo na primeira ida. Salvou meu mês.",
                name: "João Pereira",
                role: "Frota JP Logística",
                initial: "J"
              }
            ].map((t) => (
              <article className="testimonial" key={t.name}>
                <p>&ldquo;{t.text}&rdquo;</p>
                <div className="who">
                  <div className="avatar">{t.initial}</div>
                  <div>
                    <div className="name">{t.name}</div>
                    <div className="role">{t.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-stripe">
        <div className="container cta-inner" data-reveal>
          <div>
            <span className="eyebrow">Pronto para resolver?</span>
            <h2>
              Seu caminhão <span className="accent">não pode parar.</span>
              <br />
              A gente também não.
            </h2>
            <p>Mande a foto da peça ou descreva o problema. Em minutos você recebe orçamento e disponibilidade.</p>
          </div>
          <div className="cta-actions">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn btn--wpp btn--lg" data-magnetic>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
              </svg>
              Chamar no WhatsApp
            </a>
            <Link href="/produtos" className="btn btn--ghost btn--lg">Ver catálogo</Link>
          </div>
        </div>
      </section>
    </>
  );
}
