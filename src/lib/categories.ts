import { prisma } from "@/lib/prisma";

export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
};

export async function listActiveCategories(): Promise<CategoryItem[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  return categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
}
