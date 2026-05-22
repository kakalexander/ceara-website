import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import "@/app/globals.css";
import { CartProvider } from "@/components/cart-provider";
import { PublicShell } from "@/components/public-shell";
import { RevealInit } from "@/components/reveal-init";

const brandFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand",
  display: "swap"
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Ceará Auto Elétrica e Bateria — Peças e serviços para linha pesada",
  description:
    "Especialistas em sistemas Arla-Euro 5 e 6. Peças, baterias e auto elétrica para caminhão com atendimento técnico rápido em Goiás.",
  openGraph: {
    title: "Ceará Auto Elétrica e Bateria",
    description: "Peças e serviços técnicos para caminhão. Atendimento via WhatsApp.",
    type: "website",
    locale: "pt_BR"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="pt-BR" className={`${brandFont.variable} ${bodyFont.variable}`}>
      <body>
        <CartProvider>
          <PublicShell>{children}</PublicShell>
          <RevealInit />
        </CartProvider>
      </body>
    </html>
  );
}
