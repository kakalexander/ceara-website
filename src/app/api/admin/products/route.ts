import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const productSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(2).max(180),
  shortDescription: z.string().max(255).nullable().optional(),
  description: z.string().min(8),
  price: z.number().positive(),
  promoPrice: z.number().positive().nullable().optional(),
  sku: z.string().max(80).nullable().optional(),
  brand: z.string().max(120).nullable().optional(),
  imageMain: z.string().min(1).default("/placeholder-product.svg"),
  extraImages: z.array(z.string().min(1)).max(3).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false)
});

function validatePromoPrice(price: number, promoPrice?: number | null): string | null {
  if (promoPrice == null) return null;
  if (promoPrice <= 0 || promoPrice >= price) {
    return "Preco promocional precisa ser maior que zero e menor que o preco normal.";
  }
  return null;
}

export async function GET(): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  const serialized = products.map((product) => ({
    ...product,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : null
  }));

  return NextResponse.json(serialized);
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos para produto." }, { status: 400 });
  }

  const promoError = validatePromoPrice(parsed.data.price, parsed.data.promoPrice);
  if (promoError) {
    return NextResponse.json({ error: promoError }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Ja existe produto com esse nome." }, { status: 409 });
  }

  const productData = {
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    slug,
    shortDescription: parsed.data.shortDescription ?? null,
    description: parsed.data.description,
    price: new Prisma.Decimal(parsed.data.price),
    promoPrice: parsed.data.promoPrice == null ? null : new Prisma.Decimal(parsed.data.promoPrice),
    sku: parsed.data.sku ?? null,
    brand: parsed.data.brand ?? null,
    imageMain: parsed.data.imageMain,
    isActive: parsed.data.isActive,
    isFeatured: parsed.data.isFeatured
  };

  const extraImageData = parsed.data.extraImages.map((imagePath, i) => ({
    imagePath,
    sortOrder: i + 1
  }));

  const [created] = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...productData,
        ...(extraImageData.length > 0 ? { images: { createMany: { data: extraImageData } } } : {})
      },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } }
    });
    return [product];
  });

  return NextResponse.json(
    {
      ...created,
      price: Number(created.price),
      promoPrice: created.promoPrice ? Number(created.promoPrice) : null
    },
    { status: 201 }
  );
}
