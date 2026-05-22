import Link from "next/link";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  const [session, products, categories, active, promos, featured] = await Promise.all([
    getAdminSession(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { promoPrice: { not: null } } }),
    prisma.product.count({ where: { isFeatured: true } })
  ]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Painel</span>
          <h1>{greeting}, {session?.email.split("@")[0] ?? "admin"}.</h1>
        </div>
        <Link href="/admin/produtos" className="btn">
          + Novo produto
        </Link>
      </div>

      <div className="admin-kpis">
        <div className="kpi">
          <div className="kpi-num">{products}</div>
          <div className="kpi-label">Produtos cadastrados</div>
        </div>
        <div className="kpi">
          <div className="kpi-num">{active}</div>
          <div className="kpi-label">Ativos no site</div>
        </div>
        <div className="kpi">
          <div className="kpi-num">{promos}</div>
          <div className="kpi-label">Em promoção</div>
        </div>
        <div className="kpi">
          <div className="kpi-num">{featured}</div>
          <div className="kpi-label">Em destaque</div>
        </div>
        <div className="kpi">
          <div className="kpi-num">{categories}</div>
          <div className="kpi-label">Categorias</div>
        </div>
      </div>

      <div className="admin-card">
        <h2>Atalhos rápidos</h2>
        <p className="muted">Operações mais comuns do dia a dia.</p>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 18 }}>
          <Link href="/admin/produtos" className="btn btn--dark btn--block">
            Gerenciar produtos
          </Link>
          <Link href="/admin/categorias" className="btn btn--dark btn--block">
            Gerenciar categorias
          </Link>
          <Link href="/" target="_blank" className="btn btn--ghost btn--block">
            Ver site público
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <h2>Como usar este painel</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Resumo rápido das principais ações.
        </p>
        <ul style={{ display: "grid", gap: 10, paddingLeft: 18, listStyle: "disc" }}>
          <li><strong>Categorias</strong> — Crie antes de adicionar produtos (ex: &ldquo;Baterias&rdquo;, &ldquo;Arla&rdquo;).</li>
          <li><strong>Produtos</strong> — Adicione nome, descrição, preço e imagem. Marque como ativo para aparecer no site.</li>
          <li><strong>Preço promocional</strong> — Quando preenchido, o site mostra o preço antigo riscado e o novo em destaque.</li>
          <li><strong>Destaque</strong> — Produtos marcados aparecem primeiro na Home.</li>
          <li><strong>Imagem</strong> — Recomendado 800×600 px, formato JPG ou WEBP, até 2 MB.</li>
        </ul>
      </div>
    </>
  );
}
