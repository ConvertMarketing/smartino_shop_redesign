#!/usr/bin/env node
/**
 * Screenshot desktop (1440) + mobil (390) pentru paginile prototipului.
 *
 * Rulare:
 *   node scripts/shots.mjs                      # toate paginile din dist/
 *   node scripts/shots.mjs /collections/scutece-copii
 *
 * Necesită un server local pe BASE (implicit http://localhost:8080).
 * Screenshot-urile ajung în shots/ (ignorat de git).
 *
 * Chromium e preinstalat în sesiunile Claude Code pe web
 * (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers). NU rula `playwright install`.
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'shots');
const BASE = process.env.BASE || 'http://localhost:8080';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const DEFAULT_ROUTES = [
  '/',
  '/collections/scutece-copii',
  '/collections/produse-incontinenta',
  '/cart',
];

/** Găsește binarul Chromium preinstalat, dacă există. */
function findChromium() {
  const candidates = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
  ];
  return candidates.find((p) => existsSync(p));
}

const slug = (route) => (route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

async function main() {
  const routes = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROUTES;
  await mkdir(OUT, { recursive: true });

  const executablePath = findChromium();
  // Chromium nu citește HTTPS_PROXY singur. Fără asta, imaginile de pe
  // cdn.shopify.com nu se încarcă în screenshot, deși pentru un utilizator real
  // funcționează perfect.
  const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    // bypass pentru local: proxy-ul acceptă doar tuneluri HTTPS CONNECT, iar
    // serverul de preview e HTTP simplu pe localhost.
    ...(proxyServer
      ? { proxy: { server: proxyServer, bypass: 'localhost,127.0.0.1,::1' } }
      : {}),
    ignoreHTTPSErrors: true,
  });

  let failures = 0;

  for (const route of routes) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        ignoreHTTPSErrors: true,
      });
      const page = await ctx.newPage();

      // Proxy-ul de egress resetează conexiuni când browserul cere zeci de
      // imagini deodată (secvențial merge 10/10). Le reîncercăm la nivel de
      // rețea, ca screenshot-ul să arate designul real, nu găuri albe.
      await page.route('**://cdn.shopify.com/**', async (route) => {
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            const res = await route.fetch({ timeout: 20000 });
            if (res.ok()) return await route.fulfill({ response: res });
          } catch { /* reîncercăm */ }
          await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        }
        return route.abort();
      });

      const url = BASE + route;
      try {
        // 'load', nu 'networkidle': serverul de dev ține un websocket de live-reload
        // deschis, deci networkidle nu se atinge niciodată.
        const res = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        if (res && !res.ok()) throw new Error(`HTTP ${res.status()}`);
        await page.evaluate(() => document.fonts.ready);
        // lăsăm imaginile lazy de sub fold să intre înainte de fullPage
        await page.evaluate(async () => {
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((r) => setTimeout(r, 600));
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(700);

        const fontsLoaded = await page.evaluate(
          () =>
            document.fonts.check('700 1rem Quicksand') &&
            document.fonts.check('400 1rem Inter'),
        );
        if (!fontsLoaded) console.warn('    (fonturi neîncărcate — screenshot cu fallback)');

        const file = `${OUT}/${slug(route)}-${vp.name}.png`;
        await page.screenshot({ path: file, fullPage: true });

        // Verificări pe care merită să le vezi înainte de a te uita la imagine.
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        // alt="" e corect pentru imagini decorative (a doua imagine la hover,
        // thumbnail lângă o etichetă text). Semnalăm doar atributul LIPSĂ.
        const noAlt = await page.evaluate(
          () => [...document.images].filter((i) => !i.hasAttribute('alt')).length,
        );
        const flags = [
          overflow ? 'SCROLL ORIZONTAL' : null,
          noAlt ? `${noAlt} imagini fără alt` : null,
        ].filter(Boolean);

        console.log(
          `  ${vp.name.padEnd(7)} ${route.padEnd(34)} ${flags.length ? '⚠ ' + flags.join(' · ') : 'ok'}`,
        );
        if (flags.length) failures++;
      } catch (err) {
        console.error(`  ${vp.name.padEnd(7)} ${route.padEnd(34)} EROARE: ${err.message}`);
        failures++;
      }
      await ctx.close();
    }
  }

  await browser.close();
  console.log(`\nScreenshot-uri în shots/${failures ? ` — ${failures} avertismente` : ''}`);
}

main().catch((err) => {
  console.error(`\nEroare: ${err.message}`);
  console.error(`Rulează un server pe ${BASE} întâi (ex. npx serve dist).`);
  process.exit(1);
});
