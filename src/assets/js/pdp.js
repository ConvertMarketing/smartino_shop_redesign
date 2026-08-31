/* Pagina de produs: galerie, cantitate, bara lipită de jos.
   Coșul rămâne al lui app.js — aici doar trimitem cantitatea. */
(() => {
  'use strict';
  const root = document.querySelector('[data-pdp]');
  if (!root) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- galerie ---- */
  const gal = $('[data-gal]');
  if (gal) {
    const slides = $$('.gal__slide', gal);
    const thumbs = $$('.gal__thumb', gal);
    const counter = $('[data-gal-n] span', gal);
    const go = (i) => {
      slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
      thumbs.forEach((t, n) => {
        t.classList.toggle('is-active', n === i);
        t.setAttribute('aria-selected', String(n === i));
      });
      if (counter) counter.textContent = i + 1;
    };
    gal.addEventListener('click', (e) => {
      const t = e.target.closest('[data-go]');
      if (t) go(Number(t.dataset.go));
    });
    /* Săgeți stânga/dreapta când focusul e pe miniaturi. */
    gal.addEventListener('keydown', (e) => {
      const t = e.target.closest('[data-go]');
      if (!t || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const i = Number(t.dataset.go);
      const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + thumbs.length) % thumbs.length;
      thumbs[next].focus(); go(next);
    });
    /* Zoom care urmărește cursorul: fără el, mărirea arată mereu centrul. */
    const stage = $('.gal__stage', gal);
    stage?.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const img = $('.gal__slide.is-active img', gal);
      if (img) img.style.transformOrigin =
        `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });
    stage?.addEventListener('mouseleave', () => {
      const img = $('.gal__slide.is-active img', gal);
      if (img) img.style.transformOrigin = '';
    });
  }

  /* ---- cantitate ---- */
  const qty = $('[data-qty]');
  const clamp = (n) => Math.min(99, Math.max(1, n || 1));
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b || !qty) return;
    qty.value = clamp(Number(qty.value) + Number(b.dataset.q));
  });
  qty?.addEventListener('change', () => { qty.value = clamp(parseInt(qty.value, 10)); });

  /* Butonul de adăugare e al lui app.js; îi dăm doar cantitatea cerută. */
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (!add || add.disabled || !qty) return;
    const n = clamp(parseInt(qty.value, 10));
    if (n > 1) add.dataset.addQty = n;
  }, true);

  /* ---- taburi ---- */
  const tabs = $('[data-tabs]');
  tabs?.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (!t) return;
    $$('[data-tab]', tabs).forEach((x) => {
      const on = x === t;
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-selected', String(on));
    });
    $$('[data-pane]', tabs).forEach((x) => x.classList.toggle('is-on', x.dataset.pane === t.dataset.tab));
  });
  /* Săgeți între taburi, ca la orice tablist. */
  tabs?.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const list = $$('[data-tab]', tabs);
    const i = list.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const n = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
    n.focus(); n.click();
  });

  /* ---- favorite și trimite ---- */
  $('[data-fav]')?.addEventListener('click', (e) => {
    const b = e.currentTarget;
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });
  $('[data-share]')?.addEventListener('click', async () => {
    const d = { title: document.title, url: location.href };
    if (navigator.share) { try { await navigator.share(d); } catch {} }
    else if (navigator.clipboard) {
      await navigator.clipboard.writeText(location.href);
      const b = $('[data-share]'); const t = b.lastChild;
      const old = t.textContent; t.textContent = ' Link copiat';
      setTimeout(() => { t.textContent = old; }, 1800);
    }
  });

  /* ---- cross-sell: total viu + adăugare în bloc ---- */
  const fbt = $('[data-fbt]');
  if (fbt) {
    const lei = (n) => n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' lei';
    const sync = () => {
      const on = $$('input:checked', fbt);
      const total = Number(fbt.dataset.base) + on.reduce((n, i) => n + Number(i.dataset.x), 0);
      $('[data-fbt-total]', fbt).textContent = lei(total);
      const n = on.length + 1;
      $('[data-fbt-n]', fbt).textContent = n === 1 ? '1 produs' : n + ' produse';
    };
    fbt.addEventListener('change', sync);
    $('[data-fbt-add]', fbt)?.addEventListener('click', () => {
      /* Produsul principal întâi, apoi bifatele. Coșul e al lui app.js. */
      const main = $('.buy__cta');
      if (main && !main.disabled) main.click();
      $$('input:checked', fbt).forEach((i) => {
        const b = document.createElement('button');
        b.dataset.add = i.dataset.handle;
        b.hidden = true;
        document.body.appendChild(b);
        b.click();
        b.remove();
      });
    });
    sync();
  }

  /* ---- bara lipită de jos ----
     Apare doar după ce butonul principal a ieșit din ecran: până atunci ar fi
     un al doilea buton pentru aceeași acțiune, la 20 px distanță. */
  const bar = $('[data-sticky]');
  const cta = $('.buy__cta');
  if (bar && cta && 'IntersectionObserver' in window) {
    bar.hidden = false;
    new IntersectionObserver(([en]) => {
      bar.classList.toggle('is-on', !en.isIntersecting && en.boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(cta);
  }
})();
