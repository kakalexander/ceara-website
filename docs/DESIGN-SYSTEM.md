# Design System

Referência visual do site. Tudo está em `src/app/globals.css`, organizado em 30 módulos numerados.

## Filosofia

- **Industrial, automotivo, alto contraste.** Vermelho saturado contra preto absoluto.
- **Tipografia condensada uppercase** para o display (Barlow Condensed) + sans-serif neutro para corpo (Inter).
- **Microdetalhes intencionais** — grão no hero, conic gradient rotativo, ping no WhatsApp — para fugir do visual "feito por IA".
- **Animação serve à mensagem.** Cada movimento reforça atributos da marca (técnica, agilidade, força).

## Tokens (CSS Variables)

Definidos em `:root` no início do `globals.css`.

### Cores

```css
/* Fundos */
--bg:            #08080a;   /* preto absoluto principal */
--bg-2:          #0e0e12;   /* preto secundário */
--surface:       #14141a;   /* cards */
--surface-2:     #1c1c24;   /* hover de cards */
--surface-3:     #25252e;   /* destaque interno */
--line:          #2a2a35;   /* bordas */
--line-soft:     #1f1f28;   /* divisores discretos */

/* Marca */
--red:           #d8232a;   /* vermelho principal (CTAs, acentos) */
--red-deep:      #a01418;   /* gradientes / profundidade */
--red-glow:      rgba(216, 35, 42, 0.45);  /* glow em shadows */
--red-soft:      rgba(216, 35, 42, 0.12);  /* fundo sutil */

/* Funcionais */
--whatsapp:      #25d366;
--whatsapp-dark: #128c7e;
--danger:        #ff5a60;
--success:       #25d366;
--gold:          #c4a572;   /* acento metálico raro */

/* Texto */
--text:          #f4f4f6;   /* primário */
--text-soft:     #b8b8c2;   /* parágrafos */
--text-mute:     #7a7a86;   /* legendas, placeholders */
```

### Tipografia

```css
--font-display: var(--font-brand), "Barlow Condensed", sans-serif;
--font-body:    "Inter", "Segoe UI", system-ui, sans-serif;
```

| Elemento | Family | Peso | Transform | Tamanho |
|---|---|---|---|---|
| H1 | display | 700 | uppercase | clamp(2.4rem, 6vw, 5.2rem) |
| H2 | display | 700 | uppercase | clamp(1.8rem, 4vw, 3rem) |
| H3 | display | 700 | uppercase | clamp(1.25rem, 2vw, 1.6rem) |
| Body | body | 400 | none | 16px |
| Eyebrow | display | 500 | uppercase + 0.18em letter-spacing | 0.78rem |

### Espaço, radius, shadows

```css
--radius-sm: 6px;
--radius:    14px;
--radius-lg: 22px;

--shadow-1: 0 4px 16px rgba(0,0,0,0.35);
--shadow-2: 0 18px 40px rgba(0,0,0,0.55);
--shadow-red: 0 18px 50px -10px var(--red-glow);

--container: min(1240px, 92vw);
--header-h: 80px;

--ease-out:  cubic-bezier(0.16, 0.84, 0.32, 1);
--ease-soft: cubic-bezier(0.2, 0.7, 0.2, 1);
```

## Componentes principais

### Botões

```html
<button class="btn">Padrão (vermelho)</button>
<button class="btn btn--lg">Grande</button>
<button class="btn btn--ghost">Outline</button>
<button class="btn btn--wpp">WhatsApp (verde)</button>
<button class="btn btn--dark">Dark</button>
<button class="btn btn--block">Largura total</button>

<!-- com efeito magnético -->
<button class="btn" data-magnetic>Atrai o cursor</button>
```

Efeito de "brilho passando" embutido via `::before` com transform.

### Cards

```html
<!-- Card de categoria com tilt 3D -->
<a class="cat-card" data-tilt>
  <div class="cat-icon">SVG</div>
  <h3>Título</h3>
  <p>Descrição</p>
  <span class="cat-link">CTA →</span>
</a>

<!-- Card de produto -->
<article class="product-card">
  <div class="product-thumb">
    <span class="badge">-15%</span>
    <img src="..." />
  </div>
  <div class="product-info">
    <span class="product-cat">Categoria</span>
    <h3 class="product-name">Nome</h3>
    <div class="price-row">
      <span class="price-old">R$ 100</span>
      <span class="price-now">R$ 85</span>
    </div>
    <button class="product-add">Adicionar</button>
  </div>
</article>
```

