# Setup local

Passo a passo para rodar o projeto na sua máquina.

## Pré-requisitos

- **Node.js 20+** ([baixar](https://nodejs.org/))
- **Docker Desktop** (para rodar MySQL local) — alternativa: MySQL instalado direto
- **Git**

## 1. Clonar e instalar

```bash
git clone <repo-url>
cd ceara-website
npm install
```

## 2. Variáveis de ambiente

Copie o `.env.example` para `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

Edite o `.env` e ajuste:

```env
DATABASE_URL="mysql://ceara_user:ceara_pass@localhost:3306/ceara_catalog"
JWT_SECRET="cole-aqui-uma-string-aleatoria-de-pelo-menos-32-caracteres"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_PRIMARY="5562992002643"
NEXT_PUBLIC_WHATSAPP_SECONDARY="556230986879"
ADMIN_EMAIL="admin@ceara.local"
ADMIN_PASSWORD="senha-do-primeiro-acesso"
```

**Gerar JWT_SECRET seguro** (rode no terminal):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 3. Subir o banco MySQL

Com Docker (recomendado):
```bash
npm run db:up
```

Isso sobe um container MySQL 8 na porta 3306 com banco/usuário já criados (config em `docker-compose.yml`).

## 4. Gerar Prisma Client e rodar migrations

```bash
npm run prisma:generate
npm run prisma:push        # cria as tabelas no banco
npm run prisma:seed        # cria admin + dados iniciais
```

> Se preferir histórico de migrations versionado, use `npm run prisma:migrate -- --name init` em vez de `prisma:push`.

## 5. Rodar o projeto

```bash
npm run dev
```

Abra:
- Site público: http://localhost:3000
- Login admin: http://localhost:3000/admin/login

Use as credenciais do `ADMIN_EMAIL` e `ADMIN_PASSWORD` do seu `.env`.

## Atalho: setup completo

```bash
npm run setup:quick
```

Isso roda em sequência: `db:up` → `prisma:generate` → `prisma:push` → `prisma:seed`.

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o Next.js em modo desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm start` | Roda o build de produção |
| `npm run lint` | Lint do código |
| `npm run db:up` | Sobe MySQL via Docker |
| `npm run db:down` | Para o MySQL |
| `npm run db:reset` | Apaga tudo do banco e recria |
| `npm run prisma:studio` | (rode `npx prisma studio`) Abre interface visual do banco |

## Problemas comuns

### MySQL não conecta
- Confira se Docker Desktop está aberto
- Confira se a porta 3306 não está ocupada por outro MySQL local
- Tente `npm run db:reset` (apaga e recria tudo)

### Erro Prisma P3014 (shadow database)
Use `npm run prisma:push` no lugar de `prisma:migrate`. Documentação completa: [Prisma Docs](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database).

### Login não funciona
- Confira se `JWT_SECRET` tem ao menos 32 caracteres
- Rode `npm run prisma:seed` de novo para resetar o admin

### Imagens uploadadas somem após o build
Em desenvolvimento, arquivos enviados ficam em `public/uploads/`. Em produção (Hostinger), você precisa garantir que essa pasta persiste entre deploys — não fica dentro do `.next/`. Veja [DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md).
