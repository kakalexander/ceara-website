# Ceara Auto Eletrica e Bateria - Next.js + Prisma + MySQL

Projeto base para site institucional com catalogo, carrinho e finalizacao via WhatsApp, incluindo painel administrativo.

## Stack
- Next.js (App Router) + TypeScript
- Prisma ORM
- MySQL 8 (Docker Compose)
- Autenticacao admin com JWT em cookie httpOnly

## Funcionalidades ja implementadas
- Paginas publicas:
  - `/` Home
  - `/produtos` Catalogo com carrinho
  - `/quem-somos`
  - `/contato`
- Carrinho no frontend com persistencia em `localStorage`
- Finalizacao no WhatsApp com mensagem automatica dos itens
- Painel admin:
  - `/admin/login`
  - `/admin` dashboard
  - `/admin/categorias` cadastrar/listar categorias
  - `/admin/produtos` criar/editar/excluir produtos e preco promocional
- Upload de imagem no admin (`/api/admin/upload`) para `public/uploads`
- Endpoints base:
  - `GET /api/health`
  - CRUD admin em `/api/admin/*`

## Requisitos
- Node.js 20+
- Docker + Docker Compose

## Setup local
1. Copie variaveis de ambiente:
```powershell
Copy-Item .env.example .env
```

2. Suba o banco:
```bash
npm run db:up
```

3. Instale dependencias:
```bash
npm install
```

4. Gere client Prisma e rode migracoes:
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Rode seed (admin + dados iniciais):
```bash
npm run prisma:seed
```

6. Suba o projeto:
```bash
npm run dev
```

Atalho para setup local sem migracao dev (evita shadow DB):
```bash
npm run setup:quick
```

## Troubleshooting MySQL (erro de restart no container)
Se aparecer erro como:
- `unknown variable 'default-authentication-plugin=mysql_native_password'`
- container `Restarting (1)`

Execute um reset limpo do banco:
```bash
npm run db:down
docker volume rm ceara-website_mysql_data
npm run db:up
```

Depois rode novamente:
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

## Troubleshooting Prisma P3014 (shadow database)
Se aparecer:
- `P3014 Prisma Migrate could not create the shadow database`

Use uma destas opcoes:

Opcao 1 (recomendada para ambiente local):
```bash
npm run prisma:push
npm run prisma:seed
```

Opcao 2 (rodar migrate com root apenas para gerar migration):
```powershell
$env:DATABASE_URL="mysql://root:root@localhost:3306/ceara_catalog"
npm run prisma:migrate -- --name init
```
Depois restaure o `DATABASE_URL` no `.env` para `ceara_user`.

## Credenciais do admin (seed)
- E-mail: valor de `ADMIN_EMAIL` no `.env`
- Senha: valor de `ADMIN_PASSWORD` no `.env`

## Observacoes de producao (Hostinger)
- Confirmar variaveis de ambiente no painel:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_WHATSAPP_PRIMARY`
  - `NEXT_PUBLIC_WHATSAPP_SECONDARY`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Em producao, use senha forte e `JWT_SECRET` robusto.
- Para upload de imagens em escala, considerar storage externo (S3 compativel) em vez de disco local.

## Proximos incrementos recomendados
- Tracking completo GTM/GA4/Meta Pixel
- Pagina de detalhe do produto e filtros por categoria
- Gestao de status/edicao de categorias
- Testes automatizados (unitarios e E2E)
- Melhorias de SEO avancado (Schema Product em listagem e detalhe)
