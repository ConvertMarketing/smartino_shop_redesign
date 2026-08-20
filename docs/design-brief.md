# Design Brief — Redesign smartinoshop.ro

**Fază:** 0 — Documentare
**Status:** propunere, în așteptarea aprobării
**Ultima actualizare:** 20 august 2026

---

## 0. Cum a fost făcută cercetarea (și ce nu am putut verifica)

Trebuie citit înainte de orice altceva, pentru că determină cât de mult se poate baza
cineva pe fiecare afirmație din document.

Sesiunea în care a fost făcută cercetarea are **egress de rețea restricționat**.
`smartinoshop.ro`, `www.smartinoshop.ro`, `smartinohome.ro`, `smartino.md`,
`halothemes.com`, `halosoft.gitbook.io`, `themeforest.net`, `emag.ro`, `brandfetch.com`
și `web.archive.org` răspund toate cu **403 la CONNECT** prin proxy-ul de egress.
Singurele gazde accesibile relevante sunt `cdn.shopify.com` și registry-ul npm.

**Consecința directă:** nu am putut deschide nicio pagină de pe site. Nu am putut
descărca `products.json` sau `collections.json`. Nu am văzut niciun preț, nicio imagine,
niciun logo și niciun text de pe site în forma lui reală.

Tot ce urmează provine din **căutare web** — titluri de rezultate, snippet-uri și
sumarizări ale conținutului indexat. Am rulat 18 agenți de cercetare pe unghiuri
independente (brand, catalog, produse, promoții, politici, identitate vizuală, social,
branduri surori, tema Ella, referințe de conversie), fiecare instruit să nu inventeze
nimic și să marcheze fiecare afirmație.

Notația folosită peste tot în document:

| Marcaj | Înseamnă |
| --- | --- |
| **[confirmat]** | a apărut explicit într-un titlu sau snippet indexat |
| **[dedus]** | raționament pe baza dovezilor indexate — dovada e menționată |
| **[necunoscut]** | nu a putut fi stabilit. Nu se completează din imaginație. |

**Regula care a guvernat tot:** `CLAUDE.md` → *„NU inventa produse, prețuri sau texte.
Niciodată."* Unde nu am avut dovadă, scrie „necunoscut" — nu o valoare plauzibilă.
Secțiunea 9 e lista completă a ce lipsește.

---

## 1. Trei corecții la brief-ul inițial

Le pun primele pentru că schimbă ce construim, iar două dintre ele ar produce
afirmații false pe site dacă le-am implementa ca atare.

### 1.1 „Cadou la 500 lei" — nu există nicio dovadă

Brief-ul cere o bară de anunț și o bară de progres în coș construite pe regula
„cadou la 500 lei", descrisă ca „regula existentă de pe site".

**Nu am găsit nicio urmă a acestei reguli.** Cinci formulări diferite de căutare
(500 / 400 / 300 lei, „primești cadou", „comandă peste") au întors zero rezultate.

Regula care **chiar** e pe site, și cea mai bine coroborată afirmație din tot dosarul
(6+ confirmări independente, inclusiv match pe frază exactă):

> **`Livrare GRATUITĂ la comenzile de peste 200 LEI`** **[confirmat]**

Pe site, „cadou" înseamnă altceva: colecția `/collections/seturi-cadou` și bundle-uri
în care *produsul* e cadoul (`PACHET PROMO – 2x Cap de Duș + 1x Set Microfiltre CADOU`)
**[confirmat]**.

**Propunere:** bara de anunț și bara de progres din coș se construiesc pe **200 lei
livrare gratuită**. Mecanica din prototip rămâne parametrizabilă — dacă există o
campanie de cadou pe care căutarea nu a indexat-o, se schimbă pragul și textul
dintr-un singur loc, fără rescris.

### 1.2 „Retur gratuit" — ar fi o afirmație falsă

Brief-ul cere „retur 14 zile" în trust bar, ceea ce e corect. Dar atenție să nu devină
„retur gratuit" pe drum, pentru că politica reală spune explicit contrariul:

> „costurile aferente returului sunt suportate de clientul nemulțumit" **[confirmat]**

Deci: **„Retur în 14 zile"** — da. **„Retur gratuit"** — niciodată.

*Observație separată, pentru client, nu pentru design:* politica actuală cere ambalaj
original obligatoriu, notificare prealabilă obligatorie și transport în sarcina
clientului. Toate trei sunt mai restrictive decât permite OUG 34/2014. Nu e treaba
redesign-ului, dar merită semnalat.

### 1.3 SOL în footer — platforma nu mai există

Brief-ul cere „ANPC/SOL în footer". **ANPC rămâne. SOL trebuie scos.**

Platforma europeană SOL/ODR a fost **închisă pe 20 iulie 2025**, prin Regulamentul
(UE) 2024/3228, care abrogă Regulamentul (UE) 524/2013. A încetat să primească
plângeri noi din 20 martie 2025. Din 20 iulie 2025, **referințele către platforma ODR
nu mai au voie să apară în textele legale și pe site-uri**. **[confirmat — verificat
independent: iubenda, Taylor Wessing, Comisia Europeană / consumer-redress.ec.europa.eu]**

Mai important, există și o bază **românească**, nu doar europeană: **Ordinul ANPC
449/2022** obligă la pictograme SAL (și, pe vremuri, SOL) de **250×50 px**, cu link
corect, **pe prima pagină** a site-ului comercial. Iar **OPANPC 270/2026**, publicat în
mai 2026, modifică Ordinul 449/2022 exact ca să **șteargă referințele la SOL și să
păstreze doar SAL**. **[dedus — două surse independente: agentia-digitala.ro,
validsoftware.ro]**

Amenzile pentru neconformitate: **2.000–100.000 lei** **[dedus]**.

⚠️ **O sursă din 2026 încă listează „pictogramele SAL și SOL" la controale.** Sursele
nu sunt de acord între ele. Recomandarea mea rămâne SAL-only, dar **înainte de lansare
verifică cu un jurist** — nu e o decizie de design.

**Propunere pentru footer:** pictogramă **SAL 250×50** cu link corect, plus ANPC.
Fără SOL. Ce URL-uri exacte vrea clientul — de confirmat.

**Tot obligatoriu pe site** (Legea 365/2002, OG 130/2000) **[dedus]**, și le avem pe
toate confirmate din §2.1: denumirea completă, **numărul din Registrul Comerțului
(J2017003263233)** și **adresa completă a sediului social** (Str. Avram Iancu 22–26F,
Otopeni, jud. Ilfov).

### 1.4 O tensiune de rezolvat conștient: emoji

Regula de design din brief spune „fără iconițe emoji". Vocea reală a brandului pe
social e **densă în emoji**, ~1 per propoziție: *„Vrei să faci curățenie rapid și
eficient? 🔝 Descoperă combinația perfectă:"* **[confirmat]**

Nu e o contradicție care trebuie ascunsă. Emoji aparțin registrului de social, nu
neapărat vitrinei. **Propunerea mea: respectăm regula — zero emoji în UI-ul
magazinului**, iconografie desenată consecvent în schimb. Vocea rămâne caldă și la
persoana a II-a singular, ca pe social; doar decorul se schimbă.

