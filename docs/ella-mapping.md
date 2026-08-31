# Ella Mapping — clasificare și efort de implementare

Pentru fiecare componentă din prototip: se face din setările Ella, prin modificarea
unei secțiuni existente, sau printr-o secțiune nouă în Liquid — plus o estimare de efort.

**Ținut la zi pe măsură ce construim prototipul.** Regula din `CLAUDE.md`:
*nu modificăm designul ca să încapă în Ella.* Documentul ăsta măsoară costul, nu
restrânge designul.

**Ultima actualizare:** 20 august 2026 · **Status:** v1, înainte de a începe codarea

---

## 0. Cum să citești documentul

| Clasificare | Înseamnă |
| --- | --- |
| **nativ** | Ella livrează funcția; se configurează din theme settings / blocuri de secțiune |
| **secțiune modificată** | Ella are ceva apropiat; necesită editare de Liquid pe o secțiune existentă |
| **secțiune nouă** | Trebuie construită ca secțiune Liquid nouă |
| **necunoscut** | Documentația publică nu stabilește suportul — de verificat în theme editor |

| Efort | Ordin de mărime |
| --- | --- |
| **S** | configurare, sub ~2h |
| **M** | Liquid + CSS pe o secțiune existentă, ~0,5–2 zile |
| **L** | secțiune nouă sau setup de date complex, 2+ zile |

### Limitele acestei versiuni

Sursa e **documentația publică Ella** (`halosoft.gitbook.io/ella-documentation` pentru
Ella 6 și `.../ella-7-documentation` pentru Ella 7), citită prin **conținut indexat de
căutare** — egress-ul sesiunii blochează `halothemes.com`, `halosoft.gitbook.io` și
`themeforest.net`, deci nicio pagină nu a fost deschisă direct.

Nu am avut acces la sursa temei. Când primesc `sections/`, `snippets/` și
`config/settings_schema.json`, documentul se rescrie pe cod, nu pe documentație —
și atunci rândurile „necunoscut" din §4 dispar.

---

## 1. ⚠️ Întrebare care trebuie lămurită înainte de estimare: Ella 6 sau Ella 7?

**Sunt două produse diferite, cu documentații separate și fără upgrade automat.**

| | Ella 6.x | Ella 7.x |
| --- | --- | --- |
| Arhitectură | Shopify **OS 2.0**, secțiuni | **OS 3.0 / Theme Blocks**, „Flex Section" |
| Header | `Header > Header For Desktop`, ~26 layout-uri de header importabile ca JSON | **Header Group** cu `Header Section` + header blocks |
| Mega-menu | „Advanced Mega Menu", până la 8 layout-uri | blocuri `Mega menu style #1/#2/#3`, 2–6 coloane |
| Custom Liquid | secțiune dedicată | bloc **„disponibil peste tot"** (de verificat) |
| Migrare 6 → 7 | — | **fără upgrade automat; paginile se reconstruiesc manual** |

Toate căile de setări din tabelele de mai jos sunt scrise majoritar pe arborele **6.x**.

**Ce înseamnă concret pentru noi:** dacă ținta e Ella 7, blocul Custom Liquid disponibil
peste tot ar face mai ieftine exact rândurile care acum sunt „secțiune modificată" —
în special footer-ul ANPC (§3.7) și eticheta de procent (§3.4). Merită confirmat
înainte de a bugeta implementarea.

---

## 2. Rezumat

Din **62 de rânduri de componentă** în tabelele din §3:

| Clasificare | Rânduri |
| --- | --- |
| **nativ**, direct | 47 |
| **nativ, cu rezerve** — asamblat din secțiuni, doar stratul de afișare, prin workaround, sau cu setup greu | 7 |
| **secțiune modificată** | 6 |
| **secțiune nouă** | 1 |
| **necunoscut** (rând întreg) | 1 |

Separat, **13 puncte de comportament** rămân de verificat în theme editor (§4).

