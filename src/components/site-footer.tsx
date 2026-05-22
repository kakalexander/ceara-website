import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter(): JSX.Element {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";
  const phoneSecondary = process.env.NEXT_PUBLIC_WHATSAPP_SECONDARY ?? "556230986879";

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <BrandLogo size={48} showText={false} />
            <p>Peças, baterias e auto elétrica para linha pesada com atendimento técnico de verdade.</p>
            <div className="socials">
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-2.9h2.4V9.4c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8h2.6l-.4 2.9h-2.2v7A10 10 0 0022 12z" />
                </svg>
              </a>
              <a href={`https://wa.me/${whatsapp}`} aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navegação</h4>
            <Link href="/">Início</Link>
            <Link href="/produtos">Produtos</Link>
            <Link href="/quem-somos">Quem somos</Link>
            <Link href="/contato">Contato</Link>
          </div>

          <div className="footer-col">
            <h4>Contato</h4>
            <a href={`tel:+${whatsapp}`}>(62) 99200-2643</a>
            <a href={`tel:+${phoneSecondary}`}>(62) 3098-6879</a>
            <a href="mailto:contato@cearaautoeletrica.com.br">contato@cearaautoeletrica.com.br</a>
          </div>

          <div className="footer-col">
            <h4>Horário</h4>
            <span>Seg–Sex: 08h às 18h</span>
            <span>Sábado: 08h às 12h</span>
            <span>Domingo: fechado</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ceará Auto Elétrica e Bateria. Todos os direitos reservados.</span>
          <span>Feito com vermelho, preto e atenção aos detalhes.</span>
        </div>
      </div>
    </footer>
  );
}
