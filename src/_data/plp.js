/**
 * Datele paginilor de colecție.
 *
 * Forma fațetelor e deliberat identică cu `collection.filters` din Shopify
 * (label / param_name / type / values[{label,value,count}]), ca markup-ul barei
 * de filtre să se porteze 1:1. Vezi docs/ella-mapping.md §3.5.
 *
 * Regula de aur: o fațetă apare doar dacă separă efectiv colecția. Fără ea,
 * pe colecția Macromax sidebarul ar arăta „Brand: Macromax (125)" ca unică
 * opțiune, iar pe încălțăminte ar arăta șase fațete cu câte o valoare.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import catalog from './catalog.js';
import nav from './nav.js';

const raw = JSON.parse(readFileSync(resolve('data/products.json'), 'utf8'));
const publishedDay = new Map(
  raw.map((p) => [p.handle, p.published_at ? Math.round(Date.parse(p.published_at) / 864e5) : 0]),
);
const typeOf = new Map(raw.map((p) => [p.handle, (p.product_type || '').trim()]));

/**
 * Câte carduri intră în HTML. Shopify acceptă `{% paginate ... by N %}` cu N
 * între 1 și 250; un `{% for %}` fără paginate se oprește tăcut la 50. Peste
 * 250 nu mai e portabil, deci prototipul se oprește tot acolo.
 */
const CAP = 240;
/** Câte carduri sunt vizibile înainte de „Încarcă mai multe". */
const PAGE = 24;

/** Colecțiile interne, de test și campaniile expirate — nu primesc pagină. */
const HIDDEN = /(^|-)(test|cr)$|reelup|do-not-delete|^cosmetice-1$|craciun-202[0-4]/i;

/* „pampers" și „Pampers" sunt același brand; altfel ies două fațete. */
const brand = (v) => (v || '').trim().replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase());

/* product_type e ierarhic, separat cu „|" apoi „>”. Rădăcina e categoria. */
const typeRoot = (h) => (typeOf.get(h) || '').split(/[|>]/)[0].trim();
/* Frunza e ultimul segment; când tipul n-are separator, tipul însuși e frunza.
   Pe scutece toate produsele au același tip, deci fațeta cade singură. */
