import type { Metadata } from "next";
import Link from "next/link";

import { ProductCatalog } from "@/components/product-catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { listActiveCategories } from "@/lib/categories";
import { listActiveProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Produtos | Ceará Auto Elétrica e Bateria",
  description:
    "Catálogo de peças, baterias, sensores e auto elétrica para linha pesada. Adicione ao carrinho e finalize pelo WhatsApp."
};

export const revalidate = 60;

export default async function ProductsPage(): Promise<JSX.Element> {
  const [products, categories, settings] = await Promise.all([
    listActiveProducts(),
    listActiveCategories(),
    getSiteSettings()
  ]);
  const whatsapp = settings.whatsapp_primary;

  return (
    <>
      {/* hero da página */}
      <section className="page-hero">
        <div className="floating-dots" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow" data-reveal>Catálogo</span>
          <h1 data-reveal>
            Encontre a peça <span className="accent">certa</span> para o seu caminhão.
          </h1>
          <p className="lead" data-reveal>
            Use os filtros, a busca ou navegue pelas categorias. Adicione ao carrinho e finalize direto no WhatsApp.
          </p>
        </div>
      </section>

      <section className="section section--dark" style={{ paddingTop: 20 }}>
        <div className="container">
          <ProductCatalog products={products} categories={categories} />
        </div>
      </section>

      {/* CTA */}
      <section className="cta-stripe">
        <div className="container cta-inner" data-reveal>
          <div>
            <span className="eyebrow">Não achou a peça?</span>
            <h2>
              Manda a <span className="accent">foto da peça</span> ou o número do chassi.
            </h2>
            <p>Nossa equipe localiza pra você em minutos. Sem compromisso, sem complicação.</p>
          </div>
          <div className="cta-actions">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn btn--wpp btn--lg" data-magnetic>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
              </svg>
              Mandar foto / dúvida
            </a>
            <Link href="/contato" className="btn btn--ghost btn--lg">Ir para contato</Link>
          </div>
        </div>
      </section>
    </>
  );
}
