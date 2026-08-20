# Smartino Shop — prototip redesign

Prototip static care arată cum va arăta **smartinoshop.ro** după redesign, înainte de
a atinge Shopify. Rolul lui: validăm designul cu clientul și avem un reper 1:1 la
implementarea pe tema **Ella**.

**Preview:** https://convertmarketing.github.io/smartino_shop_redesign/

> Preview intern. Toate paginile au `<meta name="robots" content="noindex,nofollow">`.
> Fără checkout, cont client sau blog.

---

## Ce e gata

| | Stare |
| --- | --- |
| Header sticky + mega-menu | ✅ |
| Bară de anunț (200 lei) | ✅ |
| Căutare predictivă (din JSON local) | ✅ |
| Cart drawer + bară progres livrare gratuită | ✅ |
| Home | ✅ |
| Footer + conformitate ANPC | ✅ |
| Colecție (PLP) cu filtre și sortare | în lucru |
| Produs (PDP) | în lucru |
| Pagină coș | în lucru |

## Rulare locală

```bash
npm install
npm run dev     # http://localhost:8080
```

Alte comenzi:

```bash
npm run build   # generează dist/
npm run shots   # screenshot desktop 1440 + mobil 390 în shots/
```

## Datele

Catalog real, extras din endpoint-urile publice Shopify — **1203 produse, 204
colecții**. Nu există produse, prețuri sau texte inventate.

```bash
node scripts/fetch-shopify-data.mjs
```

Scrie în `data/`: `products.json`, `collections.json`, `collection-products.json`
și `_meta.json` (sursa și momentul extragerii).

> **Notă:** endpoint-urile JSON răspund pe `www.smartinoshop.ro`; paginile HTML
> redirecționează spre domeniul fără `www`. Dacă rulezi dintr-un mediu cu egress
> restricționat, folosește `SHOP_ORIGIN=https://www.smartinoshop.ro`.

Imaginile se servesc de pe CDN-ul Shopify, cu `srcset` pe parametrul `width`.
CDN-ul livrează automat **WebP** prin negociere de conținut — un PNG de 361 KB
ajunge la 45 KB în browser.

## Stack

- **11ty** cu template-uri **Liquid** — alese special: 11ty randează nativ Liquid,
  deci template-urile de aici sunt aproape drop-in pentru secțiunile Shopify.
- CSS custom properties, fără Tailwind/Bootstrap, fără framework UI.
- Zero dependențe de runtime. JS-ul e vanilla și portabil în tema Shopify.

## Structura

```
data/                 catalog real (JSON)
docs/
  design-brief.md     analiza brandului, direcția vizuală, conversie, referințe
  ella-mapping.md     nativ / secțiune modificată / secțiune nouă + efort S/M/L
  brand/              logo și tokens recuperate din tema grupului
scripts/
  fetch-shopify-data.mjs
  shots.mjs           screenshot desktop + mobil, cu verificări
src/
  _data/              catalog.js (normalizare), nav.js (meniu din colecții reale)
  _includes/          layout + componente Liquid
  assets/css/         tokens.css, base.css, components.css, home.css
```

## Branding

Turcoazul real Smartino, **`#15B7C6`**, recuperat din tema grupului.

Contrastul e calculat, nu estimat: turcoazul pe alb dă **2,44:1**, deci nu se
folosește ca text sau bordură pe fundal deschis. Ca **suprafață cu text `#232323`**
dă **6,45:1** și trece AA — de aceea butonul principal păstrează culoarea exactă a
brandului, cu text închis.

Detalii în `docs/design-brief.md` §3.

## Documentație

- **`docs/design-brief.md`** — analiza brandului, direcția vizuală, sitemap,
  practicile de conversie, referințele (eMAG / Baymard / magazine premium) și
  lista de necunoscute.
- **`docs/ella-mapping.md`** — pentru fiecare componentă: nativ / secțiune
  modificată / secțiune nouă, plus estimare de efort S/M/L.

## Deploy

Automat pe GitHub Pages prin GitHub Actions, la push pe `main` și pe branch-ul de
dezvoltare. Site de proiect, deci build-ul primește `PATH_PREFIX=/<nume-repo>/`.
