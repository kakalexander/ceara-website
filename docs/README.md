# Ceará Auto Elétrica e Bateria — Site Institucional + Catálogo

Site institucional com catálogo gerenciável, carrinho e finalização via WhatsApp para a **Ceará Auto Elétrica e Bateria**, especialistas em linha pesada (Arla-Euro 5 e 6, baterias, sensores e auto elétrica).

## Visão geral

O projeto entrega quatro pilares:

1. **Site público** com identidade visual cinematográfica (vermelho/preto industrial), animações ao scroll, microinterações e foco em conversão para WhatsApp.
2. **Catálogo** alimentado por banco de dados MySQL, com filtros por categoria, busca em tempo real e preço promocional.
3. **Carrinho** persistente em localStorage que finaliza pedidos via mensagem automática no WhatsApp.
4. **Painel administrativo** para o cliente gerenciar categorias, produtos, imagens, preços e promoções sem ajuda técnica.

## Páginas

| Rota | O que entrega |
|---|---|
| `/` | Hero com engrenagem rotativa, stats animados, 6 categorias com tilt 3D, destaques, autoridade técnica, depoimentos, CTA WhatsApp. |
| `/produtos` | Catálogo com busca, chips de filtro por categoria, cards com badge de promoção. |
| `/quem-somos` | Hero + KPIs animados, linha do tempo (2010 → 2026), 4 pilares de trabalho. |
| `/contato` | Cards de contato com micro-hover, formulário com floating labels que abre WhatsApp pré-preenchido, mapa. |
| `/admin/login` | Tela de acesso com identidade da marca. |
| `/admin` | Dashboard com KPIs e atalhos. |
| `/admin/produtos` | CRUD completo com upload de imagem, switch de ativo/destaque, edição inline. |
| `/admin/categorias` | CRUD de categorias com slug automático. |

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma ORM** + **MySQL 8** (compatível com MariaDB da Hostinger)
- **Auth** com JWT em cookie httpOnly (sessão de 7 dias)
- **Bcrypt** para hash de senhas
- **Zod** para validação
- Fontes Google: **Barlow Condensed** (display industrial) + **Inter** (corpo)
- Animações em CSS puro + IntersectionObserver (sem GSAP, sem Framer)

## Estrutura de pastas

```
ceara-website/
├─ docs/                      ← Você está aqui
├─ mockup/                    ← Protótipo HTML validado com o cliente
├─ prisma/                    ← schema.prisma + seed.ts
├─ public/                    ← Assets estáticos (uploads de produtos vão aqui)
├─ src/
│  ├─ app/
│  │  ├─ (rotas públicas)/    ← page.tsx, /produtos, /quem-somos, /contato
│  │  ├─ admin/               ← /admin/login + /admin/(protected)/*
│  │  ├─ api/                 ← Rotas de API (admin login, products, categories, upload)
│  │  ├─ layout.tsx           ← Root layout
│  │  └─ globals.css          ← Design system completo (30+ módulos)
│  ├─ components/             ← Header, footer, drawer, cards, forms, animações
│  ├─ lib/                    ← prisma, auth, currency, pricing, products, slugify
│  ├─ types/                  ← Tipos TS compartilhados
│  └─ middleware.ts           ← Proteção de rotas /admin/*
├─ .env.example               ← Modelo de variáveis
└─ package.json
```

## Próximas leituras

1. [SETUP.md](./SETUP.md) — Como rodar localmente
2. [ARQUITETURA.md](./ARQUITETURA.md) — Decisões técnicas e fluxos
3. [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) — Tokens, componentes, animações
4. [DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md) — Subir em produção
5. [MANUAL-ADMIN.md](./MANUAL-ADMIN.md) — Manual para o cliente (não-técnico)