---

## 2. Analiza brandului

### 2.1 Cine e Smartino, de fapt

| | |
| --- | --- |
| Entitate | **SC SMARTINO INTERNATIONAL SRL**, CUI **RO37843488**, J2017003263233 **[confirmat]** |
| Sediu | Str. Avram Iancu 22–26F, Otopeni, jud. Ilfov **[confirmat]** |
| Înființată | 27 iunie 2017 **[confirmat]** |
| Cifră de afaceri 2024 | 32.223.795 lei, profit net 1.763.358 lei, 27 angajați **[confirmat]** |
| Cifră de afaceri 2025 | **56.454.748 lei**, profit 4.702.265 lei, **+75,2% YoY**, 40 angajați **[confirmat]** |
| Contact | info@smartinoshop.ro, 0374 072 222, L–V 09:00–17:00 **[confirmat]** |

Asta nu e un magazin mic. E un retailer mid-size în creștere accelerată, cu import
direct, mărci proprii și două magazine fizice. **Site-ul trebuie să arate ca al unui
retailer serios**, nu ca al unui boutique și nici ca al unui dropshipper.

### 2.2 Poziționarea: prețul

Presa de retail o formulează direct — Smartino e „o nouă rețea de retail care își
creează identitatea în piață **prin preț**" **[confirmat]**.

Doctrina declarată: cel mai bun raport calitate-preț; politică de preț „fair față de
clienți"; **nu listează produse mai scumpe decât lanțurile concurente**; lucrează doar
cu furnizori care le acceptă termenii, ca prețurile să rămână printre cele mai mici
**[confirmat]**. Avantajul structural: retailul a crescut dintr-un business de
**import direct** de produse de igienă și menaj **[confirmat]**.

**Asta e cea mai importantă informație din tot documentul pentru design.** Un retailer
care își construiește identitatea pe preț are nevoie ca prețul să fie *citibil și
comparabil* — nu doar afișat. Vezi §4.4 (sistemul de preț) și §6.3 (preț pe unitate).

### 2.3 Diferențiatorul care nu e prețul: statutul de importator

- **Importator unic / deținător de brand în România** pentru **Sleepy**, **Easyclean**
  și **Perfex** **[confirmat]**
- **Importator oficial** pentru brandurile coreene **Unleashia**, **Luvum**, **Nard**,
  **Pyunkang Yul** — cu un unghi explicit de autenticitate / anti-contrafacere
  **[confirmat]**

Într-o piață unde cosmeticele coreene se vând masiv prin revânzători paraleli,
„importator oficial" e un argument comercial real. Merită un tratament vizibil, nu o
notă în subsol.

### 2.4 Publicurile — trei, foarte diferite

| Public | Dovadă | Nevoie de design |
| --- | --- | --- |
| **Părinți de bebeluși** (primar) | `scutece-copii`, Sleepy mărimi 1 Newborn (2–5 kg) → 7 (20–30 kg), șervețele **[confirmat]** | mărime + greutate ca filtru principal; preț pe bucată; reasigurare pe piele sensibilă |
| **Îngrijitori / adulți cu incontinență** (secundar) | `scutece-adulți`, `produse-incontinenta`, Sleepy Medical, Dailee, Actual Double; titlul home spune „copii **si adulti**" **[confirmat]** | **demnitate.** Talie în cm + absorbție în picături ca filtre. Fără infantilizare, fără ton vesel deplasat. |
| **Gospodărie / menaj** | cea mai mare temă de conținut pe TikTok; numele IG conține „curățenie&menaj" **[confirmat]** | volum, pachete promo, preț pe unitate |
| **Cumpărători K-beauty** | `cosmetice-coreene`, bio IG „produse coreene", articole de blog **[confirmat]** | descoperire, brand, imagine bogată |

Provocarea reală de design: **aceeași vitrină trebuie să servească un îngrijitor care
cumpără scutece pentru adulți și o tânără care cumpără machiaj Unleashia.** Nu se
rezolvă cu un ton mediu care nu servește pe nimeni — se rezolvă cu **puncte de intrare
pe categorie foarte clare**, ca fiecare public să se auto-selecteze în primele secunde.

### 2.5 Tonul vocii **[confirmat, din copy real de pe social]**

- Persoana a II-a singular: *„Perfecte pentru casa ta"*, *„Soluția perfectă pentru tine"*
- CTA imperativ aproape peste tot: *„Comandă acum!"*, *„Le găsești pe SmartinoShop.ro"*
- Întrebare retorică → produsul ca răspuns
- Reasigurare orientată pe beneficiu la produsele de bebeluși: *„oferă o curățare
  delicată, ajutând la hidratarea și îngrijirea pielii bebelușului"*
- Registru corporativ cald la persoana I plural pentru știri: *„noi abia așteptăm să
  vă întâmpinăm!"*
- Linie folosită ca slogan: **„Tot ce ai nevoie, într-un singur loc"** **[confirmat]** —
  dar e o linie generică de retail românesc, folosită și de Kaufland și MP Store
  **[confirmat]**. Nu e distinctivă. Nu o trata ca pe un asset de brand.

### 2.6 Omnichannel — un asset de încredere real

- **Smartino Supermarket** — deschis 11 iulie 2025, Snagov Plaza, DN1. Tel
  +40 755 210 178. L–V 07:00–22:00, S–D 08:00–21:00. Investiție peste 600.000 €.
  Coș mediu ~120 lei, ~500 clienți/zi **[confirmat]**
- **Smartino Home & Deco** — deschis **25 iulie 2026**, peste **1.200 mp**, Snagov
  Plaza, vizavi de supermarket **[confirmat]**
- Ambele concepte urmează să fie replicate național **[confirmat]**
- Marketplace: vânzător pe **eMAG** și **Altex** **[confirmat]**
- Social: FB ~10.500 like-uri; **IG @smartino.ro 28K urmăritori**; TikTok
  @smartinoshop.ro 10,2K urmăritori / 79,8K like-uri **[confirmat]**

Două magazine fizice reale, cu adresă, telefon și program, sunt un activ de încredere
pe care majoritatea magazinelor online românești nu îl au. Merită un modul dedicat, nu
doar o linie în footer.

### 2.7 Catalogul și taxonomia lui

**65+ handle-uri de colecții confirmate** ca URL-uri indexate. Grupate:

- **Bebeluși:** `scutece-copii`, `scutece-chilotel`, `pachete-promo-scutece-copii`,
  `servetele-umede-bebelusi`, `ingrijire-copii`
- **Adulți / incontinență:** `scutece-adulți`, `scutece-pentru-adulti` *(două colecții
  paralele — probabil duplicat)*, `produse-incontinenta`, `servetele-umede-incontinenta`
- **Șervețele:** `servetele-umede`, `servetele-umede-multisuprafete`, `servetele-faciale`
- **Îngrijire personală:** `ingrijire-corp`, `ingrijire-par`, `ingrijirea-pielii`,
  `igiena-orala`, `igiena-intima`, `sapunuri`, `șampoane`
