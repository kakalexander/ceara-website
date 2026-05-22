# Mockup — Ceará Auto Elétrica e Bateria

Protótipo visual navegável (HTML + CSS + JS puro) para validar com o cliente **antes** de implementar no Next.js do projeto principal.

## Como abrir

Basta dar duplo clique em `index.html`. Funciona 100% offline, em qualquer navegador moderno.

## Páginas

| Arquivo | O que mostra |
|---|---|
| `index.html` | Home cinematográfica com hero, stats, categorias, destaques, autoridade técnica, depoimentos e CTA final |
| `produtos.html` | Catálogo com busca, filtros por categoria, carrinho lateral e checkout no WhatsApp |
| `quem-somos.html` | Linha do tempo da empresa + 4 pilares + números |
| `contato.html` | Cards de contato, formulário com floating labels (envia para WhatsApp), mapa |

---

## Análise vs. aguiadiesel.com.br

| Pontos onde o aguiadiesel acerta | O que pegamos | O que melhoramos |
|---|---|---|
| Identidade automotiva forte (vermelho/preto) | Mantido como base | Adicionamos profundidade com gradientes radiais, gradiente sutil de luz no hero, grão no fundo |
| Categorias destacadas | Mantido | Cards com **tilt 3D** ao passar o mouse + glow vermelho no cursor |
| WhatsApp em vários pontos | Mantido | Botão flutuante com **animação de ping**, sticky mobile, CTA gigante no fim |
| Layout simples | Mantido | Tipografia **Barlow Condensed** condensada (mais "industrial") + uppercase, microcopy persuasiva |
| | | **Animações de scroll reveal** seção por seção |
| | | **Contadores animados** nos números da empresa |
| | | **Marquee de marcas atendidas** (Volvo, Scania, MB...) embaixo do hero |
| | | **Engrenagem girando** no hero como elemento visual de marca |
| | | **Drawer de carrinho** lateral com checkout direto no WhatsApp |
| | | Cursor reagindo nos cards (microinterações) |

### O que ainda não tem (e dá pra adicionar)

- Vídeo de fundo no hero (custaria peso — sugiro Mux/Cloudinary se for usar)
- Modelo 3D do caminhão girando (Three.js — bonito mas dobra o trabalho)
- Dark/Light mode (não combina com a estética industrial — manter dark)

---

## Animações implementadas

Todas funcionam sem nenhuma biblioteca externa — JS puro, IntersectionObserver e CSS:

1. **Reveal ao scroll** (`[data-reveal]`) — fade + slide com 4 variantes: up, left, right, scale
2. **Stagger** (`[data-stagger]`) — elementos filhos aparecem em cascata (delay incremental)
3. **Parallax** (`[data-parallax]`) — leve, baseado em scroll
4. **Tilt 3D** (`[data-tilt]`) — cards rotacionam com perspectiva quando passa o mouse + spotlight vermelho seguindo o cursor
5. **Magnetic buttons** (`[data-magnetic]`) — botões "puxam" o cursor (efeito de atração)
6. **Contadores** (`[data-count]`) — números animam de 0 até o valor real quando entram na tela
7. **Hero split text** — palavras do título caem uma por uma com rotação 3D
8. **Marquee infinito** — carrossel de marcas embaixo do hero
9. **Engrenagem rotativa** — visual do hero
10. **Header morphing** — fundo escuro com blur aparece ao rolar
11. **Drawer lateral** — carrinho desliza com easing suave
12. **WhatsApp ping** — pulsos circulares saindo do botão flutuante
13. **Borda animada** — card de garantias com gradiente cônico rotacionando
14. **Floating label** — labels do formulário sobem ao focar

Tudo respeita `prefers-reduced-motion` por usar `IntersectionObserver` (sem JS pesado) e transitions CSS canceláveis.

---

## Recomendações de implementação real (Next.js)

A base atual do projeto (`src/`) é **Next.js 14 + Prisma + MySQL** — boa escolha, mantém. Sugestão de plano de migração do mockup para o projeto real:

### 1. Estilo
- Migrar tokens do `style.css` para `src/app/globals.css` (já existe, expandir)
- Manter CSS modules ou puro — não vale adicionar Tailwind agora se o time não usa
- Importar **Barlow Condensed + Inter** via `next/font/google` (já tá importando Barlow)

### 2. Componentes
Quebrar o mockup nesses componentes React:

```
src/components/
├─ site-header.tsx           ← já existe, expandir com mobile menu
├─ site-footer.tsx           ← já existe
├─ whatsapp-sticky.tsx       ← já existe, adicionar ping animation
├─ hero.tsx                  ← novo (com split text + engrenagem)
├─ stats-bar.tsx             ← novo (com counter animado)
├─ category-grid.tsx         ← novo (cards com tilt)
├─ product-card.tsx          ← extrair do product-catalog atual
├─ testimonials.tsx          ← novo
├─ authority-block.tsx       ← novo
├─ cta-stripe.tsx            ← novo
├─ cart-drawer.tsx           ← novo (substituir página de carrinho atual)
├─ contact-form.tsx          ← novo
└─ animations/
   ├─ reveal.tsx             ← já existe scroll-reveal.tsx, expandir
   ├─ tilt-card.tsx          ← novo
   ├─ magnetic.tsx           ← novo
   └─ counter.tsx            ← novo
```

