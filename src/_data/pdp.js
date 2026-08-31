/**
 * Datele paginilor de produs.
 *
 * Firul de navigare, descrierea, specificațiile extrase din titlu și produsele
 * din aceeași categorie. Prețurile vin direct din catalog.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import catalog from './catalog.js';

const raw = JSON.parse(readFileSync(resolve('data/products.json'), 'utf8'));
const bodyOf = new Map(raw.map((p) => [p.handle, p.body_html || '']));
const typeOf = new Map(raw.map((p) => [p.handle, (p.product_type || '').trim()]));

/* Frunza tipului de produs: ultimul segment din „a | b > c". */
const typeLeaf = (h) => {
  const t = (typeOf.get(h) || '').split(/[|>]/).map((x) => x.trim()).filter(Boolean);
  return t.length ? t[t.length - 1] : '';
};

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

const SPEC_LABELS = {
  size: 'Mărime', adultSize: 'Mărime', waist: 'Talie', drops: 'Absorbție',
  units: 'Bucăți în pachet', pack: 'Conținutul pachetului', vendor: 'Brand', type: 'Categorie',
};

export default catalog.products.map((p) => {
  /**
   * Cross-sell: produse de alt tip din colecțiile pe care le împarte cu acesta.
   * NU sunt „cele mai frecvent cumpărate împreună" — exportul n-are date de
   * comenzi, iar o astfel de afirmație n-ar avea nimic în spate. Sunt produse
   * complementare, alese ca să funcționeze ca adaos: mai ieftine decât cel
   * principal, din cea mai specifică colecție comună.
   */
  const shared = catalog.collections
    .filter((c) => c.count >= 6 && c.count <= 400 && !HIDDEN.test(c.handle)
      && c.productHandles.includes(p.handle))
    .sort((a, b) => a.count - b.count);
  const seenX = new Set([p.handle]);
  const cross = [];
  for (const c of shared) {
    for (const h of c.productHandles) {
      if (seenX.has(h)) continue;
      const q = catalog.productsByHandle[h];
      if (!q || !q.available || !q.image) continue;
      if (!typeLeaf(h) || typeLeaf(h) === typeLeaf(p.handle)) continue;
      if (q.price > p.price) continue;      /* adaosul nu costă mai mult decât produsul */
      seenX.add(h);
      cross.push(q);
    }
    if (cross.length >= 12) break;
  }
  cross.sort((a, b) => a.price - b.price);
  const crossSell = cross.slice(0, 3);

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
    crossSell,
    crossTotal: crossSell.reduce((n, q) => n + q.price, p.price),
    related,
    specs,
    /* Cât mai lipsește până la livrarea gratuită — regula reală de 200 lei. */
    saves: p.compareAt ? Math.round((p.compareAt - p.price) * 100) / 100 : 0,

  };
});