Vestea bună: **Ella acoperă nativ majoritatea listei de conversie din brief** —
inclusiv bara de progres spre livrarea gratuită, a doua imagine la hover, badge-urile,
quick add, swatch-urile pe card, sticky add-to-cart pe mobil și alerta de stoc pe
inventar real.

Efortul real se concentrează în trei locuri: **prețul pe unitate** (§3.4), **pachetele
promo** (§3.6) și **fidelitatea vizuală** — vezi avertismentul din §5.

---

## 3. Componente

### 3.1 Global

| # | Componentă | Clasificare | Efort | Corespondent Ella | Note |
| --- | --- | --- | --- | --- | --- |
| G1 | Bară de anunț (200 lei) | **nativ** | S | secțiunea `Announcement Bar` (în Ella 7, în Header Group) | text plain sau **HTML brut**, padding 0–50px, `Layout = Slider` cu săgeți la ≥2 mesaje, icon de închidere opțional, countdown opțional |
| G2 | Header sticky | **nativ** | S | „Sticky Header & Sticky Add to Cart" | funcția e listată; **numele/locul exact al setării = necunoscut** |
| G3a | **Rail vertical de categorii (desktop)** | **nativ** | M | `Header Nav – vertical menu` — folosit de layout-ul demo „Home 06 SuperMarket" | Ella livrează exact tiparul: sursă meniu, stil, titlu de bloc, separatoare, lățime buton, rază. Cele 12 categorii cu flyout pe coloane se construiesc din Navigation + Advanced Mega Menu |
| G3b | Flyout cu subcategorii | **nativ** | M | „Advanced Mega Menu" (6) / `Mega menu style #1–3` (7) | 2–6 coloane, banner promo în meniu, 1–4 produse dintr-o colecție. **Numărul de produse per subcategorie nu e documentat** — probabil Liquid (`collection.products_count`) |
| G4a | **Bară de navigație jos (mobil)** | **nativ** | S | `Sticky Toolbar Mobile` (în Ella 7, în grupul Popup) | patru destinații; insigna de coș se leagă de `cart.item_count` |
| G4b | Drawer de categorii pe mobil | **nativ** | S | Header for Mobile | deschis din tab-ul „Categorii" al barei de jos |
| G5 | Căutare predictivă | **nativ** | S | `Quick Search` (Theme settings) | pe Shopify Predictive Search API; setări: activare, nr. max produse, doar produse vs. + articole/pagini |
| G6 | Cart drawer | **nativ** | S | `Quick Cart / Quick Edit Cart` | plus notă comandă, gift wrap, calculator transport, „You may also like" |
| G6b | **Bară progres livrare gratuită** | **nativ** | S | `Free Shipping Calculator Message` | prag configurabil, înălțime bară, afișare %, icon camion animat. **Se setează pe 200 lei.** |
| G7 | Footer | **nativ** parțial | S | `Social With Payment` + `Footer Bottom` | iconițe de plată native. Pentru ANPC vezi §3.7 |
| G8 | Bară USP | **nativ** | S | `Custom Service Block` | SVG brut per iconiță, dimensiune, culoare, text — potrivit exact pentru „fără emoji" |

### 3.2 Home