const typeLeaf = (h) => {
  const parts = (typeOf.get(h) || '').split(/[|>]/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
};

/** Etichete pentru rădăcinile scrise ca slug în catalog. */
const TYPE_LABEL = {
  fondten: 'Fond de ten', paletadefarduri: 'Palete de farduri', eyeliner: 'Eyeliner',
  tint: 'Tint de buze', sisua: 'Sisua', creionbuze: 'Creion de buze',
  creionsparancene: 'Creion de sprâncene', 'capsule tems': 'Capsule Tems',
};
const label = (s) => TYPE_LABEL[s.toLowerCase()] || s;

/**
 * Regula de afișare condiționată, una singură, aplicată la build.
 * O valoare „cu masă" are cel puțin 3 produse ȘI cel puțin 5% din colecție.
 */
function listFacet(cfg, items) {
  const { label: lbl, param, valueOf, labelOf = String, sort, minCoverage = 0.5, binary = false } = cfg;
  const map = new Map();
  let covered = 0;
  for (const p of items) {
    const v = valueOf(p);
    if (v === null || v === undefined || v === '') continue;
    covered += 1;
    map.set(v, (map.get(v) || 0) + 1);
  }
  if (!map.size) return null;
  if (covered / items.length < minCoverage) return null;

  const massMin = Math.max(3, Math.ceil(items.length * 0.05));
  const withMass = [...map.values()].filter((n) => n >= massMin).length;

  if (binary) {
    /* O fațetă binară e utilă doar dacă latura minoritară are masă. */
    const counts = [...map.values()].sort((a, b) => a - b);
    if (map.size < 2 || counts[0] < massMin) return null;
  } else {
    if (withMass < 2) return null;
    /* Dacă o valoare ia peste 80% din colecție, fațeta nu separă nimic. */
    if (Math.max(...map.values()) / covered > 0.8) return null;
  }

  const values = [...map].map(([value, count]) => ({
    value: String(value), label: labelOf(value), count, thin: count < massMin,
  }));
  values.sort(sort || ((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ro')));
  return { label: lbl, param_name: param, type: 'list', values };
}

const asc = (a, b) => Number(a.value) - Number(b.value);

/** Benzi de preț recalculate pe colecție; benzile goale cad. */
function priceFacet(items) {
  const prices = items.map((p) => p.price).filter((n) => n > 0);
  if (prices.length / items.length < 0.9) return null;
  const BANDS = [
    [0, 20, 'Sub 20 lei'], [20, 50, '20 – 50 lei'], [50, 100, '50 – 100 lei'],
    [100, 200, '100 – 200 lei'], [200, Infinity, 'Peste 200 lei'],
  ];
  const values = BANDS
    .map(([lo, hi, lbl]) => ({
      value: `${lo}-${hi === Infinity ? '' : hi}`, label: lbl,
      count: prices.filter((n) => n >= lo && n < hi).length,
    }))
    .filter((b) => b.count > 0);
  if (values.length < 2) return null;
  return { label: 'Preț', param_name: 'filter.v.price', type: 'list', values };
}

/**
 * Zona de auto-selecție: criteriul pe care cumpărătorul îl știe dinainte,
 * scos deasupra grilei, nu ascuns în drawer. Se randează doar unde datele
 * chiar îl susțin — nu se umple cu subcategorii ca să nu fie goală.
 */
function pills(items) {
  const kg = new Map();
  for (const p of items) {
    const s = p.facets.size;
    if (s && p.facets.waist === null) {
      const m = p.title.match(/\((\d{1,2})\s*[-–]\s*(\d{1,2})\)|(\d{1,2})\s*[-–]\s*(\d{1,2})\s*kg/i);
      if (m && !kg.has(s)) kg.set(s, m[1] ? `${m[1]}–${m[2]} kg` : `${m[3]}–${m[4]} kg`);
    }
  }
  const baby = new Map(), adult = new Map();
  for (const p of items) {
    if (p.facets.size) baby.set(p.facets.size, (baby.get(p.facets.size) || 0) + 1);
    if (p.facets.adultSize) adult.set(p.facets.adultSize, (adult.get(p.facets.adultSize) || 0) + 1);
  }
  const pick = (map, kind) => {
    if (map.size < 3) return null;
    const covered = [...map.values()].reduce((a, b) => a + b, 0);
    if (covered / items.length < 0.5) return null;
    const ORDER = ['XS', 'XS/S', 'S', 'S/M', 'M', 'L', 'L/XL', 'XL', 'XXL', 'XXXL'];
    const values = [...map].map(([value, count]) => ({
      value: String(value), count,
      label: kind === 'baby' ? String(value) : String(value),
      sub: kind === 'baby' ? (kg.get(value) || '') : '',
    }));
    values.sort(kind === 'baby'
      ? (a, b) => Number(a.value) - Number(b.value)
      : (a, b) => ORDER.indexOf(a.value) - ORDER.indexOf(b.value));
    return {
      kind,
      label: kind === 'baby' ? 'Alege mărimea' : 'Alege mărimea',
      param_name: kind === 'baby' ? 'filter.p.m.custom.marime' : 'filter.p.m.custom.marime_adult',
      values,
      missing: items.length - covered,
    };
  };
  return pick(baby, 'baby') || pick(adult, 'adult');
}

function buildFilters(items) {
  const out = [
    listFacet({
      label: 'Subcategorie', param: 'filter.p.product_type',
      valueOf: (p) => typeLeaf(p.handle) || null, labelOf: label, minCoverage: 0.6,
    }, items),
    listFacet({
      label: 'Bucăți în pachet', param: 'filter.p.m.custom.bucati',
      valueOf: (p) => bandUnits(p.units), labelOf: (v) => UNIT_BANDS[v], sort: (a, b) => Number(a.value) - Number(b.value),
    }, items),
    priceFacet(items),
    listFacet({ label: 'Brand', param: 'filter.p.vendor', valueOf: (p) => brand(p.vendor) }, items),
    listFacet({
      label: 'Ofertă', param: 'filter.p.m.custom.reducere', binary: true,
      valueOf: (p) => (p.discountPct > 0 ? '1' : null), labelOf: () => 'La reducere',
    }, items),
    listFacet({
      label: 'Disponibilitate', param: 'filter.v.availability', binary: true,
      valueOf: (p) => (p.available ? '1' : '0'),
      labelOf: (v) => (v === '1' ? 'În stoc' : 'Stoc epuizat'),
      sort: (a, b) => b.value.localeCompare(a.value),
    }, items),
  ].filter(Boolean);
  return out;
}

/* 74 de valori exacte de „bucăți" nu sunt un filtru; benzile sunt. */
const UNIT_BANDS = { 1: 'Până în 20', 2: '20 – 50', 3: '50 – 100', 4: '100 – 500', 5: 'Peste 500' };
const bandUnits = (n) => {
  if (!n) return null;
  if (n < 20) return 1; if (n < 50) return 2; if (n < 100) return 3; if (n < 500) return 4;
  return 5;
};

/**
 * Indexul numeric trimis către client — o linie per card, în aceeași ordine ca
 * în grilă. Fără handle, fără titlu, fără URL de imagine: JS-ul lucrează pe
 * poziții, iar cardul rămâne singura sursă de conținut.
 */
const indexRow = (p, vendors, types) => [
  Math.round(p.price * 100),
  p.available ? 1 : 0,
  vendors.indexOf(brand(p.vendor)),
  bandUnits(p.units) || 0,
  p.facets.size || 0,
  p.facets.adultSize ? p.facets.adultSize : '',
  p.perUnit ? Math.round(p.perUnit * 100) : 0,
  p.discountPct || 0,
  publishedDay.get(p.handle) || 0,
  types.indexOf(typeLeaf(p.handle)),
];

export default catalog.collections
  .filter((c) => !HIDDEN.test(c.handle) && c.count > 0)
  .map((c) => {
    const all = c.productHandles.map((h) => catalog.productsByHandle[h]).filter(Boolean);
    const items = all.slice(0, CAP);
    const vendors = [...new Set(items.map((p) => brand(p.vendor)))];
    const types = [...new Set(items.map((p) => typeLeaf(p.handle)))];
    /* Firul de navigare se afișează doar când rădăcina chiar descrie colecția:
       pe cosmetice, cea mai frecventă rădăcină e „fondten", cu 13 din 66. */
    const roots = items.map((p) => typeRoot(p.handle)).filter(Boolean);
    const top = roots.length
      ? [...roots.reduce((m, r) => m.set(r, (m.get(r) || 0) + 1), new Map())]
          .sort((a, b) => b[1] - a[1])[0]
      : null;
    const root = top && top[1] / items.length >= 0.6 ? top[0] : '';
    const brands = new Set(items.map((p) => brand(p.vendor)));

    /* Colecțiile mici nu primesc sidebar deloc — doar sortare. */
    const filters = items.length >= 12 ? buildFilters(items) : [];

    return {
      handle: c.handle,
      title: c.title,
      description: c.description,
      count: items.length,
      total: c.count,
      pageSize: PAGE,
      capped: c.count > CAP,
      /* Firul de navigare vine din product_type, nu din meniu: 8 sublink-uri
         din nav sunt complet disjuncte de rădăcina lor. */
      crumb: root && label(root) !== c.title ? label(root) : '',
      monoBrand: brands.size === 1 && items.length >= 20 ? [...brands][0] : '',
      pills: pills(items),
      filters,
      products: items,
      vendors,
      types,
      index: items.map((p) => indexRow(p, vendors, types)),
      perUnitSort: items.filter((p) => p.perUnit).length / items.length >= 0.7 && types.filter(Boolean).length <= 2,
    };
  });
