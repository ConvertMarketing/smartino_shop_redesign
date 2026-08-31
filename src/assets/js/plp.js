/* Pagina de colecție — filtrare, sortare și „încarcă mai multe" fără framework.
 *
 * Sursa de adevăr e location.search. Formularul e oglinda lui, iar numele
 * câmpurilor sunt exact parametrii Shopify: la portare se scoate preventDefault
 * și formularul merge nativ, pe server, fără să se atingă HTML-ul.
 *
 * JS-ul nu construiește niciodată markup de card: lucrează pe poziții, peste un
 * index numeric. Cardul rămâne singura sursă de conținut. */
(() => {
  'use strict';
  const root = document.querySelector('[data-plp]');
  if (!root) return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const INDEX = JSON.parse(root.dataset.index);
  const VENDORS = JSON.parse(root.dataset.vendors);
  const TYPES = JSON.parse(root.dataset.types);
  const PAGE = Number(root.dataset.pageSize) || 24;

  /* Coloanele indexului, în ordinea din src/_data/plp.js */
  const PRICE = 0, AVAIL = 1, VENDOR = 2, UNITS = 3, SIZE = 4, ASIZE = 5,
        PERUNIT = 6, DISCOUNT = 7, PUBLISHED = 8, TYPE = 9;

  const rail = $('[data-rail]');
  const grid = $('[data-grid]');
  const cells = $$('.plp__cell', grid);
  const chips = $('[data-chips]');
  const empty = $('[data-empty]');
  const more = $('[data-more]');
  const sort = $('[data-sort]');
  const scrim = $('[data-filters-scrim]');

  let shown = PAGE;
  let lastAdded = null;   /* ultimul filtru pus, pentru butonul de recuperare */

  /* ---------------------------------------------------------------- stare */
  const readState = () => {
    const p = new URLSearchParams(location.search);
    const f = new Map();
    for (const [k, v] of p) {
      if (!k.startsWith('filter.')) continue;
      if (!f.has(k)) f.set(k, new Set());
      f.get(k).add(v);
    }
    return { filters: f, sort: p.get('sort_by') || 'manual', page: Number(p.get('page')) || 1 };
  };

  const writeState = (state, replace) => {
    const p = new URLSearchParams();
    for (const [k, set] of state.filters) [...set].forEach((v) => p.append(k, v));
    if (state.sort && state.sort !== 'manual') p.set('sort_by', state.sort);
    if (state.page > 1) p.set('page', String(state.page));
    const q = p.toString();
    const url = location.pathname + (q ? '?' + q : '');
    /* replaceState la load-more: butonul înapoi duce la starea de filtre
       anterioară, nu derulează paginarea înapoi pas cu pas. */
    history[replace ? 'replaceState' : 'pushState']({}, '', url);
  };

  /* ------------------------------------------------------------ potrivire */
  const inBand = (n, spec) => {
    const [lo, hi] = spec.split('-');
    return n >= Number(lo) * 100 && (hi === '' || n < Number(hi) * 100);
  };

  const matches = (row, filters) => {
    for (const [key, set] of filters) {
      const vals = [...set];
      let ok = false;
      switch (key) {
        case 'filter.p.vendor':
          ok = vals.some((v) => VENDORS[row[VENDOR]] === v); break;
        case 'filter.p.product_type':
          ok = vals.some((v) => TYPES[row[TYPE]] === v); break;
        case 'filter.v.availability':
          ok = vals.some((v) => String(row[AVAIL]) === v); break;
        case 'filter.v.price':
          ok = vals.some((v) => inBand(row[PRICE], v)); break;
        case 'filter.p.m.custom.bucati':
          ok = vals.some((v) => String(row[UNITS]) === v); break;
        case 'filter.p.m.custom.marime':
          ok = vals.some((v) => String(row[SIZE]) === v); break;
        case 'filter.p.m.custom.marime_adult':
          ok = vals.some((v) => String(row[ASIZE]) === v); break;
        case 'filter.p.m.custom.reducere':
          ok = row[DISCOUNT] > 0; break;
        default:
          ok = true;
      }
      if (!ok) return false;
    }
    return true;
  };

  const SORTS = {
    'price-ascending': (a, b) => INDEX[a][PRICE] - INDEX[b][PRICE],
    'price-descending': (a, b) => INDEX[b][PRICE] - INDEX[a][PRICE],
    'discount-descending': (a, b) => INDEX[b][DISCOUNT] - INDEX[a][DISCOUNT],
    'created-descending': (a, b) => INDEX[b][PUBLISHED] - INDEX[a][PUBLISHED],
    /* Produsele fără preț pe bucată se grupează la coadă, nu se intercalează
       tăcut printre cele comparabile. */
    'unit-ascending': (a, b) => {
      const x = INDEX[a][PERUNIT] || Infinity, y = INDEX[b][PERUNIT] || Infinity;
      return x - y;
    },
  };

  /* ------------------------------------------------------------- randare */
  const LABELS = {
    'filter.p.vendor': 'Brand', 'filter.p.product_type': 'Subcategorie',
    'filter.v.availability': 'Disponibilitate', 'filter.v.price': 'Preț',
    'filter.p.m.custom.bucati': 'Bucăți', 'filter.p.m.custom.marime': 'Mărime',
    'filter.p.m.custom.marime_adult': 'Mărime', 'filter.p.m.custom.reducere': 'Ofertă',
  };
  const valueLabel = (key, val) => {
    const input = rail && $(`input[name="${CSS.escape(key)}"][value="${CSS.escape(val)}"]`, rail);
    if (input) return $('.facet__txt', input.closest('label')).textContent.trim();
    const pill = $(`.pill[data-facet="${CSS.escape(key)}"][data-value="${CSS.escape(val)}"]`);
    if (pill) return $('.pill__v', pill).textContent.trim();
    return val;
  };

  function apply(state, opts = {}) {
    const keep = [];
    cells.forEach((cell, i) => { if (matches(INDEX[i], state.filters)) keep.push(i); });

    const cmp = SORTS[state.sort];
    if (cmp) keep.sort(cmp);

    /* Reordonarea se face mutând nodurile, nu cu CSS order: ordinea de
       tabulare trebuie să urmeze ordinea vizuală. */
    if (cmp) keep.forEach((i) => grid.appendChild(cells[i]));
    else [...cells].sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i))
      .forEach((c) => grid.appendChild(c));

    const visible = new Set(keep.slice(0, shown));
    cells.forEach((cell, i) => { cell.hidden = !visible.has(i); });

    $$('[data-count]').forEach((el) => { el.textContent = keep.length; });
    $$('[data-count-word]').forEach((el) => { el.textContent = keep.length === 1 ? 'produs' : 'produse'; });
    const applyN = $('[data-apply-n]'); if (applyN) applyN.textContent = keep.length;

    empty.hidden = keep.length > 0;
    grid.hidden = keep.length === 0;
    more.hidden = keep.length <= shown;
    const s = $('[data-shown]'), t = $('[data-total]');
    if (s) s.textContent = Math.min(shown, keep.length);
    if (t) t.textContent = keep.length;
    const load = $('[data-load]');
    if (load) load.href = '?page=' + (Math.floor(shown / PAGE) + 1);

    renderChips(state, keep.length);
    syncControls(state);
    renderEmpty(state);

    /* Cardurile nou apărute trebuie să-și recapete starea „în coș". */
    window.__renderCards__ && window.__renderCards__();
    if (opts.scroll) grid.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function renderChips(state, n) {
    const parts = [];
    for (const [key, set] of state.filters) {
      for (const v of set) {
        parts.push(`<span class="chip"><span>${LABELS[key] || ''}: <b>${valueLabel(key, v)}</b></span>`
          + `<button class="chip__x" type="button" data-rm-key="${key}" data-rm-val="${v}"`
          + ` aria-label="Scoate filtrul ${LABELS[key]}: ${valueLabel(key, v)}">×</button></span>`);
      }
    }
    const total = parts.length;
    if (total >= 2) parts.push('<button class="chips__clear" type="button" data-clear>Șterge tot</button>');
    chips.innerHTML = parts.join('');
    chips.hidden = total === 0;
    const badge = $('[data-active-n]');
    if (badge) { badge.textContent = total; badge.hidden = total === 0; }
    const clear = $('.rail__clear'); if (clear) clear.hidden = total === 0;
  }

  function renderEmpty(state) {
    const hint = $('[data-empty-hint]'), undo = $('[data-undo]');
    if (!hint) return;
    if (!lastAdded) { hint.textContent = 'Încearcă să scoți un filtru.'; undo.hidden = true; return; }
    const probe = new Map([...state.filters].map(([k, v]) => [k, new Set(v)]));
    probe.get(lastAdded.key)?.delete(lastAdded.val);
    if (!probe.get(lastAdded.key)?.size) probe.delete(lastAdded.key);
    const n = INDEX.filter((row) => matches(row, probe)).length;
    hint.textContent = `Ultimul filtru pus a fost „${LABELS[lastAdded.key]}: ${valueLabel(lastAdded.key, lastAdded.val)}".`;
    undo.hidden = false;
    undo.textContent = `Scoate-l → ${n} ${n === 1 ? 'produs' : 'produse'}`;
  }

  function syncControls(state) {
    if (rail) {
      $$('input[type=checkbox]', rail).forEach((i) => {
        i.checked = !!state.filters.get(i.name)?.has(i.value);
      });
    }
    $$('.pill').forEach((p) => {
      const on = !!state.filters.get(p.dataset.facet)?.has(p.dataset.value);
      p.setAttribute('aria-pressed', String(on));
    });
    if (sort) sort.value = state.sort;
  }

  /* ---------------------------------------------------------- interacțiune */
  const toggle = (key, val) => {
    const state = readState();
    if (!state.filters.has(key)) state.filters.set(key, new Set());
    const set = state.filters.get(key);
    if (set.has(val)) { set.delete(val); if (!set.size) state.filters.delete(key); lastAdded = null; }
    else { set.add(val); lastAdded = { key, val }; }
    shown = PAGE;
    state.page = 1;
    writeState(state);
    apply(state);
  };

  root.addEventListener('change', (e) => {
    const cb = e.target.closest('input[type=checkbox]');
    if (cb) { toggle(cb.name, cb.value); return; }
    if (e.target === sort) {
      const state = readState();
      state.sort = sort.value; shown = PAGE; state.page = 1;
      writeState(state); apply(state);
    }
  });

  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (pill) { toggle(pill.dataset.facet, pill.dataset.value); return; }

    const rm = e.target.closest('[data-rm-key]');
    if (rm) { toggle(rm.dataset.rmKey, rm.dataset.rmVal); return; }

    if (e.target.closest('[data-clear]')) {
      const state = readState(); state.filters.clear(); shown = PAGE; state.page = 1;
      lastAdded = null; writeState(state); apply(state); return;
    }

    if (e.target.closest('[data-undo]')) {
      if (lastAdded) toggle(lastAdded.key, lastAdded.val);
      return;
    }

    const load = e.target.closest('[data-load]');
    if (load) {
      e.preventDefault();
      shown += PAGE;
      const state = readState();
      state.page = Math.floor(shown / PAGE);
      writeState(state, true);
      apply(state);
      return;
    }

    if (e.target.closest('[data-open-filters]')) { openRail(true); return; }
    if (e.target.closest('[data-apply]') || e.target === scrim) { openRail(false); return; }
  });

  function openRail(on) {
    if (!rail) return;
    rail.classList.toggle('is-open', on);
    scrim.hidden = !on;
    requestAnimationFrame(() => scrim.classList.toggle('is-open', on));
    document.body.style.overflow = on ? 'hidden' : '';
    if (on) $('.rail__head h2', rail)?.setAttribute('tabindex', '-1');
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rail?.classList.contains('is-open')) openRail(false);
  });

  window.addEventListener('popstate', () => {
    const state = readState();
    shown = Math.max(PAGE, state.page * PAGE);
    apply(state);
  });

  /* Starea inițială vine din URL: link-urile adânci funcționează. */
  const initial = readState();
  shown = Math.max(PAGE, initial.page * PAGE);
  apply(initial);
})();