- **Cosmetice:** `cosmetice-coreene`, `luvum`, `pyunkang-yul`, `machiaje`,
  `fond-de-ten`, `paleta-de-farduri-1`, `eyeliner`, `tint`, `creion-pentru-sprancene`,
  `frigidere-cosmetice`
- **Curățenie & menaj:** `curatenie-intretinere`, `produse-menaj`, `detergent-rufe`,
  `detergent-vase`, `balsam-rufe`, `capsule-pentru-masina-de-spalat`, `bureti-vase`,
  `lavete`, `mop-si-lavete`, `saci-gunoi`, `solutii-suprafete-baie`, `scrub-daddy`,
  `produse-macromax`
- **Hârtie:** `produse-din-hartie`, `hartie-igienica`, `prosoape-de-bucatarie`,
  `batiste-nazale`
- **Meta:** `all`, `best-seller`, `cele-mai-recente`, `reduceri`, `seturi-cadou`

**Branduri confirmate:** proprii — Sleepy, Sleepy Easy Clean, Perfex, MACROMAX;
terțe — Dailee, Actual Double, MAGICS, Kalyon, Parex, Meloni, Perlux, Wash & Free,
Scrub Daddy, Aroma Home; coreene — Unleashia, Nard, Luvum, Pyunkang Yul.

**Trei convenții de taxonomie care trebuie să devină filtre, nu tag-uri generice:**

1. **Fiecare titlu se termină în „X bucăți".** Catalogul e condus de mărimea pachetului.
2. **Bebeluși:** număr mărime + nume + interval kg (`mărime 4 Maxi, 7-14kg`).
3. **Adulți:** interval talie în cm + **absorbție în „picături"** (5.5 / 6 / 7 / 7.5 /
   8.5 / 9).

Toate **[confirmat]**, direct din titlurile de produs.

**Pachetele promo sunt un tip de produs de primă clasă**, nu o excepție: „PACHET PROMO"
cu paliere PROMO / PLUS / PREMIUM / COMPLET, inclusiv bundle-uri inter-categorie
(șervețele + mop) **[confirmat]**. PDP-ul și cardul trebuie să le trateze ca atare, cu
descompunerea conținutului și economia vizibilă.

**Recenziile există deja:** **Judge.me** e instalat, iar un SKU Sleepy afișează
**4,95/5 din 569 recenzii** **[confirmat]**. Rating pe card și bloc real de recenzii pe
PDP sunt susținute de date reale, nu aspiraționale.

### 2.8 Defecte de IA/SEO observabile, de reparat la implementare

Nu schimbă designul, dar merită în backlog:

- Colecții duplicate pentru adulți: `scutece-adulți` vs `scutece-pentru-adulti`
- Drift handle/titlu: handle `…natural-ultra-sensitive-double`, titlu „Natural Double"
- Contradicție în același produs: handle Jeans mărimea 5 spune „15-25kg, 20 buc",
  titlul spune „11-18kg, 24 bucăți"
- `/products/nard` — handle dintr-un singur cuvânt pentru un produs concret
- Diacritice în handle-uri, forțând %-encoding în URL
- **Un arbore de URL-uri vechi `.html` încă indexat** pe hostul `www.`
  (`www.smartinoshop.ro/produse-incontinenta/….html`) — platformă anterioară

---

## 3. Direcția vizuală

### 3.1 Identitatea de brand — recuperată, 20 august

**Secțiunea asta spunea până acum „paletă necunoscută, propunere de sistem".
Nu mai e cazul.** După ce a fost deblocat accesul la `smartinohome.ro` — magazinul
suroră, același grup, aceeași temă — am putut extrage identitatea reală.

**Logo-ul.** Wordmark **cu literă mică**, sans geometric rotunjit, cu **®** după
„smartino"; descriptorul de sub-brand („home") într-un gri deschis, ca a doua greutate.
Sursa: `smartinohome.ro/cdn/shop/files/logo_smartino_home_1_300x.svg` **[confirmat —
descărcat și inspectat]**.

> ⚠️ **Corecție la ce scriam înainte.** Dedusesem „wordmark all-caps SMARTINO" din
> title tag-uri, marcând dovada ca slabă. Era greșit: **logo-ul e lowercase.** Bine că
> nu m-am bazat pe el.

**Paleta reală**, citită din variabilele CSS ale temei **[confirmat]**:

| Token | Valoare | Rol observat |
| --- | --- | --- |
| **Primară** | **`#15B7C6`** | `--color`, `--sm-promo-c1` — cyan/turcoaz, culoarea wordmark-ului |
| Text | `#232323` | `--logo-color`, titluri, countdown |
| Text secundar | `#3c3c3c` | corp de text |
| **Reducere** | `#d12442` | roșu, folosit pe promoții |
| Fundal | `#f1f1f1` / `#ffffff` | suprafețe |

**Tipografia.** Tema surori rulează pe **Quicksand** (`--font-family-1` și
`--font-family-2` — o singură familie, două roluri) **[confirmat]**. Se potrivește cu
wordmark-ul: geometric rotunjit, aceeași familie de forme.

**Ce înseamnă pentru direcția noastră.** Cyanul e o culoare de brand genuină și
neobișnuită în retailul de igienă românesc — e un avantaj, nu o problemă. Îl păstrăm ca
primară. Trei ajustări pe care le propun:

1. **Cyanul rămâne accent, nu suprafață.** `#15B7C6` la 100% pe suprafețe mari obosește
   ochiul și scade contrastul textului. CTA, stări active, progres — da. Fundaluri de
   secțiune — nu.
2. **Contrast de verificat.** `#15B7C6` pe alb dă un raport sub 4.5:1 pentru text mic.
   Pentru butoane cu text alb avem nevoie de o variantă mai închisă (`brand-700`), cu
   cyanul original păstrat ca accent și pentru suprafețe mari.
3. **Quicksand doar pentru display.** E potrivit pentru wordmark și titluri, dar
   rotunjimea îi scade lizibilitatea la corp mic și la cifre — exact unde ne doare, la
   prețuri. Propun **Quicksand pentru titluri** (continuitate cu logo-ul) și o
   secundară neutră cu **cifre tabulare** pentru preț, specificații și UI.

**Ce rămâne de confirmat:** logo-ul propriu **smartinoshop** (îl am doar pe cel de
Home), și dacă cele două magazine trebuie să arate ca un sistem comun sau deliberat
diferit. Vezi §7.

### 3.2 Principiul care conduce designul

Un retailer cu 2.000+ SKU-uri care își face identitatea din preț **nu poate folosi
spațierea unui boutique**. Aerul excesiv comunică „scump" și îngroapă asortimentul.

Direcția: **densitate ordonată.** Informație multă, așezată strict, cu ierarhie clară.
Referința mentală e o drogherie bună — Rossmann, dm, Notino — nu un concept store.
Grid strict, ritm previzibil, fotografia produsului în prim-plan, iar prețul citibil
de la distanță.

### 3.3 Designul trebuie construit în jurul imaginilor care există de fapt

Asta e o decizie de proiectare, nu o preferință estetică. Catalogul e format din
**packshot-uri de furnizor**, de calitate inegală, majoritatea pe fundal alb. Nu
avem — și nu vom avea la prototip — fotografie lifestyle proprie.

