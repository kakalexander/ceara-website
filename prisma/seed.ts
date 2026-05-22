import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: "Administrador"
    },
    create: {
      email: adminEmail,
      name: "Administrador",
      passwordHash,
      role: "admin"
    }
  });

  const categorySeeds = [
    "Bomba Arla 32",
    "Sensores",
    "Baterias",
    "Auto Eletrica"
  ];

  for (const categoryName of categorySeeds) {
    const slug = slugify(categoryName);
    await prisma.category.upsert({
      where: { slug },
      update: { name: categoryName, isActive: true },
      create: { name: categoryName, slug, isActive: true }
    });
  }

  const bombaArla = await prisma.category.findUnique({
    where: { slug: "bomba-arla-32" }
  });

  if (!bombaArla) {
    throw new Error("Category bomba-arla-32 not found during seed");
  }

  const sampleProducts: Array<{
    name: string;
    shortDescription: string;
    description: string;
    price: Prisma.Decimal;
    promoPrice: Prisma.Decimal | null;
    imageMain: string;
  }> = [
    {
      name: "Bomba Arla 32 Pesada",
      shortDescription: "Bomba Arla para linha pesada Euro 5/6.",
      description:
        "Produto para sistema de pos-tratamento com alta durabilidade e compatibilidade com linha diesel pesada.",
      price: new Prisma.Decimal("1290.00"),
      promoPrice: new Prisma.Decimal("1149.90"),
      imageMain: "/placeholder-product.svg"
    },
    {
      name: "Modulo de Controle Arla",
      shortDescription: "Modulo eletronico para sistema Arla.",
      description:
        "Modulo para diagnostico e controle do sistema Arla 32, indicado para manutencoes especializadas.",
      price: new Prisma.Decimal("890.00"),
      promoPrice: null,
      imageMain: "/placeholder-product.svg"
    }
  ];

  for (const productSeed of sampleProducts) {
    const slug = slugify(productSeed.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        ...productSeed,
        categoryId: bombaArla.id,
        isActive: true
      },
      create: {
        ...productSeed,
        slug,
        categoryId: bombaArla.id,
        isActive: true
      }
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "company_name" },
    update: { value: "Ceara Auto Eletrica e Bateria" },
    create: {
      key: "company_name",
      value: "Ceara Auto Eletrica e Bateria"
    }
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