| # | Componentă | Clasificare | Efort | Corespondent Ella |
| --- | --- | --- | --- | --- |
| H1 | Hero | **nativ** | S | `Slideshow` / `Image Banner` |
| H2 | Tile-uri categorii | **nativ** | S | `Collection List` (grid sau slider) |
| H3 | Bară USP | **nativ** | S | `Custom Service Block` |
| H4 | Carusel bestsellers | **nativ** | S | `Product Block` / `Featured Collection` / `Spotlight Products` — coloane separate desktop/tabletă/mobil |
| H5 | Rând „Reduceri" | **nativ** (asamblat) | S–M | `Product Block` pe colecția `reduceri` + `Countdown` + badge Sale automat pe `compare_at_price`. **Nu există secțiune „Deal of the Day".** |
| H6 | Bloc „Importator oficial" | **nativ** | S | `Custom Service Block` sau `Image Banner` cu logo-urile brandurilor |
| H7 | Bloc recenzii (medie + distribuție + 6 recenzii) | **secțiune nouă** | M | `Customer Review` din Ella e doar un carusel de testimoniale statice: **nu are medie agregată, nici barele de distribuție pe stele**. Blocul din prototip se construiește ca secțiune proprie, alimentată din Judge.me. **Ella nu are motor de recenzii.** Vezi nota de sub tabel |
| H8 | Bloc magazine fizice | **nativ** | S | `Image Banner` + `Custom Liquid`, sau secțiune de tip store-locator dacă există |
| H9 | Newsletter | **nativ** | S | `Newsletter` + `Newsletter With Countdown` + popup |

> **⚠️ Recenziile din prototip sunt date FABRICATE.** Notele, numărul de recenzii,
> numele și textele vin din `src/_data/reviews.js`, generate determinist — cerute
> explicit de client ca să se vadă cum arată secțiunea. **Nicio recenzie nu e reală.**
> În prototip sunt marcate vizibil cu eticheta „date demonstrative" (flag-ul `DEMO`).
>
> **La implementare:** fișierul `src/_data/reviews.js` **se șterge integral**, iar
> sursa devine Judge.me. Nu se portează nimic din el în temă. Locurile care consumă
> datele — și care trebuie rescrise pe Judge.me — sunt trei: blocul de pe home (H7),
> slotul de rating de pe cardul de produs (C5) și tab-ul „Recenzii" de pe PDP (D13).
> Odată cu ele dispar `.demo-tag` din `components.css` și filtrul `nr` din
> `eleventy.config.js`.

### 3.3 Card produs

| # | Componentă | Clasificare | Efort | Corespondent Ella |
| --- | --- | --- | --- | --- |
| C1 | A doua imagine la hover | **nativ** | S | `Product image swap` (Theme settings → Product card). Există și `product video swap` |
| C2a | Preț tăiat + „economisești" | **nativ** | S | General → `Saved price` — afișează suma economisită față de `compare_at_price` |
| C2b | **Badge „−X%" (procent)** | **secțiune modificată** | M | Badge-ul Sale se declanșează automat pe `compare_at_price`, dar **nicio sursă nu confirmă că eticheta poate randa procentul calculat**. Dacă vrem chip-ul „−30%", presupunem editare de Liquid pe snippet-ul de badge. **Formula contează** — vezi §3.4b |
| C3 | **Preț pe unitate (lei/bucată)** | **secțiune modificată** | M | **Nu există nativ.** Vezi §3.4 — e cea mai importantă adăugare pentru acest catalog |
| C4 | Badge-uri Nou / Stoc limitat / Custom | **nativ** | S | `Product Badges / Labels`: Sold out (auto la qty 0), Sale (auto), New (dinamic după vechime **sau** manual prin tag `new`), Bundle, Custom (global sau per produs). Poziție stânga/dreapta + offset |
| C5 | Rating pe card | **nativ** ca afișare; datele vin din app | S / M | Stilizare expusă (mărime stea, culoare, poziție). Motorul e Judge.me. În prototip datele sunt simulate — vezi nota de sub §3.2. Slotul își păstrează înălțimea și când produsul n-are recenzii, ca grila să nu sară |
| C6 | Quick add | **nativ** | S | `Quick Shop` + `Product Action → Show action button`; comportament după adăugare din General → `Add to cart action` |
| C7 | Swatch-uri de variante pe card | **nativ** | S–M | `Product Swatch` (afișare + mărime separată desktop/mobil). Definiții la General → `Swatch / Customization Option`; culorile non-bazice cer un PNG în Content → Files, numit `nume-culoare.png` |

### 3.4 ⭐ Prețul pe unitate — componenta cu cel mai bun raport valoare/efort