Un design care presupune fotografie editorială bogată va arăta rupt în momentul în
care intră datele reale. Deci:

- **Tile-uri neutre, nu albe.** Un fundal `--surface-2` foarte deschis în spatele
  packshot-ului, ca produsele decupate pe alb să nu plutească în neant.
- **Aspect-ratio fix pe card, `object-fit: contain`, padding consecvent.** Rezolvă
  simultan inconsecvența packshot-urilor și CLS-ul.
- **Fără umbre generice de card.** Separarea se face din fundal și un chenar subtil de
  1px. (E și regula din brief.)
- Fotografia lifestyle se folosește **doar** în sloturi editoriale declarate (hero,
  bannere de categorie), unde știm că avem material — nu ca fundație a sistemului.

### 3.4 Tipografie

Două cerințe non-negociabile înainte de orice considerent estetic:

1. **Suport complet pentru diacriticele românești, cu virgulă dedesubt** — `ș` `ț`,
   nu cedilă `ş` `ţ`. Multe fonturi populare livrează cedila turcească și textul
   arată greșit unui cititor român. Se verifică per font, nu se presupune.
2. **Cifre tabulare** (`font-variant-numeric: tabular-nums`) pentru prețuri, ca
   coloanele de preț din grilă și din coș să se alinie.

Propun două perechi. Alegerea finală se face când văd logo-ul — dacă logo-ul e deja
un wordmark cu caracter, titlurile trebuie să nu concureze cu el.

| | Titluri | Text & UI | Caracter |
| --- | --- | --- | --- |
| **A — recomandată** | **Figtree** (600/700) | **Inter** (400/500/600) | cald geometric peste neutru. Figtree are rotunjimi prietenoase fără să fie infantil — funcționează și pe scutece de bebeluși, și pe incontinență, fără să sune deplasat pe niciunul |
| **B — alternativă** | **Instrument Sans** (600) | **Source Sans 3** (400/600) | mai sec, mai „retail". De ales dacă logo-ul e deja expresiv și are nevoie de un fundal tăcut |

Ambele familii sunt variabile, servibile din `fonts.googleapis.com`, cu subset latin-ext.
**Suportul pentru `ș`/`ț` cu virgulă se verifică la implementare** — dacă o familie
livrează cedilă, se schimbă, nu se acceptă.

Scară tipografică — modulară, 1.200 pe mobil, 1.250 pe desktop, `clamp()` între:

```
--fs-xs   12px      etichete, meta pe card
--fs-sm   14px      text secundar, breadcrumbs
--fs-base 16px      corp — nu mai mic, publicul include îngrijitori vârstnici
--fs-lg   18px
--fs-xl   clamp(20px, 2.2vw, 24px)     titlu de secțiune mobil
--fs-2xl  clamp(24px, 3.2vw, 32px)     titlu de secțiune desktop
--fs-3xl  clamp(30px, 4.8vw, 44px)     hero
```

**16px minim pentru corp** e o decizie deliberată, nu un default: unul dintre
publicurile confirmate sunt îngrijitorii și adulții care cumpără produse de
incontinență. Textul mic i-ar exclude.

### 3.5 Culoare

Structura paletei, cu primara ca variabilă până la brand kit:

```
/* Brand — VALOAREA E PLACEHOLDER pana la primirea brand kit-ului */
--brand-600     culoarea primara de brand      <- se substituie din logo
--brand-700     stare hover/pressed
--brand-50      tenta foarte deschisa, fundaluri de accent

/* Pret & promotie — rol strict rezervat */
--sale-600      #C1121F   rosu, EXCLUSIV pentru reduceri si preturi promotionale
--sale-50       fundal badge

/* Neutre — fac 80% din munca */
--ink-900       #14171A   titluri, pret curent
--ink-700       #3D4348   corp
--ink-500       #6B7379   meta, pret taiat
--ink-300       #C7CCD1   chenare
--surface-0     #FFFFFF   carduri, drawere
--surface-1     #F7F8F9   fundal pagina
--surface-2     #EFF1F3   tile imagine produs

/* Semantice */
--success-600   #1B7F4B   in stoc, prag livrare atins
--warn-600      #B45309   stoc limitat (doar cand e adevarat)
```

Reguli, nu sugestii:

- **Roșul e rezervat.** `--sale-600` apare **exclusiv** pe reduceri și preț promoțional.
  Niciodată decorativ, niciodată pe un buton care nu e legat de o ofertă. Într-un
  magazin condus de preț, dacă roșul e peste tot, nu mai înseamnă nimic.
- **Neutrele fac majoritatea muncii.** Culoarea de brand marchează navigația, starea
  activă și CTA-ul principal. Atât.
- **Fără gradiente violete.** (Regula din brief; oricum n-ar avea ce căuta aici.)
- **Accente de categorie** pentru mega-menu — tente foarte desaturate din `--brand-50`,
  nu un curcubeu de categorii.
- **Contrast:** tot textul la **minim 4.5:1**, elementele de UI la 3:1. Se verifică,
  nu se estimează.

### 3.6 Spațiere și grilă

Scară de spațiere pe 4px: `4 8 12 16 20 24 32 40 48 64 80`.

| | Mobil (390) | Tabletă | Desktop (1440) |
| --- | --- | --- | --- |
| Container | 100% − 32px gutter | 100% − 48px | max **1320px** |
| Coloane | 4 | 8 | 12 |
| Gutter grilă produse | 12px | 16px | 24px |
| **Produse pe rând** | **2** | 3 | 4 |

**Două coloane pe mobil, nu una.** Cu 2.000+ SKU-uri și un public condus de preț, o
coloană transformă răsfoirea într-un maraton de scroll și ascunde comparația de preț
care e chiar motorul brandului. Cardul e proiectat să funcționeze la ~170px lățime.

### 3.7 Micro-interacțiuni

Subtile, funcționale, toate sub `prefers-reduced-motion`:

- A doua imagine la hover — **cu degradare grațioasă** când produsul are o singură
  imagine (multe packshot-uri de furnizor au)
- Tranziții 150–200ms, `ease-out`. Fără bounce, fără spring.
- Quick add cu stare vizibilă: idle → loading → adăugat, apoi drawer
- Chip-uri de filtru care apar/dispar cu fade scurt, fără reflow al grilei
- Focus vizibil, gros, pe **toate** elementele interactive — nu `outline: none`

### 3.8 Ce evităm, explicit

- Gradiente violete (sau orice gradient decorativ)
- Iconițe emoji în UI
- Lorem ipsum — dacă nu avem textul real, spațiul rămâne gol și marcat
- Carduri cu umbre generice
- Hero-uri simetrice, centrate, cu buton în mijloc
- Fotografie stock care nu are legătură cu asortimentul
- Urgency falsă: countdown-uri inventate, „ultimele 3 bucăți" fără date reale de stoc
- Spațiere de boutique care ascunde asortimentul

---

## 4. Sitemap-ul prototipului

Scop: **6 șabloane**, nu 6 pagini. Fiecare demonstrează un tip de pagină pe date reale.
Fără checkout, cont client sau blog (per brief).

