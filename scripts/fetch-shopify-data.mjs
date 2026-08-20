#!/usr/bin/env node
/**
 * Descarcă datele publice din magazinul Shopify și le salvează în data/.
 *
 * Rulare (de pe un calculator care are acces la smartinoshop.ro):
 *   node scripts/fetch-shopify-data.mjs
 *
 * Produce:
 *   data/products.json     — toate produsele (paginat, limit=250)
 *   data/collections.json  — toate colecțiile
 *   data/collection-products.json — handle colecție -> listă de handle-uri produse
 *   data/_meta.json        — când a fost descărcat și de unde
 *
 * Nu inventează nimic: ce nu vine de la API nu ajunge în fișiere.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHOP = process.env.SHOP_ORIGIN || 'https://smartinoshop.ro';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'data');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, attempt = 1) {
  const res = await fetch(url, {
    headers: { 'accept': 'application/json', 'user-agent': 'smartino-redesign-prototype/1.0' },
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt > 4) throw new Error(`${res.status} după 4 încercări: ${url}`);
    const wait = 2 ** attempt * 1000;
    console.warn(`  ${res.status} — reîncerc în ${wait / 1000}s…`);
    await sleep(wait);
    return getJSON(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; page <= 40; page++) {
    const url = `${SHOP}/products.json?limit=250&page=${page}`;
    process.stdout.write(`Produse — pagina ${page}… `);
    const { products } = await getJSON(url);
    console.log(`${products.length}`);
    if (!products.length) break;
    all.push(...products);
    if (products.length < 250) break;
    await sleep(400);
  }
  return all;
}

async function fetchAllCollections() {
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${SHOP}/collections.json?limit=250&page=${page}`;
    process.stdout.write(`Colecții — pagina ${page}… `);
    const { collections } = await getJSON(url);
    console.log(`${collections.length}`);
    if (!collections.length) break;
    all.push(...collections);
    if (collections.length < 250) break;
    await sleep(400);
  }
  return all;
}

async function fetchCollectionProducts(collections) {
  const map = {};
  for (const c of collections) {
    const handles = [];
    for (let page = 1; page <= 20; page++) {
      const url = `${SHOP}/collections/${c.handle}/products.json?limit=250&page=${page}`;
      let data;
      try {
        data = await getJSON(url);
      } catch (err) {
        console.warn(`  ! ${c.handle}: ${err.message}`);
        break;
      }
      const products = data.products || [];
      handles.push(...products.map((p) => p.handle));
      if (products.length < 250) break;
      await sleep(300);
    }
    map[c.handle] = handles;
    console.log(`  ${c.handle}: ${handles.length} produse`);
    await sleep(250);
  }
  return map;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`Sursă: ${SHOP}\n`);

  const products = await fetchAllProducts();
  const collections = await fetchAllCollections();
  console.log(`\nMapez produsele pe colecții…`);
  const collectionProducts = await fetchCollectionProducts(collections);

  await writeFile(`${OUT}/products.json`, JSON.stringify(products, null, 2));
  await writeFile(`${OUT}/collections.json`, JSON.stringify(collections, null, 2));
  await writeFile(`${OUT}/collection-products.json`, JSON.stringify(collectionProducts, null, 2));
  await writeFile(`${OUT}/_meta.json`, JSON.stringify({
    source: SHOP,
    fetchedAt: new Date().toISOString(),
    counts: {
      products: products.length,
      collections: collections.length,
    },
  }, null, 2));

  console.log(`\nGata: ${products.length} produse, ${collections.length} colecții → data/`);
  console.log(`Commit: git add data && git commit -m "data: snapshot catalog smartinoshop"`);
}

main().catch((err) => {
  console.error(`\nEroare: ${err.message}`);
  process.exit(1);
});
