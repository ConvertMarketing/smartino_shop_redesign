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
