/* ============================================================
   CEARÁ AUTO ELÉTRICA — Interações & animações
   ============================================================ */

const WPP_NUMBER = '5562992002643';
const STORE_KEY = 'ceara_cart_v1';

/* ===== 1. CATÁLOGO DE EXEMPLO (mockup) ===== */
const SAMPLE_PRODUCTS = [
  { id: 1,  name: 'Bomba Arla 32 Bosch',       cat: 'arla',     price: 1890, promo: 1690, badge: 'Promo' },
  { id: 2,  name: 'Sensor NOx Euro 5',          cat: 'sensores', price: 1290, promo: null, badge: null },
  { id: 3,  name: 'Bateria Moura 150Ah',        cat: 'baterias', price: 1450, promo: 1290, badge: '-11%' },
  { id: 4,  name: 'Módulo ECU Volvo FH',        cat: 'eletrica', price: 4200, promo: null, badge: null },
  { id: 5,  name: 'Filtro Arla 32',             cat: 'arla',     price: 240,  promo: 199,  badge: 'Promo' },
  { id: 6,  name: 'Alternador 28V 80A Bosch',   cat: 'eletrica', price: 2890, promo: null, badge: null },
  { id: 7,  name: 'Bateria Heliar 100Ah',       cat: 'baterias', price: 890,  promo: null, badge: 'Top' },
  { id: 8,  name: 'Sensor Temperatura Diesel',  cat: 'sensores', price: 320,  promo: 279,  badge: '-13%' },
  { id: 9,  name: 'Motor Partida Scania 24V',   cat: 'eletrica', price: 3490, promo: 3190, badge: 'Promo' },
  { id: 10, name: 'Catalisador SCR Euro 6',     cat: 'arla',     price: 5890, promo: null, badge: null },
  { id: 11, name: 'Bateria Estacionária 220Ah', cat: 'baterias', price: 2190, promo: null, badge: null },
  { id: 12, name: 'Chicote Elétrico Painel',    cat: 'eletrica', price: 540,  promo: 489,  badge: '-9%' }
];

const CATEGORIES = {
  todos:    'Todos',
  arla:     'Arla 32 / SCR',
  baterias: 'Baterias',
  eletrica: 'Auto Elétrica',
  sensores: 'Sensores'
};

/* ===== 2. UTILS ===== */
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const money = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ===== 3. HEADER SCROLL ===== */
const header = $('.site-header');
const onScroll = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 30);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ===== 4. MOBILE MENU ===== */
const menuToggle = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => mobileNav.classList.toggle('is-open'));
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('is-open')));
}

/* ===== 5. SCROLL REVEAL ===== */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('[data-reveal], [data-stagger]').forEach(el => revealObs.observe(el));

/* ===== 6. PARALLAX leve em [data-parallax] ===== */
const parallaxEls = $$('[data-parallax]');
if (parallaxEls.length) {
  window.addEventListener('scroll', () => {
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const rect = el.getBoundingClientRect();
      const off  = (rect.top + rect.height/2 - window.innerHeight/2) * speed;
      el.style.transform = `translate3d(0, ${off * -1}px, 0)`;
    });
  }, { passive: true });
}

/* ===== 7. TILT 3D NOS CARDS ===== */
$$('[data-tilt]').forEach(card => {
  const max = 8;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * max;
    const ry = (x - 0.5) * max;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    card.style.setProperty('--mx', (x * 100) + '%');
    card.style.setProperty('--my', (y * 100) + '%');
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ===== 8. MAGNETIC BUTTONS ===== */
$$('[data-magnetic]').forEach(btn => {
  const strength = 12;
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x / r.width * strength}px, ${y / r.height * strength}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ===== 9. CONTADORES ===== */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const end = parseFloat(el.dataset.count);
    const dur = 1400;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const v = ease(p) * end;
      el.textContent = Number.isInteger(end) ? Math.floor(v) : v.toFixed(1);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = end;
    };
    requestAnimationFrame(step);
    counterObs.unobserve(el);
  });
}, { threshold: 0.4 });
$$('[data-count]').forEach(el => counterObs.observe(el));

/* ===== 10. CARRINHO ===== */
const cart = {
  items: JSON.parse(localStorage.getItem(STORE_KEY) || '[]'),
  save() { localStorage.setItem(STORE_KEY, JSON.stringify(this.items)); },
  add(id) {
    const prod = SAMPLE_PRODUCTS.find(p => p.id === id);
    if (!prod) return;
    const found = this.items.find(i => i.id === id);
    if (found) found.qty += 1;
    else this.items.push({ id, name: prod.name, price: prod.promo || prod.price, qty: 1 });
    this.save(); render();
    openDrawer(true);
  },
  remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); render(); },
  setQty(id, q) {
    const it = this.items.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, q);
    this.save(); render();
  },
  get total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  get count() { return this.items.reduce((s, i) => s + i.qty, 0); }
};

const drawerOverlay = $('.drawer-overlay');
const drawer = $('.drawer');
const cartBtn = $('.cart-btn');
const drawerClose = $('.drawer-close');

const openDrawer = (state = true) => {
  if (!drawer) return;
  drawer.classList.toggle('is-open', state);
  drawerOverlay.classList.toggle('is-open', state);
  document.body.style.overflow = state ? 'hidden' : '';
};

cartBtn?.addEventListener('click', () => openDrawer(true));
drawerClose?.addEventListener('click', () => openDrawer(false));
drawerOverlay?.addEventListener('click', () => openDrawer(false));

