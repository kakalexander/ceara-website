# Plano Tecnico - Ceara Auto Eletrica e Bateria (Node + React)

## 1) Objetivo do projeto

Entregar um site institucional com catalogo gerenciavel e foco em conversao para WhatsApp, com painel administrativo simples para o cliente operar no dia a dia.

Escopo confirmado:
- Home
- Produtos
- Quem Somos
- Contato
- Cadastro de produtos com imagem, descricao e preco
- Preco promocional por produto
- Painel administrativo para cliente gerenciar produtos e promocoes
- Carrinho de produtos
- Finalizacao via WhatsApp com mensagem automatica
- Layout responsivo (mobile e desktop)

---

## 2) Decisao de stack (alinhada ao plano Hostinger escolhido)

### Stack recomendada
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- Banco: MySQL (Hostinger)
- Upload de imagens: disco local em `public/uploads` (MVP) com validacao e compressao
- Auth admin: JWT com refresh token (httpOnly cookie) ou sessao server-side

### Por que essa stack funciona bem no seu caso
- Tecnologias que voce citou e equipe encontra facil no mercado
- Rapida para evoluir e manter (Clean Code com separacao clara de camadas)
- Permite painel admin sob medida, sem ficar preso a limitacoes de builder
- Fluxo de carrinho + WhatsApp fica totalmente controlado por regra propria

### Atenções de hospedagem
- Confirmar no plano contratado:
  - suporte a app Node.js gerenciada
  - versao Node 20+
  - quantidade de apps Node permitidas
  - acesso a banco MySQL remoto/local
- Se houver restricao operacional de Node no plano, plano B:
  - manter frontend estatico + API em VPS pequena
  - ou migrar backend para Laravel no mesmo hosting compartilhado

---

## 3) Arquitetura proposta

## Monorepo simples
- `apps/web` (React)
- `apps/api` (Express + Prisma)
- `packages/shared` (tipos, schemas, utils comuns)

## Backend em camadas
- `routes` -> mapeia endpoints
- `controllers` -> traduz HTTP para caso de uso
- `services` -> regras de negocio
- `repositories` -> acesso ao Prisma
- `validators` -> Zod/Yup para payload
- `middlewares` -> auth, rate-limit, erro

Regra: controller fino, regra de negocio fica em service.

## Frontend
- Publico:
  - Home, Produtos, Quem Somos, Contato
  - Carrinho (estado local com persistencia)
- Admin:
  - login
  - CRUD de categorias
  - CRUD de produtos
  - controle de preco promocional
  - upload e ordenacao de imagens

---

## 4) Modelagem de dados (MySQL + Prisma)

## Tabelas principais
- `users`
  - id, name, email, password_hash, role, created_at, updated_at
- `categories`
  - id, name, slug, is_active, created_at, updated_at
- `products`
  - id, category_id, name, slug
  - short_description, description
  - price, promo_price
  - sku, brand
  - image_main
  - is_active, is_featured
  - created_at, updated_at
- `product_images`
  - id, product_id, image_path, sort_order, created_at
- `site_settings`
  - id, `key`, `value`, updated_at

## Regras de negocio obrigatorias
- `promo_price` valida apenas quando `promo_price > 0 && promo_price < price`
- produto inativo nao aparece no site publico
- se promocao invalida, exibir somente preco normal

---

## 5) Carrinho + WhatsApp (core de conversao)

## Fluxo
1. Usuario adiciona itens no carrinho
2. Ajusta quantidade
3. Clica em "Finalizar no WhatsApp"
4. Sistema gera mensagem padrao
5. Redireciona para `https://wa.me/{numero}?text={mensagem-encoded}`

## Exemplo de mensagem
```text
Ola! Vim pelo site da Ceara Auto Eletrica e Bateria e gostaria de cotar:

1) Bomba Arla 32 - Qtd: 1 - R$ 850,00
2) Sensor X - Qtd: 2 - R$ 240,00

Total estimado: R$ 1.090,00

Nome:
Cidade:
Observacoes:
```

## Telefones
- Principal: `(62) 99200-2643`
- Secundario: `(62) 3098-6879`

---

## 6) UX/UI orientado a conversao (Google Ads e Meta)

