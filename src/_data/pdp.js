/**
 * Datele paginilor de produs.
 *
 * Piesa centrală e „alte formate": catalogul are 1.202 din 1.203 produse cu o
 * singură variantă („Default Title"), deci selectorul clasic de variante e gol.
 * În schimb, mărimile și formatele aceluiași produs sunt produse separate —
 * așa că le regrupăm noi și le comparăm după prețul pe bucată. Asta e și
 * argumentul comercial al magazinului, nu doar o comoditate de navigare.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import catalog from './catalog.js';

const raw = JSON.parse(readFileSync(resolve('data/products.json'), 'utf8'));
const bodyOf = new Map(raw.map((p) => [p.handle, p.body_html || '']));
const typeOf = new Map(raw.map((p) => [p.handle, (p.product_type || '').trim()]));

/**
 * Cheia de familie: brandul plus titlul curățat de tot ce diferențiază
 * formatele — multiplicator, cantitate, mărime, interval de greutate, picături.
 * Ce rămâne e linia de produs.
 */
function familyKey(p) {
  const t = p.title.toLowerCase()
    .replace(/^\s*\d{1,3}\s*[x×]\s+/, '')
    .replace(/pachet\s*promo\w*/g, '')
    .replace(/\d+(?:[.,]\d+)?\s*(?:buc[ăa]?[tț]i|bucati|buc)\b/g, '')
    .replace(/m[ăa]rime[a]?\s*\S+/g, '')
    .replace(/\bnr\.?\s*\d+/g, '')
    .replace(/\(\s*\d+[^)]*\)/g, '')
    .replace(/\d+\s*[-–]\s*\d+\s*(kg|cm)/g, '')
    .replace(/\d+(?:[.,]\d+)?\s*pic\S*/g, '')
    .replace(/[^a-zăâîșț ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${p.vendor || ''}|${t}`;
}

const families = new Map();
for (const p of catalog.products) {
  const k = familyKey(p);
  if (!families.has(k)) families.set(k, []);
  families.get(k).push(p);
}

/**
 * Colecția în care produsul e cel mai „acasă". Nu pur și simplu cea mai mică:
 * asta scotea „Servetele Sleepy Easy Clean Craciun" ca fir de navigare.
 * Se exclud colecțiile interne și campaniile, apoi se ia cea mai mică de peste
 * 12 produse; dacă nu există niciuna, cea mai mare rămasă.
 */
const HIDDEN = /(^|-)(test|cr)$|reelup|do-not-delete|^cosmetice-1$|craciun|cr[ăa]ciun|black-?friday|paste|valentine/i;
const homeCollection = new Map();
for (const h of Object.keys(catalog.productsByHandle)) {
  const inn = catalog.collections.filter((c) => !HIDDEN.test(c.handle) && c.productHandles.includes(h));
  if (!inn.length) continue;
  const solid = inn.filter((c) => c.count >= 12).sort((a, b) => a.count - b.count);
  homeCollection.set(h, solid[0] || inn.sort((a, b) => b.count - a.count)[0]);
}

/** Eticheta scurtă a formatului, pentru rândurile din „alte formate". */
function formatLabel(p) {
  const bits = [];
  if (p.facets.size) bits.push(`mărimea ${p.facets.size}`);
  else if (p.facets.adultSize) bits.push(`mărimea ${p.facets.adultSize}`);
  if (p.packDesc) bits.push(p.packDesc);
  else if (p.units) bits.push(`${p.units} bucăți`);
  if (!bits.length && p.facets.waist) bits.push(`${p.facets.waist.min}–${p.facets.waist.max} cm`);
  return bits.join(' · ') || p.title;
}

const SPEC_LABELS = {
  size: 'Mărime', adultSize: 'Mărime', waist: 'Talie', drops: 'Absorbție',
  units: 'Bucăți în pachet', pack: 'Conținutul pachetului', vendor: 'Brand', type: 'Categorie',
};

export default catalog.products.map((p) => {
  const fam = (families.get(familyKey(p)) || [])
    .filter((s) => s.handle !== p.handle && s.available)
    .sort((a, b) => (a.perUnit || Infinity) - (b.perUnit || Infinity));

  /* Se arată doar dacă chiar e o alegere: cel puțin un frate, iar unde există
     preț pe bucată pe ambele, o diferență care merită arătată. */
  /* Catalogul are formate duplicate — trei produse distincte cu exact același
     „6 × 100 bucăți" la același preț. Un rând per format, nu per handle. */
  const seen = new Set();
  const siblings = fam.filter((s) => {
    const k = `${formatLabel(s)}|${s.price}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);
  /* Eticheta apare doar dacă diferența se și vede în cifra afișată: „cel mai
     bun preț/buc" lângă 0,52 când produsul curent e tot 0,52 arată a greșeală. */
  const withUnit = [p, ...siblings].filter((x) => x.perUnit);
  const cheapest = withUnit.length > 1
    ? withUnit.reduce((m, x) => (x.perUnit < m.perUnit ? x : m))
    : null;
  const round2 = (n) => Math.round(n * 100) / 100;
  const best = cheapest && p.perUnit && round2(cheapest.perUnit) < round2(p.perUnit)
    ? cheapest
    : (cheapest && !p.perUnit ? cheapest : null);

  const home = homeCollection.get(p.handle);
  const related = home
    ? home.productHandles
        .map((h) => catalog.productsByHandle[h])
        .filter((x) => x && x.handle !== p.handle && x.available)
        .slice(0, 8)
    : [];

  const specs = [];
  if (p.facets.size) specs.push([SPEC_LABELS.size, String(p.facets.size)]);
  else if (p.facets.adultSize) specs.push([SPEC_LABELS.adultSize, p.facets.adultSize]);
  if (p.facets.waist) specs.push([SPEC_LABELS.waist, `${p.facets.waist.min}–${p.facets.waist.max} cm`]);
  if (p.facets.drops) specs.push([SPEC_LABELS.drops, `${String(p.facets.drops).replace('.', ',')} picături`]);
  if (p.packDesc) specs.push([SPEC_LABELS.pack, p.packDesc]);
  if (p.units) specs.push([p.packDesc ? 'Total bucăți' : SPEC_LABELS.units, String(p.units)]);
  if (p.vendor) specs.push([SPEC_LABELS.vendor, p.vendor]);
  const t = (typeOf.get(p.handle) || '').split(/[|>]/).map((s) => s.trim()).filter(Boolean);
  if (t.length) specs.push([SPEC_LABELS.type, t[t.length - 1]]);

  return {
    handle: p.handle,
    product: p,
    body: bodyOf.get(p.handle) || '',
    crumb: home && home.title !== p.title ? { title: home.title, handle: home.handle } : null,
    siblings: siblings.map((s) => ({
      handle: s.handle, label: formatLabel(s), price: s.price,
      perUnit: s.perUnit, units: s.units, isBest: best && best.handle === s.handle,
    })),
    isBest: !!(best && best.handle === p.handle),
    hasChoice: siblings.length > 0,
    related,
    specs,
    /* Cât mai lipsește până la livrarea gratuită — regula reală de 200 lei. */
    saves: p.compareAt ? Math.round((p.compareAt - p.price) * 100) / 100 : 0,
  };
});