```
/                          Home
/collections/scutece-copii PLP — cazul „bebeluși": mărime + kg + pachet
/collections/produse-incontinenta
                           PLP — cazul „adulți": talie cm + picături
                           (al doilea PLP e ieftin — același șablon, alte fațete —
                            și demonstrează că sistemul de filtre chiar se pliază
                            pe două taxonomii diferite)
/products/{handle}         PDP — un SKU simplu cu variante
/products/{pachet-promo}   PDP — un PACHET PROMO, cu descompunerea conținutului
/cart                      Pagina coș
   + cart drawer           overlay, disponibil din orice pagină
   + căutare predictivă    overlay, din JSON local
   + 404                   (ieftin, și arată sistemul la margine)
```

Header și footer sunt componente pe toate paginile, nu pagini separate.

**De ce aceste două PLP-uri:** sunt cele două taxonomii extreme confirmate din catalog.
Dacă sistemul de filtre le acoperă pe amândouă, acoperă și menajul și cosmeticele.

**De ce două PDP-uri:** pachetele promo sunt un tip de produs de primă clasă
**[confirmat]**, iar un PDP proiectat doar pentru SKU simplu se rupe pe ele.

---

## 5. Componentele prototipului

Lista completă. Clasificarea Ella (nativ / secțiune modificată / secțiune nouă) și
efortul sunt în **`docs/ella-mapping.md`**, ținut la zi pe măsură ce construim.

### 5.1 Global
| # | Componentă |
| --- | --- |
| G1 | Bară de anunț — livrare gratuită peste 200 lei |
| G2 | Header sticky — logo, căutare, cont, coș cu total |
| G3 | Mega-menu pe categorii (desktop) |
| G4 | Drawer de navigație (mobil) |
| G5 | Căutare predictivă — overlay, din JSON local |
| G6 | Cart drawer cu bară de progres spre livrarea gratuită |
| G7 | Footer — trust, ANPC/SAL, plată, contact, magazine fizice |
| G8 | Bară USP (livrare, retur 14 zile, importator oficial, magazine fizice) |

### 5.2 Home
| # | Componentă |
| --- | --- |
| H1 | Hero cu ofertă + CTA |
| H2 | Tile-uri de categorii principale |
| H3 | Bară USP |
| H4 | Carusel bestsellers |
| H5 | Rând „Reduceri" |
| H6 | Bloc „Importator oficial" — Sleepy / Perfex / K-beauty |
| H7 | Bloc recenzii (Judge.me) |
| H8 | Bloc magazine fizice (Supermarket + Home, Snagov) |
| H9 | Newsletter |

### 5.3 Card produs (folosit peste tot)
| # | Componentă |
| --- | --- |
| C1 | Imagine cu aspect-ratio fix + a doua imagine la hover |
| C2 | Preț: curent, `compare_at` tăiat, badge −X% |
| C3 | **Preț pe unitate** (lei/bucată) — vezi §6.3 |
| C4 | Badge-uri: Nou / −X% / Stoc limitat |
| C5 | Rating (Judge.me) |
| C6 | Quick add |
| C7 | Variante de culoare pe card (unde există) |

### 5.4 PLP
| # | Componentă |
| --- | --- |
| P1 | Breadcrumbs |
| P2 | Antet colecție + număr rezultate |
| P3 | Filtre laterale (desktop) / drawer (mobil) |
| P4 | Fațete specifice: mărime, kg, talie cm, picături, bucăți, brand, preț |
| P5 | Chip-uri de filtre active + „șterge tot" |
| P6 | Sortare |
| P7 | Grilă (2 col mobil / 4 desktop) |
| P8 | Load more |

### 5.5 PDP
| # | Componentă |
| --- | --- |
| D1 | Galerie: thumbnails + zoom |
| D2 | Titlu, brand, rating |
| D3 | Preț + economie + preț pe unitate |
| D4 | Selector variante |
| D5 | Stoc / urgency **onestă** |
| D6 | Cantitate + Adaugă în coș |
| D7 | Buton sticky de adăugare (mobil) |
| D8 | Livrare & retur lângă buton |
| D9 | Descompunerea conținutului (doar la PACHET PROMO) |
| D10 | Descriere în acordeon |
| D11 | Specificații (mărime, greutate, absorbție, bucăți) |
| D12 | FAQ |
| D13 | Recenzii |
| D14 | „Cumpărate împreună" |
| D15 | Produse similare |

### 5.6 Coș
| # | Componentă |
| --- | --- |
| K1 | Linii de produs cu cantitate |
| K2 | Bară de progres spre livrare gratuită |
| K3 | Upsell |
| K4 | Estimare livrare |
| K5 | Sumar + CTA |

---

## 6. Practicile de conversie implementate

Fiecare are un motiv legat de acest business, nu de o listă generică.

### 6.1 Bara de anunț și bara de progres — pe 200 lei

O singură regulă confirmată, un singur mesaj. Bara de progres din coș spune concret
cât mai lipsește: *„Încă 43,10 lei până la livrare gratuită"*. Fără rotații inventate.

### 6.2 Filtre care se pliază pe taxonomia reală

Fațetele generice pe tag-uri nu ajută pe nimeni aici. Fațetele care contează, direct
din convențiile confirmate de denumire:

- **Bebeluși:** mărime (1–7), interval greutate (kg), bucăți în pachet, brand
- **Adulți:** interval talie (cm), **absorbție (picături)**, bucăți, brand
- **Transversal:** preț, brand, în stoc, la reducere

Pe mobil, filtrele intră în drawer, cu numărul de rezultate actualizat live și
aplicare explicită.

**Două reguli luate din benchmark-uri (§9), nu inventate:**

- **Tot ce scriem pe card trebuie să fie filtrabil.** Baymard: *„Have Filters for All
  Displayed List Item Info"* — **38% dintre site-uri nu o fac**. Concret: dacă tipărim
  „7,5 picături" pe card, absorbția trebuie să fie fațetă. Altfel îi arătăm clientului
  un criteriu pe care nu-l poate folosi.
- **Chip-uri cu filtrele active, plus „șterge tot".** **20% dintre site-uri nu arată
  deloc filtrele aplicate** **[dedus — Baymard]**.

**Sortări.** Baymard: **doar 36% dintre site-uri oferă toate cele patru sortări
esențiale** — preț, rating, best-selling, cele mai noi. Le punem pe toate patru. Plus
una specifică acestui business, pe care o are și eMAG: **procent reducere**
**[confirmat — din slug-urile de facetă eMAG]**. Pentru un retailer construit pe preț
e sortarea cea mai firească. Mai târziu, când numărul de bucăți devine metafield
(§8.5), se adaugă și **preț pe bucată** — cea mai onestă sortare într-un catalog cu
pachete de mărimi diferite.

### 6.3 Preț pe unitate — cea mai valoroasă adăugare pentru acest catalog

Fiecare titlu se termină în „X bucăți", iar același produs se vinde în pachete de 20,
28, 30, 40, 68, 80 **[confirmat]**. Fără preț pe bucată, un client **nu poate compara**
un pachet de 30 cu unul de 80 — exact comparația pe care un brand construit pe preț
ar trebui să o facă ușoară.