### 3. Lógica que precisa de API real (vs. mockup)
| Mockup faz | Backend real precisa |
|---|---|
| Lista hardcoded em `script.js` | `GET /api/products` retornando do MySQL via Prisma |
| Categorias fixas | `GET /api/categories` ativas |
| Carrinho em `localStorage` | Mantém `localStorage` (não precisa de carrinho server) |
| Checkout WhatsApp | Mantém igual (gera link `wa.me/...`) |
| Form de contato → WhatsApp | Pode também salvar lead em tabela `leads` antes de redirecionar |

### 4. Admin (não foi feito no mockup)
- Já tem em `src/app/admin/`. Recomendo:
  - Editor rico de descrição (TipTap ou similar)
  - Upload com **compressão server-side** (sharp) para reduzir peso na Hostinger
  - Galeria com drag-and-drop pra reordenar imagens
  - Toggle de "destaque" e "ativo" inline na lista
  - Dashboard com gráfico de leads do WhatsApp por dia (Recharts)

### 5. Hospedagem na Hostinger

Como escolheu **manter Next.js**:

- **Plano mínimo recomendado:** Cloud Startup ou Business — suportam Node.js 20+
- **Build:** `npm run build` gera a pasta `.next/`
- **Start:** `npm start` (precisa de Node app gerenciado no painel da Hostinger)
- **Banco:** MySQL nativo do plano. Atualizar `DATABASE_URL` no `.env` para os dados que a Hostinger fornecer
- **Imagens:** Upload em `public/uploads`. Se crescer muito, considerar Cloudinary (free tier 25GB)
- **Domínio + SSL:** Hostinger cuida automaticamente

**Plano B (se a Hostinger não suportar bem Node):**
- Hostinger comum + Next.js exportado estático (`output: 'export'`) **+** API em PHP separada para o admin gravar no MySQL
- Ou trocar o backend para Laravel (já recomendado no documento de análise original em `docs/analise-implementacao-site-ceara.md`)

### 6. SEO e tracking (essencial pra Ads)

Já está no plano original. Adicionar no projeto real:
- `<Script>` do Google Tag Manager no `layout.tsx`
- Eventos GA4: `view_item`, `add_to_cart`, `begin_checkout`, `generate_lead`
- Meta Pixel
- Schema.org Product + LocalBusiness via JSON-LD

---

## Cronograma de migração mockup → produção

| Fase | Tempo | Entrega |
|---|---|---|
| 1. Refinar Home + componentização | 2 dias | Home no Next.js com todas as animações |
| 2. Catálogo + Produto detalhe | 2 dias | Produtos vindos do banco, filtros, busca server-side |
| 3. Carrinho drawer + checkout | 1 dia | Drawer integrado, checkout WhatsApp |
| 4. Quem somos + Contato + Form → lead | 1 dia | Páginas restantes + form salvando lead |
| 5. Admin: imagens + destaques + promo | 2 dias | UX do admin melhorado |
| 6. SEO + Tracking + Performance | 1 dia | GTM, GA4, schema, lighthouse 90+ |
| 7. Deploy Hostinger + QA | 1 dia | Online com domínio próprio |
| **Total** | **~10 dias úteis** | Site no ar |

---

## Próximos passos sugeridos

1. **Mostrar o mockup pro cliente** — pelo navegador, no celular, na mesa do escritório
2. Anotar feedback (cores, copy, ordem das seções)
3. Definir lista real das ~20–30 categorias e produtos iniciais
4. Pegar fotos reais da oficina (hero ficaria com background de oficina)
5. Aprovar e migrar para Next.js
6. Configurar conta Hostinger Business (~R$ 30/mês) + domínio
7. Deploy e treinamento de 1h com o cliente sobre o admin

---

## Detalhe técnico: por que esse design "não tem cara de IA"

- **Paleta restrita e ousada** — vermelho saturado contra preto absoluto, sem gradientes pastéis genéricos
- **Tipografia condensada uppercase** — referência automotiva clássica (BMW M, Mopar), longe das fontes neutras "AI-style"
- **Microdetalhes intencionais** — grão no hero, top stripe animada, borda cônica rotacionando, ping no WhatsApp
- **Layout assimétrico no hero** — texto à esquerda em 1.4fr, visual à direita em 1fr — em vez do "tudo centralizado e simétrico"
- **Cards com profundidade real** — tilt 3D + spotlight do cursor, ao invés do "shadow + radius padrão"
- **Linha vermelha viva no scroll** — barra animada no topo dá personalidade

---

Bom trabalho com o cliente. Qualquer ajuste na paleta, animações ou ordem das seções, mexa em `style.css` (tokens no `:root`) e veja o resultado em tempo real abrindo `index.html`.
