import { prisma } from "@/lib/prisma";
import type { ProductCard } from "@/types/product";

export async function listActiveProducts(): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { isActive: true } },
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    imageMain: product.imageMain,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
    categoryName: product.category.name,
    categorySlug: product.category.slug
  }));
}