## Direcao visual da marca
- Vermelho escuro: `#A02020`
- Vermelho vivo: `#C8292F`
- Preto: `#000000`
- Branco: `#FFFFFF`
- Neutros metalicos: cinzas frios para fundos, bordas e detalhes

## Tokens sugeridos
- `--color-primary: #A02020`
- `--color-primary-strong: #C8292F`
- `--color-bg: #111111`
- `--color-surface: #1B1B1B`
- `--color-text: #FFFFFF`
- `--color-muted: #C9C9C9`
- `--color-border: #3A3A3A`

## Boas praticas de UX
- mobile first
- CTA de WhatsApp fixo no mobile
- CTA acima da dobra na home
- prova de autoridade tecnica (Arla Euro 5/6)
- vitrine de produtos com busca rapida
- menu simples com no maximo 1 nivel

## Copy base para secoes principais
- "Precisando de pecas para o seu caminhao? Conte com a Ceara Auto Eletrica e Bateria."
- "Equipe treinada e qualificada com os melhores precos e servicos."
- "Especialistas em sistemas Arla-Euro 5 e 6."
- "Fale agora com nossa equipe no WhatsApp."

---

## 7) SEO + rastreamento de Ads (essencial)

## SEO tecnico
- URLs amigaveis (`/produtos/bomba-arla-32`)
- meta title/description por pagina
- Open Graph + Twitter card
- sitemap.xml + robots.txt
- schema `LocalBusiness` + `Product`
- imagens em WebP, lazy loading e tamanhos responsivos

## Eventos recomendados
- GTM como orquestrador
- GA4:
  - `view_item`
  - `add_to_cart`
  - `begin_checkout`
  - `generate_lead` (clique WhatsApp)
- Meta Pixel:
  - `ViewContent`
  - `AddToCart`
  - `Lead`

## UTM e atribuicao
- armazenar `utm_source`, `utm_medium`, `utm_campaign` em cookie/localStorage
- incluir origem no evento de clique do WhatsApp
- opcional: adicionar trecho curto da origem na mensagem final para rastrear qualidade do lead

---

## 8) Clean Code e padroes de qualidade

- TypeScript estrito (`strict: true`)
- ESLint + Prettier + Husky + lint-staged
- sem `any` desnecessario
- validacao de entrada em toda rota mutavel
- tratamento de erro centralizado com resposta padronizada
- logs estruturados (request id + contexto)
- testes:
  - unitario para regra de preco/promocao
  - integracao para CRUD de produto
  - E2E basico para fluxo carrinho -> WhatsApp

---

## 9) Segurança minima para producao

- senha com hash forte (bcrypt/argon2)
- protecao de rotas admin
- rate-limit em login e endpoints sensiveis
- validacao de upload (tipo, tamanho, extensao)
- sanitizacao de texto em campos livres
- CORS restrito ao dominio oficial
- backup automatico de banco e midias

---

## 10) Cronograma sugerido de implementação

## Fase 1 - Base tecnica (2 a 4 dias)
- setup monorepo
- setup API e React
- prisma + mysql + migracoes
- auth admin
- layout base e design system

## Fase 2 - Catalogo + Admin (3 a 5 dias)
- CRUD categorias/produtos
- upload de imagem
- preco promocional
- listagem e detalhe publico de produto

## Fase 3 - Carrinho + WhatsApp + Tracking (2 a 4 dias)
- carrinho completo
- mensagem automatica WhatsApp
- GTM, GA4 e Meta Pixel
- eventos de conversao

## Fase 4 - Polimento + SEO + Go-live (2 a 3 dias)
- performance (LCP/CLS/INP)
- SEO tecnico final
- QA responsivo
- deploy e checklist final

---

## 11) Definicoes finais para iniciar desenvolvimento

- Stack: Express + Prisma + React + MySQL
- Meta principal de negocio: gerar leads no WhatsApp
- Prioridade tecnica: admin simples, rapido e seguro para o cliente operar sem suporte diario
- Prioridade de marketing: paginas rapidas, CTA forte e rastreamento correto para Google Ads e Meta Ads

Com essa base, o projeto fica pronto para iniciar implementacao sem WordPress, mantendo custo sob controle e boa capacidade de evolucao.

