"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { useSettings } from "@/components/settings-context";

function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

export function SiteFooter(): JSX.Element {
  const {
    whatsapp_primary: whatsapp,
    whatsapp_secondary: phoneSecondary,
    instagram_url: instagramUrl,
    facebook_url: facebookUrl,
    email,
    business_hours_weekdays: hoursWeekdays,
    business_hours_saturday: hoursSaturday,
    business_hours_sunday: hoursSunday
  } = useSettings();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <BrandLogo size={48} showText={false} />
            <p>Peças, baterias e auto elétrica para linha pesada com atendimento técnico de verdade.</p>
            <div className="socials">
              <a href={instagramUrl} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1" fill="currentColor" />
                </svg>
              </a>
              <a href={facebookUrl} aria-label="Facebook">
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
            <a href={`tel:+${whatsapp}`}>{formatPhone(whatsapp)}</a>
            {phoneSecondary && <a href={`tel:+${phoneSecondary}`}>{formatPhone(phoneSecondary)}</a>}
            {email && <a href={`mailto:${email}`}>{email}</a>}
          </div>

          <div className="footer-col">
            <h4>Horário</h4>
            {hoursWeekdays && <span>{hoursWeekdays}</span>}
            {hoursSaturday && <span>{hoursSaturday}</span>}
            {hoursSunday && <span>{hoursSunday}</span>}
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