### Section heading

```html
<div class="section-head" data-reveal>
  <span class="eyebrow">Categoria</span>
  <h2>Título principal.</h2>
  <p>Lead opcional explicando o que vem.</p>
</div>
```

### Hero (homepage)

Tem 3 camadas:
1. Grid + grain pattern via `::before`
2. Glow vermelho radial via `::after`
3. Floating dots component sobreposto

A engrenagem rotativa é puro CSS (`conic-gradient` + `@keyframes spin`).

### Page Hero (páginas internas)

```html
<section class="page-hero">
  <div class="floating-dots" />
  <div class="container">
    <span class="eyebrow">Seção</span>
    <h1>Título com <span class="accent">destaque</span>.</h1>
    <p class="lead">Lead.</p>
  </div>
</section>
```

### Toolbar de filtros

```html
<div class="toolbar">
  <div class="search">
    <svg>...</svg>
    <input placeholder="Buscar..." />
  </div>
  <div class="filters">
    <button class="chip is-active">Todos</button>
    <button class="chip">Categoria A</button>
  </div>
</div>
```

### Formulários

**Floating label** (público):
```html
<div class="field">
  <input id="x" placeholder=" " />
  <label for="x">Label flutuante</label>
</div>
```

**Simple** (admin):
```html
<div class="field field--simple">
  <label for="x">Label fixa</label>
  <input id="x" />
</div>
```

**Switch**:
```html
<label class="switch">
  <input type="checkbox" />
  <span class="switch-toggle"></span>
  Texto
</label>
```

### Tabela do admin

```html
<table class="admin-table">
  <thead><tr><th>...</th></tr></thead>
  <tbody>
    <tr><td>...</td></tr>
  </tbody>
</table>

<!-- Tags de status -->
<span class="tag tag--on">Ativo</span>
<span class="tag tag--off">Inativo</span>
<span class="tag tag--promo">Em promoção</span>
<span class="tag tag--star">Destaque</span>
```

### KPIs (dashboard)

```html
<div class="admin-kpis">
  <div class="kpi">
    <div class="kpi-num">42</div>
    <div class="kpi-label">Label</div>
  </div>
</div>
```

## Animações declarativas (atributos data-*)

| Atributo | Efeito |
|---|---|
| `data-reveal` | Fade + slide-up quando entra na tela |
| `data-reveal="left"` | Slide da esquerda |
| `data-reveal="right"` | Slide da direita |
| `data-reveal="scale"` | Zoom-in |
| `data-stagger` | Filhos aparecem em cascata |
| `data-tilt` | Card rotaciona 3D com o mouse (até 8°) |
| `data-magnetic` | Elemento atrai o cursor (offset até 12px) |

O componente `RevealInit` reaplica todos os listeners a cada navegação.

## Animações keyframe principais

| Animação | Onde | Duração |
|---|---|---|
| `stripe` | Top stripe (gradient flow) | 6s linear ∞ |
| `marquee` | Faixa de marcas no hero | 28s linear ∞ |
| `spin` | Engrenagem do hero | 18s linear ∞ |
| `rotate` | Borda cônica dos badges | 6–8s linear ∞ |
| `ping` | WhatsApp sticky pulsando | 2.4s ∞ |
| `heroWord` | Palavras do H1 caem com rotação | 0.9s once |
| `pageIntro` | Fade-blur na navegação entre páginas | 0.6s once |

## Responsividade

Breakpoint único em **980px** (`@media (max-width: 980px)`):
- Menu desktop vira hamburger fullscreen
- Hero grid 1.4fr/1fr vira 1fr empilhado
- Stats 4 colunas → 2 colunas
- Categorias 3 colunas → 1 coluna
- Admin sidebar 260px → barra horizontal no topo

## Troca de logo

O `BrandLogo` em `components/brand-logo.tsx` é SVG inline (raio elétrico em engrenagem). Para trocar pelo PNG oficial:

```tsx
import Image from "next/image";

// no header:
<Image src="/logo.png" alt="Ceará" width={52} height={52} priority />
```

E coloque o PNG em `public/logo.png`. O CSS já espera `.brand img { height: 52px; }`.