**Clasificare: secțiune modificată · Efort: M (card) + S (PDP)**

Nu există nativ în Ella și nu apare în nicio documentație. Trebuie construit.

De ce merită efortul, pe scurt: fiecare titlu din catalog se termină în „X bucăți", iar
același produs se vinde în pachete de 20/28/30/40/68/80 **[confirmat]**. Fără preț pe
bucată, clientul **nu poate compara** — exact comparația pe care se sprijină
poziționarea pe preț a brandului.

**Implementare recomandată la Ella:**

1. **Sursa numărului de bucăți:** un **metafield de produs** (ex. `custom.units_per_pack`,
   Integer). *Nu* parsarea titlului — merge în prototip, dar e fragilă în producție și
   se rupe la prima redenumire.
2. **Randare:** edit pe snippet-ul de preț din product card + blocul de preț de pe PDP.
   Atenție, formula evidentă e greșită pe două planuri: `divided_by` cu doi întregi face
   **împărțire trunchiată**, iar `product.price` e în **bani, nu în lei**. Varianta corectă:

   ```liquid
   {%- assign v = product.selected_or_first_available_variant -%}
   {%- assign units = product.metafields.custom.units_per_pack.value -%}
   {%- if units and units > 1 -%}
     {%- assign unit_price = v.price | times: 1.0 | divided_by: units -%}
     <p class="pc-unit">{{ unit_price | money }} /
       <span class="u-long">bucată</span><span class="u-short">buc</span>
       <span class="pack"> · {{ units }} buc</span></p>
   {%- else -%}
     <p class="pc-unit"></p>
   {%- endif -%}
   ```

   `times: 1.0` forțează aritmetica în virgulă mobilă; `money` face conversia bani → lei
   și formatarea locală. Ramura goală nu e opțională — fără ea, cardurile fără pachet au
   footerul mai scurt cu 20 px și grila se decalează (vezi §3.3 C3).
3. **Efort real:** M — populat metafield-ul e o operație de date pe catalog (se poate
   face în bulk din Matrixify/CSV), nu de front-end.

**Beneficiu secundar:** același metafield permite mai târziu sortarea PLP după „preț pe
bucată", care e sortarea cea mai onestă într-un catalog cu pachete de mărimi diferite.

### 3.4b Trei capcane de aritmetică Liquid în blocul de preț

Prototipul randează corect pentru că e JavaScript. La portare, aceleași trei calcule
dau alt rezultat în Liquid — verificate pe catalogul real.

**1. Procentul de reducere se trunchiază, nu se rotunjește.**
`divided_by` între doi întregi taie zecimalele, deci `−16,9%` devine `−16%`, nu `−17%`.
Prototipul folosește `Math.round` (`src/_data/catalog.js`). Echivalentul în Liquid:

```liquid
{%- assign v = product.selected_or_first_available_variant -%}
{%- if v.compare_at_price > v.price -%}
  {%- assign diff = v.compare_at_price | minus: v.price -%}
  {%- assign pct = diff | times: 1000 | divided_by: v.compare_at_price | plus: 5 | divided_by: 10 -%}
  <span class="pc-deal">−{{ pct }}%</span>
{%- endif -%}
```

`times: 1000` apoi `plus: 5` apoi `divided_by: 10` e rotunjirea la întreg făcută cu
împărțiri trunchiate. Verificat pe Sleepy (16,9 → 17), Macromax (15,45 → 15),
Pyunkang Yul (50,0 → 50).

**2. Zecimalele ridicate pierd zeroul din față.**
Cardul afișează prețul ca `34⁹⁰ lei`, deci banii se separă de lei. Cu
`{{ v.price | modulo: 100 }}`, un preț de `5,05 lei` randează `5⁵ lei` în loc de `5⁰⁵ lei`.
**Sunt 7 variante reale în catalog cu banii între 01 și 09.** Umplerea e obligatorie:

