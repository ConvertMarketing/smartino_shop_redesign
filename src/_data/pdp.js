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
    related,
    specs,
    /* Cât mai lipsește până la livrarea gratuită — regula reală de 200 lei. */
    saves: p.compareAt ? Math.round((p.compareAt - p.price) * 100) / 100 : 0,

  };
});
