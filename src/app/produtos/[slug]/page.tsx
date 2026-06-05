import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatCurrency } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 300;

type Params = { slug: string };

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } }
    }
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Produto não encontrado" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const description = (product.shortDescription ?? product.description).slice(0, 155);
  const hasImage = product.imageMain && product.imageMain !== "/placeholder-product.svg";

  return {
    title: product.name,
    description,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      ...(hasImage && {
        images: [{ url: `${siteUrl}${product.imageMain}`, width: 800, height: 800, alt: product.name }]
      })
    }
  };
}

export default async function ProductPage({ params }: { params: Params }): Promise<JSX.Element> {
  const [product, settings] = await Promise.all([getProduct(params.slug), getSiteSettings()]);

  if (!product) notFound();

  const price = Number(product.price);
  const promoPrice = product.promoPrice ? Number(product.promoPrice) : null;
  const isPromo = Boolean(promoPrice && promoPrice < price);
  const displayPrice = isPromo ? promoPrice! : price;
  const discount = isPromo ? Math.round(((price - promoPrice!) / price) * 100) : 0;

  const allImages = [
    product.imageMain,
    ...product.images.map((img) => img.imagePath)
  ].filter((img) => img && img !== "/placeholder-product.svg");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    sku: product.sku ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: product.imageMain && product.imageMain !== "/placeholder-product.svg"
      ? `${siteUrl}${product.imageMain}`
      : undefined,
    offers: {
      "@type": "Offer",
      price: displayPrice.toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/produtos/${product.slug}`
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Produtos", item: `${siteUrl}/produtos` },
      ...(product.category ? [{ "@type": "ListItem", position: 3, name: product.category.name }] : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name, item: `${siteUrl}/produtos/${product.slug}` }
    ]
  };

  const wppMsg = encodeURIComponent(
    `Olá! Vim pelo site e tenho interesse no produto:\n*${product.name}*\nPreço: ${formatCurrency(displayPrice)}\n${siteUrl}/produtos/${product.slug}\n\nGostaria de mais informações.`
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="page-hero" style={{ paddingBottom: "1.5rem" }}>
        <div className="floating-dots" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <nav className="breadcrumb" aria-label="Caminho de navegação">
            <Link href="/">Início</Link>
            <span aria-hidden>/</span>
            <Link href="/produtos">Produtos</Link>
            {product.category && (
              <>
                <span aria-hidden>/</span>
                <span>{product.category.name}</span>
              </>
            )}
          </nav>
        </div>
      </section>

      <section className="section section--dark" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className="product-detail-grid">
            {/* Imagens */}
            <div className="product-detail-images">
              <div className="product-detail-main-img">
                {allImages.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={allImages[0]} alt={product.name} loading="eager" />
                ) : (
                  <div className="product-detail-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                      <path d="M3 7l9-4 9 4-9 4-9-4z" />
                      <path d="M3 7v10l9 4 9-4V7" />
                      <path d="M12 11v10" />
                    </svg>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="product-detail-thumbs">
                  {allImages.slice(1).map((img, i) => (
                    <div key={i} className="product-detail-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`${product.name} — imagem ${i + 2}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="product-detail-info">
              {product.category && (
                <span className="eyebrow">{product.category.name}</span>
              )}
              <h1>{product.name}</h1>

              {product.shortDescription && (
                <p className="lead" style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
                  {product.shortDescription}
                </p>
              )}

              <div className="product-detail-pricing">
                {isPromo && (
                  <>
                    <span className="badge" style={{ marginBottom: 4 }}>-{discount}%</span>
                    <span className="price-old">{formatCurrency(price)}</span>
                  </>
                )}
                <span className="price-current">{formatCurrency(displayPrice)}</span>
              </div>

              <div className="product-detail-actions">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price,
                    promoPrice,
                    imageMain: product.imageMain
                  }}
                />
                <a
                  href={`https://wa.me/${settings.whatsapp_primary}?text=${wppMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--wpp btn--lg"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
                  </svg>
                  Pedir pelo WhatsApp
                </a>
              </div>

              {(product.brand || product.sku) && (
                <dl className="product-specs">
                  {product.brand && (
                    <><dt>Marca</dt><dd>{product.brand}</dd></>
                  )}
                  {product.sku && (
                    <><dt>SKU / Referência</dt><dd>{product.sku}</dd></>
                  )}
                </dl>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="product-detail-description">
            <h2>Descrição</h2>
            <div className="product-detail-desc-body">
              {product.description.split("\n").map((line, i) =>
                line.trim() ? <p key={i}>{line}</p> : <br key={i} />
              )}
            </div>
          </div>

          <div style={{ paddingBottom: 56 }}>
            <Link href="/produtos" className="btn btn--ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Ver todos os produtos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
