import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const updateSchema = z.object({
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

function parseProductId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function validatePromoPrice(price: number, promoPrice?: number | null): string | null {
  if (promoPrice == null) return null;
  if (promoPrice <= 0 || promoPrice >= price) {
    return "Preco promocional precisa ser maior que zero e menor que o preco normal.";
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }
  const productId = parseProductId(params.id);
  if (!productId) {
    return NextResponse.json({ error: "Id de produto invalido." }, { status: 400 });
  }
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } }
  });
  if (!product) {
    return NextResponse.json({ error: "Produto nao encontrado." }, { status: 404 });
  }
  return NextResponse.json({
    ...product,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : null
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }
  const productId = parseProductId(params.id);
  if (!productId) {
    return NextResponse.json({ error: "Id de produto invalido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos para produto." }, { status: 400 });
  }

  const promoError = validatePromoPrice(parsed.data.price, parsed.data.promoPrice);
  if (promoError) {
    return NextResponse.json({ error: promoError }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return NextResponse.json({ error: "Produto nao encontrado." }, { status: 404 });
  }

  const nextSlug = slugify(parsed.data.name);
  const slugOwner = await prisma.product.findUnique({ where: { slug: nextSlug } });
  if (slugOwner && slugOwner.id !== productId) {
    return NextResponse.json({ error: "Ja existe produto com esse nome." }, { status: 409 });
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      slug: nextSlug,
      shortDescription: parsed.data.shortDescription ?? null,
      description: parsed.data.description,
      price: new Prisma.Decimal(parsed.data.price),
      promoPrice:
        parsed.data.promoPrice == null ? null : new Prisma.Decimal(parsed.data.promoPrice),
      sku: parsed.data.sku ?? null,
      brand: parsed.data.brand ?? null,
      imageMain: parsed.data.imageMain,
      isActive: parsed.data.isActive,
      isFeatured: parsed.data.isFeatured
    },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } }
  });

  await prisma.productImage.deleteMany({ where: { productId } });
  if (parsed.data.extraImages.length > 0) {
    await prisma.productImage.createMany({
      data: parsed.data.extraImages.map((imagePath, i) => ({
        productId,
        imagePath,
        sortOrder: i + 1
      }))
    });
  }

  return NextResponse.json({
    ...updated,
    price: Number(updated.price),
    promoPrice: updated.promoPrice ? Number(updated.promoPrice) : null
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }
  const productId = parseProductId(params.id);
  if (!productId) {
    return NextResponse.json({ error: "Id de produto invalido." }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return NextResponse.json({ error: "Produto nao encontrado." }, { status: 404 });
  }

  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ success: true });
}
