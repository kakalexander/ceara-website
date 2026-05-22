import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel administrativo · Ceará Auto Elétrica",
  robots: { index: false, follow: false }
};

/**
 * Layout do admin (engloba também a tela de login).
 * Não renderiza header/footer do site público — só passa o children adiante,
 * deixando o root layout cuidar do HTML/body e providers.
 *
 * Os sub-layouts (login direto e (protected)) decidem o que mostrar.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}
