# Deploy na Hostinger

Guia completo para subir o site no plano da Hostinger.

## Plano necessário

O projeto é **Next.js (Node.js)**, então precisa de um plano que suporte Node:

| Plano | Suporta Node? | Recomendado? |
|---|---|---|
| Single / Premium | ❌ Não | ❌ |
| Business | ✅ Sim (Node 18+) | ✅ Sim, para começar |
| Cloud Startup | ✅ Sim | ✅ Melhor performance |
| VPS | ✅ Sim, controle total | ✅ Quando crescer |

**Recomendação:** Cloud Startup (~R$ 35-50/mês). Tem Node, MySQL nativo, SSL grátis e backup automático.

## Checklist pré-deploy

- [ ] Domínio próprio configurado e apontando para a Hostinger
- [ ] Banco MySQL criado no painel da Hostinger (anote host, user, password, db_name)
- [ ] Conta de e-mail criada (`contato@cearaautoeletrica.com.br`)
- [ ] Variáveis de ambiente prontas (especialmente `JWT_SECRET` novo)
- [ ] Build local funcionando (`npm run build` sem erros)
- [ ] Seed pronto com email/senha do admin que o cliente vai usar

## Passo a passo

### 1. Criar o banco MySQL na Hostinger

Painel Hostinger → **Bancos de dados** → **Bancos MySQL** → **Criar**

Anote:
- **Host** (geralmente `localhost` ou `mysql.suaempresa.com.br`)
- **Nome do banco** (ex: `u123456_ceara`)
- **Usuário** (ex: `u123456_ceara`)
- **Senha** (gere uma forte)

### 2. Configurar variáveis de ambiente

No painel Node.js da Hostinger, adicione:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DBNAME
JWT_SECRET=string-aleatoria-de-48+-caracteres
NEXT_PUBLIC_SITE_URL=https://cearaautoeletrica.com.br
NEXT_PUBLIC_WHATSAPP_PRIMARY=5562992002643
NEXT_PUBLIC_WHATSAPP_SECONDARY=556230986879
ADMIN_EMAIL=cliente@cearaautoeletrica.com.br
ADMIN_PASSWORD=senha-forte-do-primeiro-acesso
NODE_ENV=production
```

> **Importante**: troque `ADMIN_PASSWORD` IMEDIATAMENTE no primeiro login.

### 3. Subir o código

Três opções:

**Opção A — Git (recomendado)**
1. No painel Hostinger, crie um repositório Git
2. Localmente: `git remote add hostinger <url>` + `git push hostinger main`
3. Configure auto-deploy (hook) no painel

**Opção B — FTP/SFTP**
1. Build local: `npm run build`
2. Suba: `package.json`, `package-lock.json`, `next.config.mjs`, `prisma/`, `public/`, `src/`, `.next/` (build), `node_modules` ou rode `npm install` no servidor

**Opção C — File Manager**
1. Compacte o projeto em zip (excluindo `node_modules` e `.next`)
2. Suba via File Manager da Hostinger
3. Descompacte na pasta do site
4. Acesse SSH/terminal Node e rode `npm install && npm run build`

### 4. Rodar migrations no banco de produção

Via SSH:
```bash
npx prisma generate
npx prisma db push    # cria as tabelas
npx prisma db seed    # cria o admin
```

> Se não tiver SSH, use o phpMyAdmin da Hostinger para importar o SQL gerado por `npx prisma migrate diff --to-schema-datamodel prisma/schema.prisma --script > schema.sql`.

### 5. Iniciar a aplicação

No painel Node da Hostinger:
- **Application Root**: caminho onde subiu o código (ex: `/home/u123456/public_html/`)
- **Application URL**: seu domínio
- **Application startup file**: `node_modules/next/dist/bin/next` com argumento `start`
- **Run NPM Install**: clicar
- **Start Application**: clicar

A Hostinger expõe via reverse proxy, então o Next.js roda na porta 3000 (interna) e a Hostinger encaminha para a porta 443 (HTTPS).

### 6. Verificar

- Acesse `https://cearaautoeletrica.com.br` → home deve carregar
- Acesse `https://cearaautoeletrica.com.br/api/health` → deve retornar `{"status":"ok"}`
- Acesse `https://cearaautoeletrica.com.br/admin/login` → tela de login
- Faça login com `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Crie uma categoria + um produto de teste

## Pasta de uploads — atenção!

Em produção, **a pasta `public/uploads/` precisa persistir entre deploys**.

Por padrão a Hostinger preserva arquivos enviados via interface, mas se o deploy sobrescrever, você perde tudo.

**Solução recomendada:**
1. Mantenha `public/uploads/` no `.gitignore` (já está)
2. Crie a pasta direto no servidor uma única vez via File Manager
3. Garanta permissão 755 (ou 775) para o user do Node escrever

**Solução melhor (futuro):**
- Mover uploads para **Cloudinary** (free tier 25 GB) ou **S3 da AWS**
- Trocar `/api/admin/upload/route.ts` para enviar pro Cloudinary
- Salvar a URL retornada no `imageMain` do produto

## SSL / HTTPS

A Hostinger ativa SSL grátis (Let's Encrypt) automaticamente. Verifique em **Domínios → SSL**. Se não estiver ativo, clique em "Instalar SSL grátis".

**Força HTTPS**: adicione no painel ou em `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Backup

Configure no painel da Hostinger:
- Backup do banco: **diário** (a Hostinger faz no plano Business+)
- Backup de arquivos: **semanal**
- Faça também um dump manual antes de cada deploy: `mysqldump -u user -p db > backup-YYYYMMDD.sql`

## Performance

Depois de online, valide:
- **PageSpeed Insights** ([link](https://pagespeed.web.dev/)) — meta: 90+ desktop, 75+ mobile
- **WAVE accessibility** — meta: 0 erros
- **GTmetrix** — Core Web Vitals tudo verde

## Próximos passos pós-deploy

1. **Google Search Console** — adicionar o domínio e enviar `sitemap.xml`
2. **Google Analytics 4** — adicionar GTM no `layout.tsx`
3. **Meta Pixel** — para Ads do Facebook/Instagram
4. **Eventos de conversão**: `view_item`, `add_to_cart`, `begin_checkout`, `generate_lead`
5. **Schema.org** Product + LocalBusiness (JSON-LD)
6. **Trocar logo PNG**: copie `LogoMarcaMelhorQualidade.png` para `public/logo.png` e ajuste `BrandLogo` para usar `<Image src="/logo.png">`

## Problemas comuns em produção

### "Application failed to start"
- Confira logs no painel Hostinger
- Confirme que `JWT_SECRET` e `DATABASE_URL` estão setadas
- Tente rodar `npm run build` localmente — se passa, é problema de env

### "Can't reach database"
- Confira `DATABASE_URL` — Hostinger às vezes exige `localhost` em vez de IP
- Confira que o usuário do MySQL tem permissão de conexão local
- Teste conexão via phpMyAdmin

### Imagens uploadadas somem
- Confira se `public/uploads/` está no servidor
- Confira permissão da pasta
- Use storage externo (Cloudinary) — recomendado para produção real

### Site lento
- Habilite cache no painel Hostinger (LiteSpeed Cache)
- Adicione CDN (Cloudflare grátis funciona muito bem)
- Comprima imagens antes do upload (use [tinypng.com](https://tinypng.com))
