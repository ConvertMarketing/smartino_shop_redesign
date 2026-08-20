# CLAUDE.md — Smartino Shop Redesign

Reguli persistente pentru acest repo. Lucrez de pe două calculatoare — aceste reguli
sunt sursa de adevăr, indiferent de sesiune.

## Contextul proiectului

Redesign pentru **smartinoshop.ro** (Shopify, temă actuală **Halo**).
Redesign-ul final se implementează pe tema **Ella** (Halothemes).

Înainte de a atinge Shopify, construim un **prototip static HTML/CSS/JS** publicat pe
GitHub Pages, care arată exact cum va arăta magazinul pe Ella.

**Rolul prototipului:** validăm designul cu clientul și avem un reper 1:1 la implementare.

**Ella e baza de la care pornim, nu o limită.** Putem construi secțiuni noi sau modifica
secțiunile existente din temă. **Designul primează.** Nu modificăm designul ca să încapă
în Ella — dar documentăm efortul de implementare pentru fiecare componentă.

## Faze

- **Faza 0 — Documentare.** Cercetare brand + date reale + Ella + referințe →
  `docs/design-brief.md`. **STOP** și așteptăm aprobarea clientului înainte de a coda.
- **Faza 1 — Prototip.** Home, Colecție (PLP), Produs (PDP), Cart drawer + pagină coș,
  Căutare predictivă, Header/Footer.
- **Faza 2 — Publicare.** GitHub Pages via GitHub Actions.

**Fără** checkout, cont client sau blog.

## Stack

- HTML / CSS / JS **fără framework UI** — nu React, nu Vue. Totul trebuie portat în Liquid.
- Generator de pagini din JSON permis: **Vite** sau **11ty**.
- **CSS custom properties.** Fără Tailwind, fără Bootstrap.
- Fără dependențe grele. Un carusel ușor (**Swiper**) e ok.

## Date

- Date reale, din endpoint-urile publice Shopify:
  - `https://smartinoshop.ro/products.json?limit=250&page=N`
  - `https://smartinoshop.ro/collections.json`
  - `https://smartinoshop.ro/collections/{handle}/products.json`
- Se salvează în `data/products.json` și `data/collections.json`
  (titlu, handle, preț, compare_at_price, imagini CDN, vendor, tags, descriere, variante).
- **NU inventa produse, prețuri sau texte.** Niciodată. Dacă o dată lipsește,
  se marchează explicit ca lipsă și se cere clientului — nu se completează din imaginație.
- Imaginile se servesc de pe CDN-ul Shopify, cu `srcset` (parametrul `width`).

## Reguli de design

- **Mobile-first** — majoritatea traficului e mobil.
- Să arate ca un **retailer real**, nu ca un template.
- De evitat, explicit:
  - gradiente violete
  - iconițe emoji
  - lorem ipsum
  - carduri cu umbre generice
  - hero-uri simetrice plictisitoare
- De urmărit: o pereche de fonturi aleasă conștient, grid strict, fotografia de produs
  în prim-plan, micro-interacțiuni subtile.
- Consistent cu identitatea Smartino extrasă în Faza 0.

## Conversie (standard Baymard / Shopify best practices)

- **Header** sticky, căutare proeminentă, mega-menu pe categorii, coș vizibil cu total.
- **Bară de anunț:** livrare gratuită / cadou la 500 lei (regula reală existentă pe site).
- **Home:** hero cu ofertă clară + CTA, categorii principale, bestsellers, oferte,
  recenzii, USP-uri, newsletter.
- **Card produs:** a doua imagine la hover, preț vechi tăiat + procent reducere,
  badge-uri (Nou / −X% / Stoc limitat), rating, quick add, variante de culoare pe card.
- **PLP:** filtre laterale (drawer pe mobil), sortare, număr rezultate, breadcrumbs, load more.
- **PDP:** galerie cu zoom + thumbnails, preț + economie clară, selector variante,
  stoc/urgency **onestă**, buton sticky „Adaugă în coș" pe mobil, livrare & retur lângă
  buton, recenzii, „cumpărate împreună", descriere în acordeon, FAQ.
- **Coș:** drawer cu bară de progres spre cadou/livrare gratuită, upsell,
  estimare livrare, CTA clar.
- **Trust:** metode de plată, retur 14 zile, ANPC/SOL în footer, contact vizibil.

## Performanță

- Lazy-loading, `srcset` de pe CDN Shopify.
- **LCP < 2,5 s**, **fără CLS**.

## Accesibilitate

- Contrast, focus states, `alt` pe imagini, navigare completă din tastatură.

## Publicare

- Deploy automat pe GitHub Pages prin GitHub Actions la push pe `main`.
- `<meta name="robots" content="noindex,nofollow">` pe **toate** paginile — e preview.
- README cu link-ul de preview și instrucțiuni de rulare locală.

## Mod de lucru

- Commit-uri **mici și descriptive**.
- Branch de dezvoltare: `claude/smartinoshop-redesign-prototype-5goztk`.
- După fiecare pagină: **screenshot desktop (1440) și mobil (390)**, privit critic,
  corectat — **înainte** de a i-l arăta clientului.
- După fiecare pagină: commit, push, și spun explicit ce trebuie verificat pe preview.
  **Nu trec la pagina următoare până nu confirmă clientul.**
- `docs/ella-mapping.md` se ține **la zi**: pentru fiecare componentă din prototip —
  `nativ` / `secțiune modificată` / `secțiune nouă` + estimare de efort (**S/M/L**).

## Note de mediu (sesiuni Claude Code pe web)

- Egress-ul de rețea e restricționat în sesiunile remote: `smartinoshop.ro`,
  `smartinohome.ro`, `halothemes.com` și majoritatea site-urilor externe sunt **blocate**.
  `cdn.shopify.com` și registry-ul npm **sunt** accesibile.
- Consecință: `products.json` / `collections.json` **nu pot fi descărcate din sesiune**.
  Datele reale trebuie furnizate în repo (commit în `data/`) sau sesiunea trebuie rulată
  într-un environment cu domeniul permis.
- Nu există server Playwright MCP în sesiune, dar **Chromium + Playwright sunt instalate
  local** (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). Screenshot-urile se fac prin
  script Playwright local (`scripts/shots.mjs`), nu prin MCP. Nu rula `playwright install`.
