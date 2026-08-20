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
  const browser = await chromium.launch(executablePath ? { executablePath } : {});

  let failures = 0;

  for (const route of routes) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      const url = BASE + route;
      try {
        const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        if (res && !res.ok()) throw new Error(`HTTP ${res.status()}`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);

        const file = `${OUT}/${slug(route)}-${vp.name}.png`;
        await page.screenshot({ path: file, fullPage: true });

        // Verificări pe care merită să le vezi înainte de a te uita la imagine.
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        const noAlt = await page.evaluate(
          () => [...document.images].filter((i) => !i.alt).length,
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
