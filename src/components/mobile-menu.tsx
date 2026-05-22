"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/contato", label: "Contato" }
];

export function MobileMenu(): JSX.Element {
  const [open, setOpen] = useState(false);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";

  return (
    <>
      <button className="menu-toggle" aria-label="Abrir menu" onClick={() => setOpen(true)} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <nav className={`mobile-nav ${open ? "is-open" : ""}`} onClick={() => setOpen(false)}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
          <li>
            <a className="btn btn--wpp" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