```liquid
{%- assign lei_int = v.price | divided_by: 100 -%}
{%- assign bani = v.price | modulo: 100 -%}
<span class="pc-now" aria-hidden="true">{{ lei_int }}<sup>
  {%- if bani < 10 %}0{% endif %}{{ bani }}</sup><span class="cur">lei</span></span>
<span class="sr">{{ v.price | money }}</span>
```

Varianta pentru cititoare de ecran nu e decorativă: fără ea, `34⁹⁰` se aude
„treizeci și patru nouăzeci", nu „treizeci și patru lei și nouăzeci de bani".

**3. Zecimalele din atribute ies cu punct.**
`5,5 picături` vine din `toLocaleString('ro-RO')` în prototip. Liquid n-are localizare:
un metafield `number_decimal` randează `5.5`. Valoarea trebuie să rămână **număr**
(altfel se pierde fațeta de filtrare din §3.5) și se formatează la randare:

```liquid
{{ product.metafields.custom.absorbtie.value | replace: ".", "," }}
```

### 3.5 PLP

| # | Componentă | Clasificare | Efort | Corespondent Ella |
| --- | --- | --- | --- | --- |
| P1 | Breadcrumbs | **nativ** | S | toggle + aliniere; confirmat pe alte template-uri, **calea pe pagina de colecție e dedusă** |
| P2 | Antet + număr rezultate | **nativ** | S | toolbar cu `Show quantity` și placeholder `%number%` |
| P3 | Filtre laterale + drawer mobil | **nativ** | M | Main Collection → `Show Product Filtering?` randează fațetele Shopify Search & Discovery (Availability, Price, Product type, Vendor, Product options) în stil Checkbox / Swatch / Rectangle. Sidebar colapsabil, sticky, vertical stânga/dreapta sau orizontal, poziție mobil + „swipe right" |
| P4a | Fațete brand / preț / disponibilitate | **nativ** | S | Search & Discovery standard |
| P4b | **Fațete mărime, kg, talie cm, picături, bucăți** | **nativ** *dacă* datele sunt în opțiuni de produs; **necunoscut** dacă sunt în metafield-uri | M–L | Blocul Filter documentează fațete pe opțiuni de produs și un filtru propriu Ella pe listă de tag-uri. **Fațetele pe metafield nu sunt confirmate.** Vezi nota de mai jos |
| P5 | Chip-uri filtre active | **nativ** | S | parte din UI-ul de filtrare |
| P6 | Sortare | **nativ** | S | control cu etichetă editabilă |
| P7 | Grilă 2 col mobil / 4 desktop | **nativ** | S | `View as` / grid density. **Setul exact de opțiuni și toggle-ul 1↔2 coloane pe mobil = necunoscut** |
| P8 | Load more | **nativ** | S–M | „Ajax Infinite Scroll module with Pagination"; text/mărime/lățime buton documentate. **Setarea care alege pagination vs. load more vs. infinite scroll = cale necunoscută** |

> **Nota cea mai importantă de pe PLP.** Fațetele care contează cu adevărat aici —
> mărime (1–7), interval kg, talie în cm, **absorbție în picături**, bucăți în pachet —
> sunt utile ca filtre doar dacă există ca **date structurate**. Azi trăiesc în titlul
> produsului **[confirmat]**. Dacă rămân acolo, nu se pot filtra.
>
> **Recomandare:** de normalizat în opțiuni de produs sau metafield-uri, la fel ca la
> §3.4. E muncă de catalog, nu de temă — dar e condiția ca PLP-ul proiectat să
> funcționeze. De estimat separat, cu clientul.

### 3.6 PDP

