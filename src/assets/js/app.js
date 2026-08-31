/* Smartino prototip — fără framework. Tot ce e aici trebuie portabil în Liquid + JS de temă. */
(() => {
  'use strict';

  /* Constantele comerciale vin din src/_data/shop.js, injectate de layout.
     Valorile de aici sunt doar plasa de siguranță dacă scriptul rulează singur. */
  const SHOP = window.__SHOP__ || {};
  const FREE_SHIPPING = SHOP.freeShipping ?? 200;
  const SHIPPING_FEE = SHOP.shippingFee ?? 24.9;

  const lei = (n) =>
    n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' lei';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------------------------------------------------------------- coș
  const STORE = 'smartino-cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORE)) || []; } catch { cart = []; }

  const save = () => localStorage.setItem(STORE, JSON.stringify(cart));
  const find = (h) => cart.find((l) => l.handle === h);
  const count = () => cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => cart.reduce((n, l) => n + l.price * l.qty, 0);

  /* n vine din selectorul de cantitate de pe pagina de produs; pe card e mereu 1. */
  function addToCart(handle, n = 1) {
    const p = window.__CATALOG__?.[handle];
    if (!p) return;
    const line = find(handle);
    if (line) line.qty += n;
    else cart.push({ handle, title: p.title, price: p.price, image: p.image, qty: n });
    save(); render();
  }

  function setQty(handle, qty) {
    const line = find(handle);
    if (!line) return;
    if (qty <= 0) cart = cart.filter((l) => l.handle !== handle);
    else line.qty = qty;
    save(); render();
  }

  // ------------------------------------------------------- randare coș
  function render() {
    const n = count();
    const sub = subtotal();

    // Două insigne de coș acum: în header și în bara de jos. $$ , nu $.
    $$('[data-cart-count]').forEach((badge) => {
      badge.textContent = n;
      badge.hidden = n === 0;
    });
    $$('[data-cart-total]').forEach((total) => { total.textContent = lei(sub); });

    // bară de progres spre livrare gratuită
    const wrap = $('[data-ship-progress]');
    if (wrap) {
      const pct = Math.min(100, (sub / FREE_SHIPPING) * 100);
      $('[data-ship-bar]').style.width = pct + '%';
      const txt = $('[data-ship-text]');
      if (sub === 0) txt.textContent = 'Adaugă produse pentru livrare gratuită';
      else if (sub >= FREE_SHIPPING) txt.textContent = 'Ai livrare gratuită!';
      else txt.textContent = `Încă ${lei(FREE_SHIPPING - sub)} până la livrare gratuită`;
      wrap.classList.toggle('is-complete', sub >= FREE_SHIPPING);
    }

    const body = $('[data-cart-items]');
    if (body) {
      if (!cart.length) {
        body.innerHTML = '<p class="drawer__empty">Coșul tău e gol.</p>';
      } else {
        body.innerHTML = cart.map((l) => `
          <div class="cart-line">
            <img src="${l.image ? l.image.split('?')[0] + '?width=128' : ''}" alt="" width="64" height="64" loading="lazy">
            <div>
              <p class="cart-line__t">${l.title}</p>
              <p class="cart-line__p tnum">${lei(l.price)}</p>
              <button class="cart-line__rm" type="button" data-rm="${l.handle}">Șterge</button>
            </div>
            <div class="stepper" style="flex-direction:column;min-height:auto">
              <button type="button" data-inc="${l.handle}" aria-label="Adaugă unul">+</button>
              <span class="stepper__n">${l.qty}</span>
              <button type="button" data-dec="${l.handle}" aria-label="Scade unul">−</button>
            </div>
          </div>`).join('');
      }
      const foot = $('[data-cart-foot]');
      if (foot) foot.hidden = !cart.length;
      const st = $('[data-cart-subtotal]');
      if (st) st.textContent = lei(sub);
      const ship = $('[data-cart-ship]');
      if (ship) {
        ship.textContent = sub >= FREE_SHIPPING
          ? 'Livrare gratuită inclusă'
          : `Livrare ${lei(SHIPPING_FEE)} · easybox ${lei(15)}`;
      }
    }

    renderCards();
  }

  const CART_SVG =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/>' +
    '<path d="M16 10a4 4 0 0 1-8 0"/></svg>';

  /** Butonul de cos devine stepper, iar cardul se marcheaza ca fiind in cos. */
  function renderCards() {
    $$('.card').forEach((card) => {
      const handle = card.dataset.product;
      const line = find(handle);
      const wrap = $('[data-add-wrap]', card);
      if (!wrap) return;
      card.classList.toggle('is-in-cart', !!line);
      if (line) {
        if (!$('.stepper', wrap)) {
          wrap.innerHTML = `
          <div class="stepper" role="group" aria-label="Cantitate">
            <button type="button" data-dec="${handle}" aria-label="Scade cantitatea">\u2212</button>
            <span class="stepper__n">${line.qty}</span>
            <button type="button" data-inc="${handle}" aria-label="Creste cantitatea">+</button>
          </div>`;
        } else {
          $('.stepper__n', wrap).textContent = line.qty;
        }
      } else if (!$('.card__cart', wrap)) {
        const p = window.__CATALOG__?.[handle];
        const off = p && p.available === false;
        const title = ($('.card__title', card)?.textContent || '').trim().replace(/"/g, '&quot;');
        wrap.innerHTML = `<button class="card__cart" type="button" data-add="${handle}"${off ? ' disabled' : ''}
          aria-label="${off ? 'Indisponibil' : 'Adauga in cos'}: ${title}">${CART_SVG}</button>`;
      }
    });
  }

  /* PLP-ul arata carduri noi dupa filtrare si load-more; trebuie sa-si recapete
     starea „in cos". Singurul punct de contact intre app.js si plp.js. */
  window.__renderCards__ = renderCards;

  /* O singura regiune live pentru toata pagina: butonul apasat dispare din DOM,
     deci confirmarea nu poate sta pe el. */
  const live = document.createElement('div');
  live.className = 'visually-hidden';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(live));
  function say(msg) { live.textContent = ''; live.textContent = msg; }

  // ------------------------------------------------------------ evenimente
  /* Favorite — starea vizuală. Ella are wishlist nativ (ella-mapping.md C7);
     aici marcăm doar interacțiunea, fără persistență. */
  document.addEventListener('click', (e) => {
    const f = e.target.closest('.card__fav');
    if (!f) return;
    f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-add],[data-inc],[data-dec],[data-rm],[data-open-cart],[data-close-cart],[data-open-nav],[data-close-nav],[data-cat-toggle],[data-focus-search]');
    if (!t) return;

    if (t.dataset.add) {
      const c = t.closest('.card');
      addToCart(t.dataset.add, Number(t.dataset.addQty) || 1);
      delete t.dataset.addQty;
      const name = ($('.card__title', c || document)?.textContent
        || $('.buy__title')?.textContent || '').trim();
      if (name) say('Adaugat in cos: ' + name);
      openCart();
    }
    else if (t.dataset.inc) { const l = find(t.dataset.inc); setQty(t.dataset.inc, (l?.qty || 0) + 1); }
    else if (t.dataset.dec) { const l = find(t.dataset.dec); setQty(t.dataset.dec, (l?.qty || 0) - 1); }
    else if (t.dataset.rm !== undefined && t.hasAttribute('data-rm')) setQty(t.dataset.rm, 0);
    else if (t.hasAttribute('data-open-cart')) openCart();
    else if (t.hasAttribute('data-close-cart')) closeCart();
    else if (t.hasAttribute('data-open-nav')) openNav();
    else if (t.hasAttribute('data-close-nav')) closeNav();
    else if (t.hasAttribute('data-cat-toggle')) toggleNav();
    else if (t.hasAttribute('data-focus-search')) {
      const input = $('[data-search-input]');
      if (input) {
        input.scrollIntoView({ block: 'center', behavior: 'smooth' });
        input.focus();
      }
    }
  });

  // ------------------------------------------------------------- drawere
  let lastFocus = null;
  const drawer = () => $('[data-cart-drawer]');

  function openCart() {
    const d = drawer(); if (!d) return;
    lastFocus = document.activeElement;
    d.hidden = false;
    requestAnimationFrame(() => d.classList.add('is-open'));
    document.body.classList.add('is-locked');
    $('[data-cart-panel]')?.focus?.();
  }
  function closeCart() {
    const d = drawer(); if (!d) return;
    d.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { d.hidden = true; }, 240);
    lastFocus?.focus?.();
  }
  const isDesktop = () => window.matchMedia('(min-width: 1100px)').matches;

  /**
   * Pe Home, la desktop, railul din pagină ESTE meniul — tab-ul îl pliază și
   * îl desface. În rest (și pe mobil) lucrăm cu panoul separat; altfel s-ar
   * deschide un al doilea meniu peste rail.
   */
  const homeRail = () => $('.stage__rail');
  const usesHomeRail = () => isDesktop() && !!homeRail();
  const panel = () => (usesHomeRail() ? homeRail() : $('[data-cat-panel]'));

  function openNav() {
    const el = panel(); if (!el) return;
    if (usesHomeRail()) {
      el.hidden = false;
      $('[data-cat-toggle]')?.setAttribute('aria-expanded', 'true');
      return;
    }
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-open'));
    const s = $('[data-nav-scrim]'); if (s) s.hidden = false;
    document.body.classList.add('is-locked');
    $('[data-open-nav]')?.setAttribute('aria-expanded', 'true');
    $('[data-cat-toggle]')?.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    const el = panel(); if (!el) return;
    if (usesHomeRail()) {
      el.hidden = true;
      $('[data-cat-toggle]')?.setAttribute('aria-expanded', 'false');
      return;
    }
    el.classList.remove('is-open');
    const s = $('[data-nav-scrim]'); if (s) s.hidden = true;
    document.body.classList.remove('is-locked');
    $('[data-open-nav]')?.setAttribute('aria-expanded', 'false');
    $('[data-cat-toggle]')?.setAttribute('aria-expanded', 'false');
    // Pe Home railul e permanent vizibil, deci nu-l ascundem niciodată.
    if (!el.classList.contains('catpanel--home')) el.hidden = true;
  }
  function toggleNav() {
    const el = panel(); if (!el) return;
    const open = usesHomeRail()
      ? !el.hidden
      : el.classList.contains('is-open') || (isDesktop() && !el.hidden);
    open ? closeNav() : openNav();
  }
  $('[data-nav-scrim]')?.addEventListener('click', closeNav);

  /** Pe Home railul e deschis din start — starea butonului trebuie să o spună. */
  function syncNavState() {
    const t = $('[data-cat-toggle]');
    if (!t) return;
    const open = usesHomeRail()
      ? !homeRail().hidden
      : $('[data-cat-panel]')?.classList.contains('is-open') || false;
    t.setAttribute('aria-expanded', String(open));
  }
  syncNavState();
  window.addEventListener('resize', syncNavState);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeCart(); closeNav();
    const r = $('[data-search-results]'); if (r) r.hidden = true;
  });

  // Pe mobil (și pe tabletă) categoriile cu subcategorii se expandează la tap;
  // pe desktop flyout-ul apare la hover, deci linkul rămâne link.
  $$('.catlist__item.has-flyout > .catlist__link').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (isDesktop()) return;
      e.preventDefault();
      a.parentElement.classList.toggle('is-expanded');
    });
  });

  // --------------------------------------------------------- hero slider
  const hero = $('[data-hero]');
  if (hero) {
    const slides = $$('[data-slide]', hero);
    const dotsWrap = $('[data-hero-dots]', hero);
    let index = 0;
    let timer = null;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero__dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Slide ${i + 1} din ${slides.length}`);
      b.addEventListener('click', () => { go(i); rearm(); });
      dotsWrap?.appendChild(b);
      return b;
    });

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((s, i) => { s.hidden = i !== index; });
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      // punctele au nevoie de contrast invers pe slide-ul închis
      hero.classList.toggle('slide--kbeauty-active', slides[index].classList.contains('slide--kbeauty'));
    }

    function rearm() {
      clearInterval(timer);
      // Fără autoplay dacă utilizatorul a cerut mai puțină mișcare.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(() => go(index + 1), 7000);
    }

    $('[data-hero-prev]', hero)?.addEventListener('click', () => { go(index - 1); rearm(); });
    $('[data-hero-next]', hero)?.addEventListener('click', () => { go(index + 1); rearm(); });
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', rearm);
    hero.addEventListener('focusin', () => clearInterval(timer));

    go(0);
    rearm();
  }

  // ------------------------------------------------- căutare predictivă
  const input = $('[data-search-input]');
  const results = $('[data-search-results]');

  const norm = (s) => s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // diacriticele nu blochează căutarea
    .replace(/ș|ş/g, 's').replace(/ț|ţ/g, 't');

  let idx = null;
  const buildIndex = () => {
    if (idx) return idx;
    idx = Object.entries(window.__SEARCH__ || {}).map(([handle, p]) => ({
      handle, ...p, key: norm(p.t + ' ' + (p.v || '')),
    }));
    return idx;
  };

  let timer;
  input?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = norm(input.value.trim());
      if (q.length < 2) { results.hidden = true; return; }
      const terms = q.split(/\s+/);
      const hits = buildIndex()
        .filter((p) => terms.every((t) => p.key.includes(t)))
        .slice(0, 6);

      if (!hits.length) {
        results.innerHTML = `<p class="search-empty">Niciun rezultat pentru „${input.value.trim()}".</p>`;
      } else {
        results.innerHTML = hits.map((p) => `
          <a class="search-hit" href="${window.__BASE__}products/${p.handle}/">
            <img src="${p.i ? p.i.split('?')[0] + '?width=96' : ''}" alt="" width="48" height="48" loading="lazy">
            <span class="search-hit__t">${p.t}</span>
            <span class="search-hit__p tnum">${lei(p.p)}</span>
          </a>`).join('') +
          `<a class="search-more" href="${window.__BASE__}search/?q=${encodeURIComponent(input.value.trim())}">Vezi toate rezultatele</a>`;
      }
      results.hidden = false;
    }, 120);
  });

  document.addEventListener('click', (e) => {
    if (results && !e.target.closest('[data-search]')) results.hidden = true;
  });

  render();
})();
