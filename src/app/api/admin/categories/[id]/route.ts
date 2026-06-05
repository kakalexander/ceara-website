import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

function parseCategoryId(value: string | null): number | null {
  if (!value) return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });

  const id = parseCategoryId(params.id);
  if (!id) return NextResponse.json({ error: "Id invalido." }, { status: 400 });

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } }
  });
  if (!category) return NextResponse.json({ error: "Categoria nao encontrada." }, { status: 404 });

  const { _count, ...rest } = category;
  return NextResponse.json({ ...rest, productCount: _count.products });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });

  const id = parseCategoryId(params.id);
  if (!id) return NextResponse.json({ error: "Id invalido." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const schema = z.object({
    name: z.string().min(2).max(120),
    isActive: z.boolean().optional()
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Categoria nao encontrada." }, { status: 404 });

  const newSlug = slugify(parsed.data.name);
  const slugOwner = await prisma.category.findUnique({ where: { slug: newSlug } });
  if (slugOwner && slugOwner.id !== id) {
    return NextResponse.json({ error: "Ja existe categoria com esse nome." }, { status: 409 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: newSlug,
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive })
    }
  });

  return NextResponse.json(category);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });

  const id = parseCategoryId(params.id);
  if (!id) return NextResponse.json({ error: "Id invalido." }, { status: 400 });

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } }
  });
  if (!category) return NextResponse.json({ error: "Categoria nao encontrada." }, { status: 404 });

  const productCount = category._count.products;

  if (productCount > 0) {
    const { searchParams } = new URL(request.url);
    const moveToId = parseCategoryId(searchParams.get("moveTo"));

    if (!moveToId) {
      return NextResponse.json({
        error: "categoria_has_products",
        productCount,
        message: `Esta categoria possui ${productCount} produto(s). Selecione outra categoria para transferi-los antes de excluir.`
      }, { status: 409 });
    }

    if (moveToId === id) {
      return NextResponse.json({ error: "Categoria destino deve ser diferente da atual." }, { status: 400 });
    }

    const target = await prisma.category.findUnique({ where: { id: moveToId } });
    if (!target) {
      return NextResponse.json({ error: "Categoria destino nao encontrada." }, { status: 404 });
    }

    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: moveToId }
    });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