| # | Componentă | Clasificare | Efort | Corespondent Ella |
| --- | --- | --- | --- | --- |
| D1 | Galerie + zoom + thumbnails | **nativ** | S | blocul `Product Media` + `Multiple Layouts` (9+ layout-uri de pagină de produs), poziție thumbnails, `Enable image zoom on hover` cu 2 stiluri. **Lightbox fullscreen pe imaginea principală = necunoscut** (doar Popup-ul de video e documentat) |
| D2 | Titlu, brand, rating | **nativ** | S | blocuri standard |
| D3a | Preț + economie | **nativ** | S | General → `Saved price` |
| D3b | Procent pe PDP | **secțiune modificată** | S–M | procentul e documentat doar pe product card |
| D3c | Preț pe unitate | **secțiune modificată** | S | vezi §3.4 |
| D4 | Selector variante | **nativ** | S | blocul `Product Variant` — Dropdown și Pills; culoare prin Swatch (Default / Advanced Color / Metaobject). Ghid de mărimi prin `Size Chart` |
| D5 | **Stoc / urgency onestă** | **nativ** | S | `Hot stock function` — alertă când stocul variantei scade sub un prag setat. **Bazat pe inventar real.** Vezi avertismentul de mai jos |
| D6 | Cantitate + Adaugă în coș | **nativ** | S | standard |
| D7 | Sticky add-to-cart mobil | **nativ** | S | blocul `Sticky Add To Cart` — Style 1/2, „always show on mobile" |
| D8 | Livrare & retur lângă buton | **nativ** | S | blocul `Custom Information` (iconiță + text sub buton) și/sau `Product Tabs → Custom tabs`. Blocul `Delivery Time` dă estimare cu token-uri `[date_start]`/`[date_end]` |
| D9 | **Descompunere PACHET PROMO** | **secțiune nouă** | L | vezi §3.6.1 |
| D10 | Descriere în acordeon | **nativ** | S | `Product Tabs` — `Closed by default` = acordeon; sau secțiunea `Collapsible Content` |
| D11 | Specificații | **nativ** | S | Custom tab în `Product Tabs` |
| D12 | FAQ pe PDP | **nativ prin workaround** | S | **niciun bloc FAQ dedicat pe PDP**; se face din Custom tab sau `Collapsible Content` pe template-ul de produs |
| D13 | Recenzii (Judge.me) | **secțiune modificată** | M | vezi §3.6.2. În prototip: antet cu media produsului + 3 recenzii, pe date simulate — vezi nota de sub §3.2 |
| D14 | „Cumpărate împreună" | **nativ, dar cu setup greu** | **L** | vezi §3.6.3 |
| D15 | Produse similare | **nativ** | S | `Complementary products` prin Search & Discovery |

> ⚠️ **Ella livrează și funcții de urgency falsă. Le lăsăm oprite, deliberat.**
> `Sold In Last Period` și `Someone purchased notification popup` (cu listă randomizată
> de timpi, separată prin `|`) fabrică dovadă socială. Contravin regulii de onestitate
> din brief (§6.4) — și publicul care cumpără produse de incontinență e ultimul căruia
> îi permitem manipulare. Folosim **doar** `Hot stock function`, care citește inventarul
> real.

#### 3.6.1 Descompunerea pachetelor promo — **secțiune nouă, L**

Pachetele promo sunt un tip de produs de primă clasă în catalog **[confirmat]**, cu
paliere PROMO/PLUS/PREMIUM/COMPLET și bundle-uri inter-categorie. Ella nu are nimic
care să afișeze „ce conține pachetul + cât economisești față de suma componentelor".

Secțiune nouă care citește un metafield cu handle-urile componentelor și randează
lista + economia calculată. Se poate refolosi metafield-ul `grouped_sub_product` pe
care Ella îl folosește oricum pentru Product Bundle (§3.6.3).

#### 3.6.2 Judge.me în tab-ul de recenzii Ella — **secțiune modificată, M**

Ella are un `Review tab` în `Product Tabs` și o secțiune `Customer Review`, dar **nicio
documentație HaloThemes nu explică cum ajunge conținutul Judge.me acolo**. Calea
Judge.me e Add section → Apps → Review Widget pe template-ul de produs.