Afișăm `lei/bucată` pe card și pe PDP. Îl calculăm din datele reale; numărul de bucăți
se extrage din titlu la prototip, iar la implementare ar trebui să vină dintr-un
metafield, ca să nu depindă de parsarea titlului.

**Asta e diferența dintre a afișa prețul și a-l face comparabil.** E cea mai directă
traducere în design a poziționării confirmate din §2.2.

### 6.3b Butonul care devine selector de cantitate

Baymard, dintr-un studiu pe **grocery**: *„Dynamically Update the 'Add to Cart' Button
to a Quantity Selector after Item Added"* **[confirmat — titlu]**. După adăugare,
butonul de pe card se transformă pe loc într-un stepper **− 2 +**.

Se potrivește exact aici, pentru că jumătate din catalog e **cumpărătură repetată** —
scutece, șervețele, detergent, hârtie. Clientul nu adaugă o bucată, adaugă trei. Fără
asta îl obligăm să apese de trei ori și să se întrebe de fiecare dată dacă s-a
înregistrat. Baymard notează și că exact aici apare întrebarea *„am adăugat sau nu?"*
când butonul nu-și schimbă starea.

### 6.3c Produsele deja în coș, marcate în listă

Baymard: *„Highlight Items Already in the User's Cart"* — **96% dintre site-uri nu o
fac** **[confirmat — titlu]**.

E cel mai bun raport valoare/efort din toată lista, și e fix pentru catalogul ăsta: pe
o listă de menaj sau de îngrijire, clientul adaugă 8–10 produse și pierde șirul. Un
marcaj discret „în coș · 2" pe card previne dublul adaos și dă senzația de listă de
cumpărături, nu de vitrină.

### 6.4 Onestitate pe stoc și urgency

Fără countdown-uri inventate și fără „ultimele 3 bucăți" fabricat. Badge-ul de stoc
limitat apare **doar** când datele reale îl susțin. Dacă nu avem nivel de stoc în
`products.json`, badge-ul nu apare deloc. Urgency falsă e o datorie de încredere, iar
publicul care cumpără produse de incontinență e ultimul căruia îi permitem manipulare.

### 6.5 Pachetele promo, tratate ca produse de primă clasă

Descompunerea conținutului pe PDP, economia calculată față de suma componentelor, și
un tratament distinct pe card. Un PDP standard le-ar reduce la un titlu lung și
neinteligibil.

### 6.6 Demnitate pe categoria de incontinență

Aceleași componente, alt registru: fără ton vesel, fără infantilizare, fotografie
sobră, limbaj clinic-dar-cald, filtrele potrivite (talie, absorbție) în prim-plan.
E o decizie de design explicită, nu o omisiune.

### 6.6b Costul livrării în blocul de cumpărare, nu în checkout

