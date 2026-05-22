"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { CartButton } from "@/components/cart-button";
import { MobileMenu } from "@/components/mobile-menu";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/contato", label: "Contato" }
];

export function SiteHeader(): JSX.Element {
  const pathname = usePathname();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" aria-label="Ceará Auto Elétrica e Bateria">
          <BrandLogo size={52} />
        </Link>

        <nav aria-label="Navegação principal">
          <ul className="nav-list">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link href={link.href} className={active ? "is-active" : ""}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-cta">
          <CartButton />
          <a
            className="btn btn--wpp"
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            data-magnetic
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
            </svg>
            WhatsApp
          </a>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