Thread-uri de comunitate Shopify arată utilizatori Ella care **nu reușesc** să mute
widgetul Judge.me în tab-ul „Customers Reviews" — acesta cade la baza paginii.
**Dacă designul cere recenziile în tab, bugetăm Liquid.**

#### 3.6.3 „Cumpărate împreună" — **nativ, dar L**

Ella are `Product Bundle` (FBT), dar setup-ul e manual per produs:
metafield `c_f.grouped_sub_product` cu handle-urile sub-produselor **+** o colecție
numită `BUNDLE-<ID produs>` **+** o reducere automată numită `FBT-BUNDLE-<ID produs>`.

**Alternativa ieftină:** blocul `Complementary products`, alimentat din relațiile
Shopify Search & Discovery — S în loc de L. Recomand să pornim cu asta și să rezervăm
FBT-ul complet pentru top 20–30 SKU-uri, unde merită munca manuală.

### 3.6b „Alte formate și mărimi" — componenta care ține locul variantelor

**Constatarea care schimbă estimarea:** 1.202 din 1.203 produse au o singură
opțiune, `Title` = `Default Title`. Selectorul de variante — nativ în Ella, efort S —
**nu are ce afișa**. În schimb, mărimile și formatele aceleiași linii de produs sunt
produse *separate* în catalog.

Prototipul le regrupează la build: brand + titlul curățat de multiplicator, cantitate,
mărime și interval de greutate. Rezultat: **668 din 1.203 produse au cel puțin un
„frate"**, comparabili după prețul pe bucată.

| # | Componentă | Clasificare | Efort | Corespondent Ella |
| --- | --- | --- | --- | --- |
| D9 | **Alte formate și mărimi** | **secțiune nouă** | **L** | Nu există nativ. Cere fie un metafield de listă `custom.family` populat în bulk, fie o colecție per familie. Recomandat: metafield — 208 familii, se populează dintr-un export |
| D10 | Preț pe bucată în blocul de preț | **secțiune modificată** | M | Vezi §3.4 |
| D11 | Bară de cumpărare lipită jos, pe mobil | **nativ** | S | `Sticky Add To Cart`; de verificat dacă poate înlocui bara de navigație de jos, nu doar să se adauge peste ea |
| D12 | Preț minim 30 zile (Omnibus) | **secțiune nouă** | M | Fără sursă de date azi. Slot rezervat |
| D13 | Galerie fără miniaturi la o singură imagine | **nativ cu rezervă** | S | 913 din 1.203 produse au o singură imagine — de verificat că Ella nu randează o bară de miniaturi cu un singur element |

⚠️ **Capcană de portare, confirmată în prototip.** În LiquidJS `{% include %}` vede
**și scrie** scope-ul exterior: cardurile din „Din aceeași categorie" lăsau în urmă
propriile variabile de preț, iar bara lipită de jos afișa prețul ultimului card.
În Shopify, `{% render %}` e izolat și problema dispare — dar tot repo-ul folosește
`include`, deci la portare fiecare devine `{% render %}`, și orice variabilă pe care
un snippet o primea tacit din exterior trebuie trecută explicit ca parametru.

### 3.7 Coș și footer