Cel mai direct transferabil finding din tot benchmark-ul. Baymard: *„Product Pages Need
to Show 'Estimated Shipping Costs' (Yet 43% of Sites Don't)"* **[confirmat — titlu]**,
iar **64% dintre utilizatori caută costul livrării pe pagina de produs înainte să
adauge în coș** **[dedus]**.

Se leagă direct de abandonul de coș: **70,22% rata globală**, iar motivul #1 sunt
**costurile suplimentare — 48%** **[dedus — Baymard]**. Costul ascuns până la checkout
e chiar mecanismul abandonului.

Avem toate datele reale ca să fim expliciți **[confirmat]**:

> **Livrare 24,90 lei** · easybox 15 lei · **gratuit peste 200 lei**
> Comandat azi → **livrat în 1–3 zile lucrătoare**

Sub buton, nu în footer, nu în checkout. Onest inclusiv pe partea neplăcută: comenzile
de vineri după 14:00 și din weekend se procesează luni/marți **[confirmat]** — mai bine
o spunem decât să promitem și să ratăm.

### 6.7 Încredere

Metode de plată reale — **ramburs + card Visa/Mastercard/Maestro prin PayU și MobilPay,
3D Secure** **[confirmat]**. Retur **14 zile** (nu „gratuit"). **ANPC/SAL** — fără SOL.
Contact vizibil: 0374 072 222, info@smartinoshop.ro **[confirmat]**. Plus modulul de
magazine fizice, care e un diferențiator real.

### 6.8 Performanță și accesibilitate

- `srcset` de pe CDN-ul Shopify cu parametrul `width`; `loading="lazy"` sub fold;
  hero-ul preîncărcat
- Aspect-ratio rezervat pe toate imaginile → **fără CLS**
- Țintă **LCP < 2,5 s**; fără framework UI, JS minim, Swiper doar unde chiar e carusel
- Contrast ≥ 4.5:1, focus states vizibile, `alt` real, navigare completă din tastatură,
  drawere cu focus trap și `Esc`

---

## 7. Ce îmi trebuie de la tine

Lista e ordonată după cât deblochează. Nimic de aici nu poate fi completat din
imaginație — regula din `CLAUDE.md`.

### 7.1 Blocant pentru Faza 1

| # | Ce | De ce blochează |
| --- | --- | --- |
| 1 | **`data/products.json` + `data/collections.json`** | Fără ele nu există niciun preț, nicio imagine, niciun titlu real. Rulează `node scripts/fetch-shopify-data.mjs` de pe calculatorul tău și fă commit pe `data/`. **Deblochează simultan datele, imaginile ȘI logo-ul** (§3.1). |
| 2 | **Brand kit** — logo SVG/PNG, culori hex, fonturi | Direcția vizuală din §3 e completă ca sistem, dar culoarea primară e literalmente un placeholder. Alternativ: `settings_data.json` din tema actuală. |
| 3 | **Confirmarea regulii de promoție** | „Cadou la 500 lei" nu are nicio dovadă; confirmat e „livrare gratuită peste 200 lei". Care e regula reală acum? (§1.1) |
| 4 | **Sursa temei Ella** — `sections/`, `snippets/`, `config/settings_schema.json` | Ca `ella-mapping.md` să fie bazat pe temă, nu pe documentație publică. Vezi §8. |

### 7.2 Ar îmbunătăți semnificativ rezultatul

| # | Ce |
| --- | --- |
| 5 | **Arborele real de meniu** — ce e top-level, ce e sub-categorie, ordinea. Mega-menu-ul e proiectat pe el. |
| 6 | Textul real de pe **Despre Noi** (am doar o parafrază în engleză) și copy-ul real de hero |
| 7 | Lista completă de branduri de pe `/pages/branduri` |
| 8 | **Analytics:** mix real de trafic mobil/desktop, rata de conversie, AOV, top SKU-uri, top pagini de intrare, **termeni căutați pe site**. Ultimul ar schimba direct ce punem în căutarea predictivă și în mega-menu. |
| 9 | Numele curierului și dacă livrarea la locker chiar există (linia „EasyBox 15 lei" sugerează Sameday, dar nu e afirmat) |
| 10 | Ce URL-uri ANPC/SAL vrei în footer |
| 11 | Dacă `scutece-adulți` și `scutece-pentru-adulti` sunt o separare intenționată sau un duplicat de unificat |
| 12 | Ce e `smartinohome.ro` și dacă redesign-ul trebuie să împartă sistemul de identitate cu el |

### 7.3 De semnalat clientului (nu blochează designul)

- Politica de retur e mai restrictivă decât permite OUG 34/2014 (§1.2)
- SOL trebuie scos din footer — platforma e închisă din 20 iulie 2025 (§1.3)
- Defectele de IA/SEO din §2.8
- Cod poștal contradictoriu în registre pentru sediul din Otopeni (075100 vs 751000)

---

## 8. Ella — ce primim gratis și unde trebuie construit

Detaliul complet, per componentă, e în **`docs/ella-mapping.md`**. Aici doar concluziile.

**Sursa:** documentația publică Ella, citită prin conținut indexat — `halothemes.com`,
`halosoft.gitbook.io` și `themeforest.net` sunt toate blocate din sesiune, deci nicio
pagină nu a fost deschisă direct. 13 puncte rămân de verificat în theme editor
(`ella-mapping.md` §4).

### 8.1 Versiunea Ella — răspuns găsit: **Ella 6**

Întrebarea asta era deschisă. S-a închis singură când am putut deschide
`smartinohome.ro`, care servește:

```
Shopify.theme = {"name":"GIVEAWAY - Marea Deschidere","schema_name":"Ella",
                 "schema_version":"6.7.6","role":"main"}
```

**[confirmat — citit direct din sursa paginii]**

Grupul rulează deci deja **Ella 6.7.6** pe magazinul suroră. Nu e dovadă formală că
aceeași licență se aplică și pentru smartinoshop, dar e cea mai bună indicație
disponibilă și e o presupunere de lucru rezonabilă — **de confirmat cu clientul.**

**Ce înseamnă practic:** toate căile de setări din `ella-mapping.md` sunt scrise pe
arborele 6.x, deci sunt cele corecte. Și, mai important: în Ella 6 **nu** avem blocul
Custom Liquid „disponibil peste tot" din Ella 7, deci componentele care cer Liquid
rămân la efortul estimat — în special footer-ul ANPC (§8.3) și eticheta de procent.

Un avantaj neașteptat: **avem un magazin Ella 6 real, al aceluiași grup, ca referință
vie.** Multe dintre cele 13 puncte necunoscute din `ella-mapping.md` §4 se pot verifica
uitându-ne cum le rezolvă smartinohome.ro, nu doar în documentație.

### 8.2 Bilanțul

Din 60 de rânduri de componentă:

| Clasificare | Rânduri |
| --- | --- |
| **nativ**, direct | 45 |
| **nativ, cu rezerve** (asamblat, doar afișare, workaround, setup greu) | 7 |
| **secțiune modificată** | 6 |
| **secțiune nouă** | 1 |
| **necunoscut** | 1 |

Plus 13 puncte de comportament de verificat în theme editor.

**Ella acoperă nativ aproape toată lista de conversie din brief** — inclusiv bara de
progres spre livrarea gratuită (`Free Shipping Calculator Message`, prag configurabil —
îl setăm pe 200 lei), a doua imagine la hover, badge-urile Sale/New/Custom, quick add,
swatch-uri pe card, sticky add-to-cart pe mobil, căutare predictivă și filtrare
Search & Discovery.

### 8.3 Cele trei locuri unde chiar trebuie construit

| Ce | Clasificare | Efort | De ce |
| --- | --- | --- | --- |
| **Preț pe unitate (lei/bucată)** | secțiune modificată | **M** | Nu există nativ. E adăugarea cu cel mai bun raport valoare/efort din tot proiectul (§6.3). Cere un metafield pe produs + edit de Liquid pe snippet-ul de preț. |
| **Descompunere PACHET PROMO** | **secțiune nouă** | **L** | Ella nu are nimic pentru „ce conține pachetul + cât economisești față de sumă". |
| **Judge.me în tab-ul de recenzii** | secțiune modificată | **M** | Nicio documentație HaloThemes nu explică integrarea; thread-uri de comunitate arată utilizatori Ella la care widgetul cade la baza paginii. |

Plus două mai mici: **badge-ul „−X%"** (Ella declanșează badge-ul Sale automat, dar
nu e confirmat că poate randa procentul calculat) și **ANPC în footer** (setul de
blocuri de footer în Ella 6 pare închis, fără bloc generic HTML).

### 8.4 Două lucruri pe care le lăsăm oprite, deliberat

Ella livrează `Sold In Last Period` și `Someone purchased notification popup` — al
doilea cu **listă randomizată de timpi**. Fabrică dovadă socială. Contravin regulii de
urgency onestă (§6.4). Folosim **doar** `Hot stock function`, care citește inventarul
real.

### 8.5 Un cost ascuns, de bugetat

Datele care trebuie normalizate ca să funcționeze filtrele proiectate: **mărime,
interval kg, talie cm, absorbție în picături, bucăți în pachet** trăiesc azi în
**titlul produsului** **[confirmat]**. Acolo nu se pot filtra.

Trebuie mutate în opțiuni de produs sau metafield-uri. E **muncă de catalog, nu de
temă** — se poate face în bulk — dar e condiția ca PLP-ul din §6.2 să existe.
De estimat separat.

---

## 9. Referințe și benchmark-uri

Punctul 4 din brief: eMAG, Amazon, Walmart, Baymard și 2–3 magazine Shopify premium din
nișa home/beauty. **Pentru pattern-uri de conversie, nu pentru copiat.**

Aceeași limitare ca peste tot: `emag.ro`, `baymard.com`, `amazon.com` sunt blocate din
sesiune. Sursa e conținut indexat de căutare. **Titlurile de rezultat le tratez ca
sigure; cifrele din sumarizări sunt [dedus].**

### 9.1 eMAG — convenții de piață românească

| Ce | Dovadă |
| --- | --- |
| **Starea filtrelor trăiește în URL**, ca segmente de cale lizibile și indexabile: `/cafea/filter/forma-produs-f8408,boabe-v-6124346/aroma-f8410,ciocolata-v-6124375/c` | **[confirmat — din URL-uri indexate]** |
| **Starea promo e fațetă de primă clasă** — `super-pret`, `top-favorite` | **[confirmat — din slug-uri]** |
| Sortări oferite: Relevanță, Cele mai populare, Preț ↑, Preț ↓, Număr de review-uri, **Procent reducere** | **[dedus]** |
| Paginare cu **60 / 80 / 100** produse pe pagină — *nu* infinite scroll | **[dedus]** |
| **„Adaugă în coș"** e eticheta standard de CTA | **[dedus]** |
| Recenzii cu **„Achiziție verificată"** | **[dedus]** |

**Ce luăm:** filtrele în URL (shareable, bookmarkabil — cumpărătorul român e obișnuit
cu asta) și reducerea ca fațetă, nu doar ca badge.

**Ce nu luăm:** densitatea eMAG. E un marketplace cu milioane de SKU-uri; Smartino are
~2.000 și un brand propriu de apărat.

### 9.2 Mixul de plată din România — schimbă ce blocuri contează

| | |
| --- | --- |
| **Ramburs ≈ 51% din comenzi (2025)** | **[dedus]** |
| Card ≈ 70% din tranzacțiile online | **[dedus]** |
| **Rate = până la 30% din tranzacții, cu AOV de ~3× față de plata integrală** | **[dedus]** |

Rambursul nu e o relicvă — e **majoritar**. Deci „Plata la livrare" nu se ascunde în
checkout, se spune lângă buton, ca reasigurare. Smartino îl are confirmat.

**Ratele sunt o recomandare pentru client, nu ceva ce construiesc.** Smartino are
confirmat doar ramburs + card prin PayU/MobilPay **[confirmat]**. Dacă segmentul cu AOV
3× contează, e o discuție comercială separată — n-o presupun în design.

### 9.3 Baymard — findings-urile pe care le-am folosit efectiv

Fiecare e legat de o componentă concretă, nu citat decorativ.

| Finding | Unde l-am aplicat |
| --- | --- |
| *„Product Pages Need to Show 'Estimated Shipping Costs' (Yet 43% of Sites Don't)"*; **64%** caută costul livrării pe PDP înainte de add-to-cart | §6.6b — cost + termen în blocul de cumpărare |
| Abandon coș **70,22%**; motiv #1 **costuri suplimentare, 48%** | §6.6b |
| *„Highlight Items Already in the User's Cart"* — **96%** nu o fac | §6.3c |
| *„Grocery: Update the Add to Cart Button to a Quantity Selector"* | §6.3b |
| *„Have Filters for All Displayed List Item Info"* — **38%** nu o fac | §6.2 |
| Doar **36%** oferă toate cele patru sortări esențiale; **20%** nu arată filtrele active | §6.2 |
| **34%** n-au breadcrumb ierarhic | §5.4 |
| **Load More + lazy-load bate și paginarea, și infinite scroll** | §5.4 |
| Pagini de categorie intermediare → promovează subcategoriile cu **thumbnail-uri** | §5.2, §5.4 |

**O divergență pe care o iau conștient:** Baymard recomandă Load More; eMAG face
paginare 60/80/100. Merg pe **Load More**, pentru că infinite scroll strică
bookmarking-ul și accesul la footer — unde stă exact pictograma SAL obligatorie (§1.3).

### 9.4 Magazine premium — trei lecții structurale

Toate **[dedus]** — surse secundare, niciun magazin deschis direct.

**Soko Glam (K-beauty).** Diagnosticul lor e util: problema de conversie în K-beauty nu
e prețul, e **supraîncărcarea educațională** — rutine în mai mulți pași, ingrediente
necunoscute, categorii care se suprapun. Magazinele bune o rezolvă **în fluxul de
cumpărare**, nu într-un blog separat. Și vând **kituri de rutină ca produse de sine
stătătoare**, nu ca upsell pe PDP.

→ Smartino are deja tiparul: `pachet-promo-ingrijire-ten`, `seturi-cadou`, „Pachet
Promoțional Cosmetice Coreene" **[confirmat]**. Nu trebuie inventat, trebuie **tratat
ca produs de primă clasă** — exact ce spune §6.5.

**Lalo (baby).** PDP aerisit, imagini alese să arate **textura și calitatea execuției**
ca proxy pentru siguranță. Trust marks din presă terță, nu doar stele proprii.

**Blueland / Branch Basics (home care).** Catalog organizat **pe treabă de făcut**, un
SKU per treabă (multi-suprafețe, geamuri, baie, vase, rufe), cu sistem de rezerve —
astfel a doua achiziție e structural diferită de prima.

→ Relevant direct pentru verticala de curățenie a Smartino, care azi e organizată pe
tip de produs. Merită discutat cu clientul ca variantă de IA — **nu o schimb unilateral**.

### 9.5 Ce a rămas necunoscut

- **Ordinea exactă a blocurilor** pe PDP-ul și pagina de categorie eMAG — neindexată
- Ordinea exactă a blocurilor pe **Walmart PDP**
- Pragurile curente de livrare gratuită eMAG/Genius — surse contradictorii (30 / 100 /
  400 / 1500 lei)
- Dacă cerința SAL-only e pe deplin în vigoare în august 2026 — **de verificat juridic**
- Conținutul noilor obligații pentru magazinele online din **28 iunie 2025**

---

## 10. Ce urmează, dacă aprobi

Ordinea de lucru, o pagină pe rând, cu screenshot desktop (1440) + mobil (390),
verificate critic înainte să ți le arăt, apoi commit + push. **Nu trec mai departe
până nu confirmi fiecare.**

| # | Livrabil | Depinde de |
| --- | --- | --- |
| 0 | Setup: 11ty + Liquid, tokens CSS, sistemul de grilă | — |
| 1 | Header + footer + bară de anunț + căutare predictivă | date reale |
| 2 | Home | (1) |
| 3 | PLP „scutece copii" — filtre, sortare, load more | (1) |
| 4 | PLP „produse incontinență" — validează fațetele pe a doua taxonomie | (3) |
| 5 | PDP SKU simplu | (1) |
| 6 | PDP PACHET PROMO | (5) |
| 7 | Cart drawer + pagină coș | (1) |
| 8 | Deploy GitHub Pages + README | — |

**Nota tehnică care merită decizia ta acum:** propun **11ty cu template-uri Liquid**,
nu Vite. Motivul e practic — **11ty randează nativ Liquid**, deci template-urile
prototipului devin aproape drop-in pentru secțiunile Shopify. Aceeași buclă
`{% for product in collection.products %}` merge în ambele locuri. Reduce direct
riscul de „arată altfel în implementare" pe care prototipul e menit să-l elimine.

Restul stack-ului conform brief-ului: fără framework UI, CSS custom properties, fără
Tailwind/Bootstrap, Swiper doar unde chiar e carusel.

**Nu încep să codez până nu aprobi.**

---

## Anexă — surse

Cercetarea completă, cu marcaje per afirmație, e în dosarul de recon al sesiunii.
Sursele principale:

**Site (indexat, nu deschis):** `smartinoshop.ro` — `/`, `/pages/despre-noi`,
`/pages/intrebari-frecvente`, `/pages/politica-de-retur`, `/pages/metode-de-plata`,
`/pages/termeni-si-conditii`, `/pages/contact`, `/pages/branduri`,
`/pages/smartino-supermarket`, `/collections/*`, `/products/*`, `/blogs/blog/*`

**Registre:** termene.ro, listafirme.eu, targetare.ro, risco.ro, confidas.ro,
topfirme.com, emis.com

**Presă:** revistaprogresiv.ro (interviu — poziționarea pe preț), economica.net,
capital.ro, adevarul.ro, realitatea.net, click.ro, magister.ro

**Social:** facebook.com/smartinoshop.ro, instagram.com/smartino.ro,
tiktok.com/@smartinoshop.ro

**Recenzii:** judge.me/reviews/stores/smartinoshop.ro

**Ella:** halosoft.gitbook.io/ella-documentation, halosoft.gitbook.io/ella-7-documentation,
halothemes.net, themeforest.net

**Legal:** iubenda, Taylor Wessing, Kluwer Mediation Blog,
consumer-redress.ec.europa.eu (închiderea platformei ODR)
