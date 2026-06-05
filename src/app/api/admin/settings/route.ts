import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const settings = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json(map);
}

export async function PUT(request: Request): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { key: string; value: string }
    | null;

  if (!body || typeof body.key !== "string" || typeof body.value !== "string") {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const setting = await prisma.siteSetting.upsert({
    where: { key: body.key },
    update: { value: body.value },
    create: { key: body.key, value: body.value }
  });

  return NextResponse.json({ key: setting.key, value: setting.value });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, string>
    | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const entries = Object.entries(body).filter(
    ([k, v]) => typeof k === "string" && typeof v === "string"
  );

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    )
  );

  return NextResponse.json({ updated: entries.length });
}
