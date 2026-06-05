import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import Script from "next/script";

import "@/app/globals.css";
import { CartProvider } from "@/components/cart-provider";
import { PublicShell } from "@/components/public-shell";
import { RevealInit } from "@/components/reveal-init";
import { SettingsProvider } from "@/components/settings-context";
import { getSiteSettings } from "@/lib/site-settings";

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

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const settings = await getSiteSettings();
  const gaId = settings.ga_measurement_id;
  const pixelId = settings.meta_pixel_id;

  return (
    <html lang="pt-BR" className={`${brandFont.variable} ${bodyFont.variable}`}>
      <body>
        <SettingsProvider settings={settings}>
          <CartProvider>
            <PublicShell>{children}</PublicShell>
            <RevealInit />
          </CartProvider>
        </SettingsProvider>

        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}

        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