function render() {
  // contador no header
  const cnt = $('.cart-count');
  if (cnt) {
    cnt.textContent = cart.count;
    cnt.style.display = cart.count ? 'grid' : 'none';
  }
  // drawer items
  const body = $('.drawer-body');
  const totalEl = $('.drawer-total strong');
  if (!body) return;
  if (!cart.items.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M6 6l-1-3H2"/>
        </svg>
        <p>Seu carrinho está vazio.</p>
        <p style="font-size:.85rem">Adicione produtos e finalize no WhatsApp.</p>
      </div>`;
  } else {
    body.innerHTML = cart.items.map(it => `
      <div class="cart-item">
        <div class="cart-item-thumb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>
        </div>
        <div class="cart-item-info">
          <strong>${it.name}</strong>
          <span class="price">${money(it.price)}</span>
          <div class="qty">
            <button data-act="dec" data-id="${it.id}">−</button>
            <span>${it.qty}</span>
            <button data-act="inc" data-id="${it.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-act="rm" data-id="${it.id}" title="Remover">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6l-12 12"/></svg>
        </button>
      </div>
    `).join('');
  }
  if (totalEl) totalEl.textContent = money(cart.total);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  const act = btn.dataset.act;
  const it = cart.items.find(i => i.id === id);
  if (act === 'inc') cart.setQty(id, (it?.qty || 0) + 1);
  if (act === 'dec') cart.setQty(id, (it?.qty || 1) - 1);
  if (act === 'rm')  cart.remove(id);
});

// botão "Finalizar no WhatsApp"
$('.checkout-wpp')?.addEventListener('click', () => {
  if (!cart.items.length) {
    alert('Adicione produtos ao carrinho antes de finalizar.');
    return;
  }
  let msg = 'Olá! Vim pelo site da Ceará Auto Elétrica e Bateria e gostaria de cotar:\n\n';
  cart.items.forEach((it, i) => {
    msg += `${i + 1}) ${it.name} — Qtd: ${it.qty} — ${money(it.price * it.qty)}\n`;
  });
  msg += `\n*Total estimado:* ${money(cart.total)}\n\nNome:\nCidade:\nObservações:`;
  window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

/* ===== 11. RENDERIZAR PRODUTOS (página produtos) ===== */
const productsRoot = $('#products-root');
const filtersRoot  = $('#filters-root');
const searchInput  = $('#search-input');

if (productsRoot) {
  let activeCat = 'todos';
  let term = '';

  // chips
  if (filtersRoot) {
    filtersRoot.innerHTML = Object.entries(CATEGORIES).map(([k, v]) =>
      `<button class="chip ${k === 'todos' ? 'is-active' : ''}" data-cat="${k}">${v}</button>`
    ).join('');
    filtersRoot.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('.chip', filtersRoot).forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeCat = chip.dataset.cat;
      paint();
    });
  }

  // busca
  searchInput?.addEventListener('input', e => { term = e.target.value.toLowerCase(); paint(); });

  function paint() {
    const list = SAMPLE_PRODUCTS.filter(p =>
      (activeCat === 'todos' || p.cat === activeCat) &&
      (!term || p.name.toLowerCase().includes(term))
    );
    if (!list.length) {
      productsRoot.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-mute)">Nenhum produto encontrado.</div>`;
      return;
    }
    productsRoot.innerHTML = list.map(p => `
      <article class="product-card" data-reveal>
        <div class="product-thumb">
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
            <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>
          </svg>
        </div>
        <div class="product-info">
          <span class="product-cat">${CATEGORIES[p.cat]}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="price-row">
            ${p.promo ? `<span class="price-old">${money(p.price)}</span><span class="price-now">${money(p.promo)}</span>`
                     : `<span class="price-now">${money(p.price)}</span>`}
          </div>
          <button class="product-add" data-add="${p.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
            Adicionar ao carrinho
          </button>
        </div>
      </article>
    `).join('');

    // reobservar reveals
    $$('.product-card[data-reveal]').forEach(el => {
      revealObs.observe(el);
    });
  }
  paint();
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  cart.add(parseInt(btn.dataset.add));
});

/* ===== 12. RENDERIZA "DESTAQUES" NA HOME ===== */
const featuredRoot = $('#featured-root');
if (featuredRoot) {
  const featured = SAMPLE_PRODUCTS.slice(0, 4);
  featuredRoot.innerHTML = featured.map(p => `
    <article class="product-card" data-reveal>
      <div class="product-thumb">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>
        </svg>
      </div>
      <div class="product-info">
        <span class="product-cat">${CATEGORIES[p.cat]}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="price-row">
          ${p.promo ? `<span class="price-old">${money(p.price)}</span><span class="price-now">${money(p.promo)}</span>`
                   : `<span class="price-now">${money(p.price)}</span>`}
        </div>
        <button class="product-add" data-add="${p.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
          Adicionar
        </button>
      </div>
    </article>
  `).join('');
  $$('#featured-root [data-reveal]').forEach(el => revealObs.observe(el));
}

/* ===== 13. HERO SPLIT TEXT ===== */
const heroH1 = $('.hero h1.split');
if (heroH1) {
  const html = heroH1.innerHTML;
  // só divide se ainda for plain text (com possíveis <span class="red">)
  if (!heroH1.querySelector('.word')) {
    heroH1.innerHTML = html.replace(/(<span class="red">|<\/span>)|(\S+)/g, (m, tag, word) => {
      if (tag) return tag;
      return `<span class="word">${word}</span>`;
    });
    $$('.word', heroH1).forEach((w, i) => w.style.animationDelay = `${0.1 + i * 0.08}s`);
  }
}

/* ===== 14. INIT ===== */
render();
