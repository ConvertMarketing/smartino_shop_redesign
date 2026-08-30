import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (f) => JSON.parse(readFileSync(resolve('data', f), 'utf8'));

const raw = read('products.json');
const rawCollections = read('collections.json');
const collectionProducts = read('collection-products.json');

/**
 * Numărul de bucăți din titlu — „…, 120 bucăți", „30 buc", „28 bucati".
 * Returnează null dacă nu e sigur. La implementarea pe Shopify asta trebuie
 * să vină dintr-un metafield, nu din parsarea titlului (vezi docs/ella-mapping.md §3.4).
 */
function unitsFromTitle(title) {
  const m = title.match(/(\d{1,4})\s*(?:buc[ăa]?[tț]i|bucati|buc)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n > 1 && n <= 5000 ? n : null;
}

/** Mărimea de scutec, pentru fațete: „mărime 4 Maxi, 7-14kg" */
function babySize(title) {
  const m = title.match(/m[ăa]rime[a]?\s*(\d)\b/i);
  return m ? Number(m[1]) : null;
}

/** Absorbția în picături, pentru incontinență: „7.5 Picături" */
function drops(title) {
  const m = title.match(/(\d+(?:[.,]\d+)?)\s*pic[ăa]turi/i);
  return m ? Number(m[1].replace(',', '.')) : null;
}

/** Talia în cm: „120-160 cm" */
function waist(title) {
  const m = title.match(/(\d{2,3})\s*-\s*(\d{2,3})\s*cm/i);
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
}

/**
 * 14 zile, nu 60. În catalogul real 397 de produse au fost publicate în ultimele
 * 30 de zile (o republicare în masă), deci un prag larg ar pune „Nou" pe o treime
 * din magazin — un badge care apare peste tot nu mai informează pe nimeni.
 * La 14 zile rămân 89 de produse (7%), ceea ce înseamnă ceva.
 */
const NEW_DAYS = 14;
const now = Date.now();

const products = raw.map((p) => {
  const variants = p.variants.map((v) => ({
    id: v.id,
    title: v.title,
    price: Number(v.price),
    compareAt: v.compare_at_price ? Number(v.compare_at_price) : null,
    available: v.available !== false,
    options: [v.option1, v.option2, v.option3].filter(Boolean),
  }));

  const v0 = variants[0] || {};
  const price = v0.price ?? 0;
  const compareAt = v0.compareAt && v0.compareAt > price ? v0.compareAt : null;
  const discountPct = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : null;

  const units = unitsFromTitle(p.title);
  // Preț pe bucată doar când numărul e sigur și rezultatul e util de afișat.
  const perUnit = units && price > 0 ? price / units : null;

  const images = (p.images || []).map((i) => ({
    src: i.src,
    alt: i.alt || p.title,
    width: i.width,
    height: i.height,
  }));

  const publishedAt = p.published_at ? Date.parse(p.published_at) : null;
  const isNew = publishedAt ? now - publishedAt < NEW_DAYS * 864e5 : false;

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    vendor: p.vendor || '',
    type: p.product_type || '',
    tags: p.tags || [],
    bodyHtml: p.body_html || '',
    images,
    image: images[0] || null,
    hoverImage: images[1] || null,
    variants,
    price,
    compareAt,
    discountPct,
    units,
    perUnit,
    available: variants.some((v) => v.available),
    isNew,
    isBundle: /pachet\s*promo|pachet\s*promo[țt]ional/i.test(p.title),
    facets: {
      size: babySize(p.title),
      drops: drops(p.title),
      waist: waist(p.title),
      units,
    },
  };
});

const byHandle = new Map(products.map((p) => [p.handle, p]));

const collections = rawCollections
  .map((c) => {
    const handles = collectionProducts[c.handle] || [];
    const items = handles.map((h) => byHandle.get(h)).filter(Boolean);
    return {
      id: c.id,
      title: c.title,
      handle: c.handle,
      description: c.body_html || '',
      count: items.length,
      productHandles: handles,
    };
  })
  .filter((c) => c.count > 0);

/**
 * Reduceri diversificate: catalogul e dominat de Sleepy și Macromax, iar o
 * selecție „primele 8" arăta 8 pachete de șervețele aproape identice.
 * Round-robin pe vendor, cu reducerea cea mai mare prima în fiecare grup.
 */
function diversifiedSale(list, limit) {
  const byVendor = new Map();
  for (const p of list) {
    const key = p.vendor || '—';
    if (!byVendor.has(key)) byVendor.set(key, []);
    byVendor.get(key).push(p);
  }
  for (const group of byVendor.values()) group.sort((a, b) => b.discountPct - a.discountPct);
  const groups = [...byVendor.values()];
  const out = [];
  for (let round = 0; out.length < limit; round++) {
    let added = false;
    for (const g of groups) {
      if (g[round]) { out.push(g[round]); added = true; }
      if (out.length >= limit) break;
    }
    if (!added) break;
  }
  return out;
}

// Doar produse disponibile: un rând promo pe Home care deschide cu „Stoc epuizat"
// irosește cel mai bun spațiu din pagină. Rămân vizibile pe PLP, cu badge onest.
const onSale = products.filter((p) => p.discountPct > 0 && p.available);

export default {
  products,
  saleFeatured: diversifiedSale(onSale, 8),
  // Cifrele din hero vin din catalog, nu scrise de mână: altfel devin false
  // la prima actualizare de preț.
  sale: {
    count: onSale.length,
    maxPct: onSale.reduce((m, p) => Math.max(m, p.discountPct || 0), 0),
  },
  collections,
  productsByHandle: Object.fromEntries(byHandle),
  stats: {
    products: products.length,
    collections: collections.length,
    withPerUnit: products.filter((p) => p.perUnit).length,
    onSale: products.filter((p) => p.discountPct).length,
  },
};
