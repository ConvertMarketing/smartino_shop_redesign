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
  if (!(n > 1 && n <= 5000)) return null;
  const k = packMultiplier(title);
  const total = n * k;
  return total <= 20000 ? total : null;
}

/**
 * Multiplicatorul din titlu — „12x MACROMAX … 5 Buc" = 60 de lavete.
 *
 * Garda e pozițională, nu pe listă de cuvinte: „60 X 90 cm" e o dimensiune și
 * „6X Large" e mărimea scutecului, dar „24x MINI Șervețele" e multiplicator
 * legitim. Deci nu se filtrează după cuvinte generice, ci după ce urmează
 * imediat după potrivire. Fără garda asta, Păturicile Sleepy ieșeau cu 600 de
 * bucăți la 0,019 lei bucata.
 */
function packMultiplier(title) {
  const re = /(?:^|[\s(\-–])(\d{1,3})\s*x\s/gi;
  let mm;
  while ((mm = re.exec(title)) !== null) {
    const after = title.slice(re.lastIndex);
    if (/^\s*\d{1,3}\s*cm\b/i.test(after)) continue;   // „60 X 90 cm" — dimensiune
    if (/^\s*(?:x?large|mini|midi|maxi|junior|extra)\b/i.test(after)
        && /m[ăa]rim/i.test(title.slice(0, mm.index + 12))) continue; // „mărime 6X Large"
    const k = Number(mm[1]);
    if (k > 1 && k <= 100) return k;
  }
  return 1;
}

/** Descrierea pachetului, când titlul chiar spune „12 x 100 Buc". */
function packDesc(title) {
  const k = packMultiplier(title);
  const u = title.match(/(\d{1,4})\s*(?:buc[ăa]?[tț]i|bucati|buc)\b/i);
  if (k <= 1 || !u) return null;
  return `${k} × ${Number(u[1])} bucăți`;
}

/**
 * Mărimea de scutec pentru bebeluși. Catalogul o scrie în trei feluri —
 * „mărime 4", „Nr. 4" și „4 Maxi" / „6X Large" — iar prima formă singură
 * acoperea doar 32 din 85 de produse din colecția principală.
 */
function babySize(title) {
  let m = title.match(/m[ăa]rime[a]?\s*(\d)\b/i);
  if (m) return Number(m[1]);
  m = title.match(/\bnr\.?\s*(\d)\b/i);
  if (m) return Number(m[1]);
  m = title.match(/\b(\d)\s*x{0,2}\s*(?:large|mini|midi|maxi|junior|extra)\b/i);
  if (m) return Number(m[1]);
  return null;
}

/**
 * Mărimea-literă pentru scutecele de adulți — a doua taxonomie a catalogului.
 * Acoperă 51 din 61 de produse din colecția de incontinență.
 */
function adultSize(title) {
  const m = title.match(/\b(XS\/S|S\/M|L\/XL|XXXL|XXL|XL|XS|S|M|L)\b(?=[\s,\-–]|$)/);
  if (!m) return null;
  const v = m[1].toUpperCase();
  /* O literă singură înseamnă mărime doar în context: pe scutece, slip-uri și
     chiloți. Pe aleze, păturici sau absorbante urologice, aceleași litere sunt
     nume de produs („Maxi", „Extra") sau parte din cod. */
  if ((v === 'M' || v === 'S' || v === 'L')
      && !/scutec|slip|chilot|m[ăa]rime|talie|\d{2,3}\s*[-–]\s*\d{2,3}\s*cm/i.test(title)) return null;
  return v;
}

/** Absorbția în picături, pentru incontinență: „7.5 Picături" */
function drops(title) {
  const m = title.match(/(\d+(?:[.,]\d+)?)\s*pic(?:[ăa]turi|\.?)\b/i);
  return m ? Number(m[1].replace(',', '.')) : null;
}

/** Talia în cm: „120-160 cm" */
function waist(title) {
  const m = title.match(/(\d{2,3})\s*[-–]\s*(\d{2,3})\s*cm/i);
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
}

/**
 * 14 zile, nu 60. În catalogul real 397 de produse au fost publicate în ultimele
 * 30 de zile (o republicare în masă), deci un prag larg ar pune „Nou" pe o treime
 * din magazin — un badge care apare peste tot nu mai informează pe nimeni.
 * La 14 zile rămân 89 de produse (7%), ceea ce înseamnă ceva.
 */
const NEW_DAYS = 14;
/* Ancorat la data snapshotului, nu la Date.now(): altfel fațeta „Nou" se stinge
   singură între momentul în care o desenăm și momentul în care o vede clientul.
   Măsurat: 89 de produse la 20 august, 54 azi. */
const meta = JSON.parse(readFileSync(resolve('data/_meta.json'), 'utf8'));
const now = Date.parse(meta.fetchedAt);

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
    packDesc: packDesc(p.title),
    facets: {
      size: babySize(p.title),
      /* Cele două taxonomii se exclud: „Nr. 4 … + Magics L" e scutec de bebeluș
         mărimea 4, nu și mărimea L. Litera contează doar unde nu există cifră. */
      adultSize: babySize(p.title) ? null : adultSize(p.title),
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
      description: c.description || '',
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
