"use client";

import { usePathname } from "next/navigation";

import { CartDrawer } from "@/components/cart-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppSticky } from "@/components/whatsapp-sticky";

/**
 * Renderiza o "casco" do site público (header, footer, sticky e drawer do carrinho).
 * Quando a rota for do admin, retorna null — o admin tem seu próprio layout.
 */
export function PublicShell({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <div className="top-stripe" />
      <SiteHeader />
      <main className="page-intro">{children}</main>
      <SiteFooter />
      <WhatsAppSticky />
      <CartDrawer />
    </>
  );
}