| # | Componentă | Clasificare | Efort | Corespondent Ella |
| --- | --- | --- | --- | --- |
| K1 | Linii produs + cantitate | **nativ** | S | `Main Cart` (Ella 7) / Quick Cart (6) |
| K2 | Bară progres livrare gratuită | **nativ** | S | `Free Shipping Calculator Message` |
| K3 | Upsell în coș | **nativ** | S | „You may also like" în Quick Cart |
| K4 | Estimare livrare | **nativ** | S | calculator de transport în drawer + blocul `Delivery Time` |
| K5 | Sumar + CTA | **nativ** | S | plus General → `Terms and Conditions Checkbox` — util pentru consimțământul legal RO |
| K6 | Câmp cod reducere în drawer | **necunoscut** | ? | rapoartele se contrazic; **de verificat în editor** |
| T1 | Iconițe metode de plată | **nativ** | S | blocul `Social With Payment` + `Footer Bottom` |
| T2 | **ANPC / SAL în footer** | **secțiune modificată** | M | setul de blocuri de footer documentat în Ella 6 pare închis (Menu ×4, Newsletter ×1, Footer Bottom ×1) — **niciun bloc generic imagine/HTML**. Necesită `Custom Liquid` sau edit pe footer. **În Ella 7 ar putea fi nativ** (bloc Custom Liquid „disponibil peste tot") — de verificat |

> **Reminder legal:** doar **ANPC/SAL**. **SOL/ODR nu se mai pune** — platforma
> europeană e închisă din 20 iulie 2025 (Regulamentul UE 2024/3228). Vezi
> `design-brief.md` §1.3.

---

### 3.8 Pragul de livrare gratuită — o singură sursă

Textul „peste 200 lei" apărea în **șase** locuri din prototip: bara de anunț, slide-ul
de hero, bara de USP-uri, footer, cart drawer și constanta din `app.js`. La prima
schimbare de campanie, cinci ar fi rămas în urmă.

Acum e o singură dată în `src/_data/shop.js`, injectată în pagină ca `window.__SHOP__`
și citită de `app.js` cu aceleași valori ca plasă de siguranță.

**La portare:** Ella are pragul în `Settings → Cart → Free shipping`, dar numai pentru
bara de progres din coș. Textele de marketing (anunț, USP-uri, footer) trebuie legate
de aceeași valoare printr-o **setare de temă** (`settings.free_shipping_threshold`),
altfel problema se reface identic în Shopify. **Clasificare: secțiune modificată, efort S.**

⚠️ Liquid **nu interpolează în literale de șir.** Barele de USP-uri construiesc textele
dintr-un singur șir separat cu `~` și `|`; acolo pragul trebuie să intre prin `capture`,
nu direct în ghilimele — altfel `{{ … }}` ajunge literal în HTML.

## 4. Rânduri de verificat obligatoriu în theme editor / pe demo Ella

Documentația publică nu le stabilește. Niciunul nu e completat din presupuneri.

1. Badge **„−X%"** poate randa procentul calculat? (card și PDP)
2. Filtre pe pagina `/search` — filtrarea e documentată doar pentru Collection
3. Trending searches / recent searches / fallback „niciun rezultat" în Quick Search
4. **Fațete pe metafield** în blocul Filter — critic pentru §3.5
5. Lightbox fullscreen pe imaginea principală PDP
6. Judge.me **în interiorul** tab-ului de recenzii Ella
7. Câmp cod de reducere în cart drawer
8. Setarea care alege pagination vs. load more vs. infinite scroll
9. Toggle 1↔2 coloane pe mobil în grila PLP + setul complet `View as`
10. Breadcrumb pe pagina de colecție (calea e dedusă)
11. Sticky header: numele/locul setării; logo distinct în stare sticky
12. Announcement bar: interval autoplay, persistența închiderii, dacă iconul de close
    e într-adevăr disponibil doar pe `Layout = Slider`
13. Bloc de footer generic (imagine/HTML) pentru ANPC — și dacă Ella 7 chiar rezolvă

---

## 5. ⚠️ Avertismentul care contează cel mai mult la estimare

**„Nativ" înseamnă „există un toggle", nu „arată ca prototipul".**

Fidelitatea vizuală față de mockup — spațiere, tipografie, forma badge-urilor,
densitatea grilei, raportul de aspect al imaginilor — e sursa reală de efort și poate
transforma un rând **S** într-un **M**. Un `Announcement Bar` nativ se activează în
5 minute; să arate exact ca în prototip poate cere o oră de CSS.

Estimările din tabele acoperă **funcția**, nu **potrivirea vizuală**. Recomand un
buget separat de ~20–30% peste totalul de mai sus pentru aliniere vizuală, plus
rândurile necunoscute din §4 care se pot muta în sus după verificarea în editor.
