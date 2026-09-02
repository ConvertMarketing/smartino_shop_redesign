#!/usr/bin/env node
/**
 * Screenshot desktop (1440) + mobil (390) pentru o temă de preview de pe
 * magazinul REAL, nu din prototip. Definiția de „gata" din docs/mod-de-lucru.md
 * cere exact asta.
 *
 *   node scripts/shots-shopify.mjs <preview_theme_id> [/cale] [/alta-cale ...]
 *
 * Ieșirea: shots/shopify-<id>-<slug>-<viewport>.png
 * Chromium e preinstalat; NU rula `playwright install`.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'shots');
const STORE = process.env.STORE || 'https://smartinoshop.ro';
const [themeId, ...paths] = process.argv.slice(2);
if (!themeId) { console.error('Lipsește preview_theme_id.'); process.exit(2); }
const routes = paths.length ? paths : ['/'];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const slug = (r) => (r === '/' ? 'home' : r.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

function findChromium() {
  for (const c of ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome']) if (existsSync(c)) return c;
  return undefined;
}

await mkdir(OUT, { recursive: true });
const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: findChromium(),
  ...(proxyServer ? { proxy: { server: proxyServer, bypass: 'localhost,127.0.0.1,::1' } } : {}),
  ignoreHTTPSErrors: true,
});

let failures = 0;
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
    ignoreHTTPSErrors: true,
    locale: 'ro-RO',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  // Chromium nu trece prin proxy-ul sesiunii (connection reset), dar fetch-ul
  // din Node da. Toate request-urile se fac din Node si se livreaza paginii.
  await page.route('**/*', async (route) => {
    for (let i = 0; i < 3; i += 1) {
      try {
        const res = await route.fetch({ timeout: 30000, maxRedirects: 10 });
        return await route.fulfill({ response: res });
      } catch (e) {
        if (i === 2) return route.abort();
      }
    }
    return route.abort();
  });

  // Primul request cu ?preview_theme_id setează cookie-ul de preview; restul
  // rutelor din același context îl moștenesc.
  for (const route of routes) {
    const sep = route.includes('?') ? '&' : '?';
    const url = `${STORE}${route}${sep}preview_theme_id=${themeId}`;
    try {
      // Nu 'networkidle': pagina de colecție ține request-uri deschise (recently
      // viewed, recomandări) și nu ajunge niciodată la liniște.
      const res = await page.goto(url, { waitUntil: 'load', timeout: 90000 });
      // Bara de preview a Shopify e injectată în pagină; o ascundem ca să nu
      // acopere header-ul în screenshot.
      await page.addStyleTag({ content: '#preview-bar-iframe, .shopify-preview-bar { display:none !important }' });
      // Ella încarcă secțiunile și imaginile la scroll (IntersectionObserver).
      // Fără o derulare completă, tot ce e sub fold rămâne alb în captură.
      await page.evaluate(async () => {
        const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1200);
      // Două capturi: primul ecran (lizibil la review) și pagina întreagă.
      const base = `${OUT}/shopify-${themeId}-${slug(route)}-${vp.name}`;
      await page.screenshot({ path: `${base}-fold.png`, fullPage: false });
      await page.screenshot({ path: `${base}.png`, fullPage: true });
      console.log(`${res?.status()} ${vp.name} ${route} → ${base}-fold.png + full`);
    } catch (e) {
      failures += 1;
      console.error(`EȘEC ${vp.name} ${route}: ${e.message.split('\n')[0]}`);
    }
  }
  if (errors.length) console.log(`  erori JS (${vp.name}):`, errors.slice(0, 5));
  await ctx.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
