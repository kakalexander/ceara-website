# Arquitetura do projeto

Visão geral das decisões técnicas, fluxos e onde mexer em cada coisa.

## Stack escolhida

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 14 (App Router) + TypeScript                   │
│  ────────────────────────────────────────────────────── │
│  Server Components ──→ Páginas que consultam o banco    │
│  Client Components ──→ Animações, carrinho, formulários │
│  API Routes        ──→ /api/admin/* + /api/health       │
│  Middleware        ──→ Proteção de /admin/* (JWT)       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Prisma ORM                                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  MySQL 8 (local: Docker  |  produção: Hostinger)        │
└─────────────────────────────────────────────────────────┘
```

## Modelo de dados (Prisma)

| Tabela | Função | Campos-chave |
|---|---|---|
| `users` | Admins do painel | email único, passwordHash (bcrypt), role |
| `categories` | Categorias do catálogo | name, slug único, isActive |
| `products` | Produtos | name, slug, price, promoPrice (opcional), imageMain, isActive, isFeatured, categoryId |
| `product_images` | Galeria (opcional) | productId, imagePath, sortOrder |
| `site_settings` | Configurações key/value | usado para textos/telefones futuros sem deploy |

**Regras de negócio importantes:**
- `promoPrice` só é considerada válida quando `> 0 && < price` — lógica em `lib/pricing.ts`
- Produto **inativo** ou de **categoria inativa** não aparece no site público (filtro no `listActiveProducts`)
- Produto **featured** aparece primeiro na home (`orderBy: isFeatured desc`)

## Estrutura de pastas (src/)

```
src/
├─ app/
│  ├─ layout.tsx                 ← Root: fontes, CartProvider, PublicShell, RevealInit
│  ├─ globals.css                ← 30 módulos de CSS (1100+ linhas) — design system
│  ├─ page.tsx                   ← Home (Server Component, busca destaques)
│  ├─ produtos/page.tsx          ← Catálogo (Server: busca dados; ProductCatalog é Client)
│  ├─ quem-somos/page.tsx        ← Estático
│  ├─ contato/page.tsx           ← Renderiza ContactForm (Client)
│  ├─ robots.ts                  ← SEO
│  ├─ sitemap.ts                 ← SEO
│  ├─ admin/
│  │  ├─ layout.tsx              ← Pass-through (deixa o root cuidar)
│  │  ├─ login/page.tsx          ← Tela de login (Client)
│  │  └─ (protected)/
│  │     ├─ layout.tsx           ← Verifica sessão; se não autenticado → redirect /admin/login
│  │     ├─ page.tsx             ← Dashboard com KPIs
│  │     ├─ produtos/page.tsx    ← CRUD de produtos
│  │     └─ categorias/page.tsx  ← CRUD de categorias
│  └─ api/
│     ├─ health/route.ts         ← Healthcheck
│     └─ admin/
│        ├─ login/route.ts       ← Verifica email/senha → cookie JWT
│        ├─ logout/route.ts      ← Apaga cookie
│        ├─ upload/route.ts      ← Upload de imagem → public/uploads
│        ├─ categories/route.ts  ← GET (listar) + POST (criar)
│        └─ products/
│           ├─ route.ts          ← GET + POST
│           └─ [id]/route.ts     ← PUT + DELETE
├─ components/
│  ├─ public-shell.tsx           ← Decide se mostra header/footer (oculta em /admin)
│  ├─ site-header.tsx            ← Header fixo com brand, nav, cart, WhatsApp
│  ├─ site-footer.tsx            ← Footer 4 colunas industrial
│  ├─ mobile-menu.tsx            ← Menu fullscreen mobile
│  ├─ whatsapp-sticky.tsx        ← Botão flutuante com ping
│  ├─ cart-provider.tsx          ← Context global do carrinho (localStorage)
│  ├─ cart-button.tsx            ← Botão que abre o drawer
│  ├─ cart-drawer.tsx            ← Drawer lateral com checkout WhatsApp
│  ├─ product-card-item.tsx      ← Card de produto (usado em /produtos e /home)
│  ├─ product-catalog.tsx        ← Container do catálogo (filtros + grid)
│  ├─ marquee-bar.tsx            ← Faixa de marcas atendidas
│  ├─ counter.tsx                ← Contador animado quando entra na tela
│  ├─ reveal-init.tsx            ← Inicializa reveals/tilt/magnetic/header morph
│  ├─ contact-form.tsx           ← Form que abre WhatsApp pré-preenchido
│  ├─ brand-logo.tsx             ← Logo SVG inline (substituível por PNG)
│  └─ admin-nav.tsx              ← Sidebar do admin
├─ lib/
│  ├─ prisma.ts                  ← Singleton do Prisma Client
│  ├─ session.ts                 ← createSessionToken / verifySessionToken (jose)
│  ├─ admin-auth.ts              ← getAdminSession() para Server Components
│  ├─ currency.ts                ← formatCurrency (R$)
│  ├─ pricing.ts                 ← resolvePromotionalUnitPrice
│  ├─ slugify.ts                 ← Geração de slugs
│  ├─ products.ts                ← listActiveProducts (público)
│  └─ categories.ts              ← listActiveCategories
├─ types/
│  └─ product.ts                 ← ProductCard, CartItem
└─ middleware.ts                 ← Bloqueia /admin/* sem cookie JWT (exceto /admin/login)
```

## Fluxo: usuário navega e compra

```
1. Visita /produtos
   └─ Server fetcha listActiveProducts() do MySQL
   └─ Renderiza ProductCatalog com data inicial
   └─ Cliente filtra/busca em memória (rápido, sem ida ao server)

2. Adiciona produto ao carrinho
   └─ ProductCardItem chama useCart().add(produto)
   └─ CartProvider atualiza state + localStorage
   └─ Drawer abre automaticamente
   └─ Cart badge no header atualiza (count)

3. Finaliza no WhatsApp
   └─ Drawer monta mensagem com itens + total
   └─ encodeURIComponent + abre https://wa.me/{numero}?text=...
   └─ Cliente conversa direto com o atendimento
```

## Fluxo: admin gerencia produtos

```
1. /admin/login (POST → /api/admin/login)
   └─ Verifica bcrypt da senha
   └─ Gera JWT (jose, HS256, 7 dias)
   └─ Salva em cookie httpOnly "ceara_admin_session"

2. Middleware intercepta toda /admin/*
   └─ Se não tem cookie → redirect /admin/login
   └─ Se tem cookie → libera

3. ProtectedLayout (Server Component)
   └─ getAdminSession() valida o JWT
   └─ Se inválido → redirect /admin/login
   └─ Se válido → renderiza com AdminNav

4. CRUD de produtos
   └─ Página é Client Component
   └─ Faz fetch em /api/admin/products (GET, POST, PUT, DELETE)
   └─ Cada rota da API valida sessão antes de qualquer operação
   └─ Upload de imagem: POST /api/admin/upload → grava em /public/uploads
```

## Segurança

- **Senhas**: bcrypt com cost 10 (`bcryptjs`)
- **Sessão**: JWT assinado com `JWT_SECRET` (mínimo 32 chars), cookie httpOnly + sameSite=lax
- **CSRF**: protegido naturalmente por sameSite + métodos POST/PUT/DELETE com fetch same-origin
- **Validação**: cada endpoint admin valida payload com tipo + checagens explícitas antes de gravar
- **SQL Injection**: impossível com Prisma (parametrização nativa)
- **Upload**: extensões permitidas: png, jpg, jpeg, webp; tamanho máximo configurado no route handler

## SEO

- `metadata` exportado em cada page.tsx (title, description, OG)
- `robots.ts` permite indexação do público, bloqueia `/admin/*`
- `sitemap.ts` gera mapa do site
- URLs amigáveis: `/produtos` (e futuramente `/produtos/[slug]`)
- Schema.org via JSON-LD pode ser adicionado em fase 2

## Animações sem libs

O `RevealInit` (`components/reveal-init.tsx`) é um único componente client que sobrevive a navegações (re-roda em cada `pathname`) e cuida de:

1. **Reveal on scroll** — IntersectionObserver em `[data-reveal]` e `[data-stagger]`
2. **Tilt 3D** — `mousemove` calcula rotateX/rotateY em `[data-tilt]`
3. **Magnetic** — `mousemove` aplica translate em `[data-magnetic]`
4. **Header morph** — listener no scroll adiciona `.is-scrolled`
5. **Hero split** — quebra o `<h1 class="split">` em `.word` spans com delay incremental

Tudo respeita `prefers-reduced-motion` via CSS (transitions canceláveis automaticamente).

## Variáveis de ambiente

| Variável | Função | Onde é usada |
|---|---|---|
| `DATABASE_URL` | Conexão MySQL | `lib/prisma.ts` |
| `JWT_SECRET` | Assina os tokens de sessão | `lib/session.ts` |
| `NEXT_PUBLIC_SITE_URL` | URL canônica | sitemap, metadata |
| `NEXT_PUBLIC_WHATSAPP_PRIMARY` | Número principal | header, sticky, drawer, footer |
| `NEXT_PUBLIC_WHATSAPP_SECONDARY` | Número secundário | footer, contato |
| `ADMIN_EMAIL` | Email do primeiro admin | seed |
| `ADMIN_PASSWORD` | Senha do primeiro admin | seed |

`NEXT_PUBLIC_*` são expostas ao cliente. As outras só rodam no server.

## Performance

- **Fonts**: `next/font/google` com `display: swap` (Barlow Condensed + Inter)
- **Imagens**: `<img loading="lazy">` em produtos (Next/Image pode ser plugado depois)
- **JS**: animações em CSS quando possível; JS só onde precisa de cálculo (counter, tilt)
- **CSS**: um arquivo único compactado em produção (~30KB gzipped)
- **DB**: Prisma com índices em `categoryId` e `productId`

## Decisões de design (por que não...?)

- **Tailwind**: o time não usa; CSS variables + utility classes pontuais dão mais controle visual e arquivos menores
- **GSAP/Framer**: animações simples não justificam dependência; IntersectionObserver é nativo
- **WordPress**: WP-Admin é genérico e pesado; painel custom é mais fluido pro cliente
- **Banco no Vercel/Supabase**: complica o deploy na Hostinger; MySQL local funciona melhor
- **Carrinho server-side**: como o fluxo termina no WhatsApp (não há checkout/pagamento), localStorage basta
