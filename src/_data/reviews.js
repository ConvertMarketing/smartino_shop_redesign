/*  ⚠️  DATE FABRICATE — NU SUNT RECENZII REALE  ⚠️
 *  ============================================================================
 *  Nimic din acest fișier nu vine de la clienți. Notele, numărul de recenzii,
 *  numele și textele sunt generate aici, ca prototipul să arate cum va arăta
 *  secțiunea când datele vin de la Judge.me.
 *
 *  Cerut explicit de client pentru faza de prototip. La implementare, TOT
 *  fișierul se șterge și se înlocuiește cu feed-ul Judge.me — vezi
 *  docs/ella-mapping.md §3.5/C5. Nu duplica logica de aici în cod de producție.
 *
 *  Ca să nu poată fi confundate cu recenzii reale, secțiunea le afișează cu o
 *  etichetă vizibilă („date demonstrative"), controlată de flag-ul de mai jos.
 *  ============================================================================
 */
import catalog from './catalog.js';

/* Marchează vizibil în pagină că datele sunt simulate. Se scoate la implementare.
   Atenție: fișierul are DOAR export implicit. Cu un export numit alături, 11ty
   expune tot spațiul modulului, iar datele ajung la `reviews.default.…`. */
const DEMO = true;

/* Generator determinist: același produs primește mereu aceleași valori, ca
   screenshot-urile și verificările să fie reproductibile. */
function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

const NUME = [
  'Andreea M.', 'Cristina P.', 'Elena D.', 'Ioana R.', 'Mihaela T.', 'Raluca S.',
  'Alina B.', 'Diana V.', 'Gabriela N.', 'Roxana C.', 'Simona L.', 'Adriana F.',
  'Bogdan I.', 'Cătălin G.', 'Daniel A.', 'Florin E.', 'Marius O.', 'Radu Ș.',
  'Vlad H.', 'George K.', 'Monica Z.', 'Laura J.', 'Oana U.', 'Nicoleta W.',
];

/* Texte pe categorie, ca recenzia să aibă legătură cu produsul. */
const TEXTE = {
  bebelusi: [
    'Le folosim de câteva luni și nu am avut nicio scurgere noaptea. Se închid bine și nu lasă urme pe piele.',
    'Am comandat mărimea 4 pentru fetița mea de 10 kg și vine perfect. Absorb bine, iar prețul pe bucată e cel mai bun pe care l-am găsit.',
    'Foarte bune pentru somn. Am încercat trei branduri până acum și astea rezistă cel mai mult.',
    'Livrare rapidă, produsul exact ca în descriere. Am luat pachetul mare, iese mult mai ieftin.',
    'Elasticul e moale și nu strânge. Singurul minus: ambalajul se rupe cam ușor.',
  ],
  incontinenta: [
    'Le iau pentru mama și sunt foarte mulțumită. Absorbția e bună, iar materialul nu irită.',
    'Comandă a treia oară. Se închid bine, nu foșnesc și nu lasă mirosuri.',
    'Raport calitate-preț foarte bun față de ce găsim în farmacii. Livrarea a venit în două zile.',
    'Mărimea L e potrivită pentru talia indicată. Recomand pachetul mare, iese sensibil mai ieftin.',
  ],
  servetele: [
    'Sunt umede cât trebuie și nu se rup. Capacul se închide etanș, nu se usucă.',
    'Le cumpăr la pachet și îmi ajung câteva luni. Preț foarte bun pe bucată.',
    'Miros discret, nu chimic. Le folosesc și pentru bucătărie.',
    'Groase și rezistente. Mult mai bune decât cele din supermarket la același preț.',
  ],
  curatenie: [
    'Curăță excelent și nu lasă urme pe gresie. Un pachet ține foarte mult.',
    'Am luat setul mare și mă bucur că am făcut-o. Calitate bună, preț corect.',
    'Materialul e rezistent, le-am spălat de mai multe ori și arată ca noi.',
    'Fac treaba bine pe suprafețe lucioase. Le recomand pentru curățenia de întreținere.',
    'Comandat luni, livrat miercuri. Produs conform, ambalaj intact.',
  ],
  cosmetice: [
    'Textura e ușoară și se absoarbe repede. Se vede diferența după două săptămâni.',
    'Produs original, ambalaj sigilat. Am mai comandat și înainte, sunt constanți.',
    'Nu irită pielea sensibilă. Mă bucur că se găsește și la noi la preț rezonabil.',
    'Exact ce căutam. Livrare rapidă și bine ambalat.',
  ],
  general: [
    'Produs bun, exact cum e descris. Livrare rapidă.',
    'Comandă a doua oară. Preț bun și calitate constantă.',
    'Ambalaj intact, produs conform. Recomand.',
    'Raport calitate-preț foarte bun. Voi mai comanda.',
  ],
};

/* Texte pentru notele sub 5, pe home. O recenzie de 3 stele cu text entuziast
   se citește fals — și exact asta arată că datele sunt inventate. Fondul e
   generic intenționat: se potrivește oricărui produs, fără să promită nimic. */
const NUANTAT = {
  4: [
    'Produsul e bun și l-aș mai lua. Livrarea a întârziat o zi față de estimare.',
    'Face treaba, dar ambalajul a venit ușor deteriorat. Conținutul, intact.',
  ],
  3: [
    'E ok pentru preț, dar nu m-a impresionat. Am mai avut altul mai bun.',
    'Corespunde descrierii, însă mă așteptam la ceva mai rezistent.',
  ],
};

function familie(p) {
  const t = `${p.type || ''} ${p.title}`.toLowerCase();
  /* Ordinea contează: „Șervețele umede pentru bebeluși" conține și „bebeluși",
     iar un text despre mărimea scutecului pe un pachet de șervețele se vede. */
  /* „Lavete umede" sunt șervețele; „lavete din microfibră" sunt uscate și
     n-au capac care se închide etanș. */
  if (/[șs]erve[țt]el|prosoape umede|lavet[ei]?\s+umed/.test(t)) return 'servetele';
  if (/lavet|mop|burete/.test(t)) return 'curatenie';
  if (/incontinen|adul[țt]|aleze|absorbante/.test(t)) return 'incontinenta';
  if (/scutec|chilo[țt]el|bebelu/.test(t)) return 'bebelusi';
  if (/cur[ăa][țt]|detergent|balsam|mop|dezinfect|odorizant/.test(t)) return 'curatenie';
  if (/serum|crem|masc|fond|farduri|[șs]ampon|gel de du[șs]|ten/.test(t)) return 'cosmetice';
  return 'general';
}

/**
 * Nota și numărul de recenzii pentru un produs.
 *
 * Două lucruri ținute realiste dinadins, ca prototipul să nu arate mai bine
 * decât va arăta magazinul: majoritatea produselor n-au nicio recenzie, iar
 * cele care au, au zeci, nu sute. Cu 3 recenzii pe fiecare din cele 1.203 de
 * produse ieșeau 88.700 în total — o cifră pe care n-o are magazinul.
 */
function ratingFor(p) {
  const rnd = seed(p.handle);
  /* Doar 36% dintre produse au recenzii; restul rămân cu slotul gol, ca în
     realitate. Cardul și pagina de produs trebuie să arate bine și așa. */
  if (rnd() > 0.36) return { avg: 0, count: 0, stars: 0 };
  const r = rnd();
  /* 62% iau 5 stele, 30% iau 4, restul 3 — tipic pentru produse uzuale. */
  const stars = r < 0.62 ? 5 : r < 0.92 ? 4 : 3;
  const avg = Math.min(5, Math.round((stars - rnd() * 0.4) * 10) / 10);
  const count = 3 + Math.floor(rnd() * 46);
  return { avg, count, stars };
}

/** Trei recenzii pentru un produs: note în jurul mediei lui, texte din
 *  categoria potrivită, autori și date distincte. */
function listFor(p, r) {
  if (!r.count) return [];
  const rnd = seed(`${p.handle}#rev`);
  const pool = TEXTE[familie(p)];
  const n = Math.min(3, pool.length);
  const txt = [...pool];
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const t = txt.splice(Math.floor(rnd() * txt.length), 1)[0];
    /* Notele oscilează în jurul mediei, nu sunt toate 5 — altfel media de 3,8
       din antet ar contrazice cele trei recenzii de sub ea. */
    const delta = i === 0 ? 0 : (rnd() < 0.5 ? -1 : 0);
    const stars = Math.max(1, Math.min(5, Math.round(r.avg) + delta));
    const zile = 3 + Math.floor(rnd() * 120);
    const d = new Date(Date.parse('2026-08-20T00:00:00Z') - zile * 864e5);
    out.push({
      autor: NUME[(Math.floor(rnd() * NUME.length) + i * 5) % NUME.length],
      stars,
      text: t,
      data: d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }
  return out.sort((a, b) => b.stars - a.stars);
}

const byHandle = {};
for (const p of catalog.products) {
  const r = ratingFor(p);
  byHandle[p.handle] = { ...r, list: listFor(p, r) };
}

/* Media pe magazin, calculată din valorile de mai sus — ca cifra din antet să
   fie consistentă cu ce scrie pe carduri. */
const all = Object.values(byHandle).filter((r) => r.count > 0);
const total = all.reduce((n, r) => n + r.count, 0);
const avg = Math.round((all.reduce((n, r) => n + r.avg * r.count, 0) / total) * 10) / 10;

/* Distribuția pe stele, pentru barele din antet. Nu o deduc din media pe
   produs — asta ar da 0% la 1 și 2 stele, adică exact semnătura unui set de
   date inventat. Împrăștii recenziile fiecărui produs în jurul mediei lui,
   cu o coadă mică în jos, cum arată un magazin real. */
const dist = (() => {
  const n = [0, 0, 0, 0, 0]; /* index 0 = 1 stea */
  all.forEach((r) => {
    const w = [5, 4, 3, 2, 1].map((s) => Math.exp(-Math.abs(s - r.avg) * 2.1));
    const sum = w.reduce((a, b) => a + b, 0);
    [5, 4, 3, 2, 1].forEach((s, i) => { n[s - 1] += (r.count * w[i]) / sum; });
  });
  const round = n.map((x) => Math.round(x));
  const t = round.reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: round[s - 1],
    pct: Math.round((round[s - 1] / t) * 100),
  }));
})();

/* Recenziile afișate pe home: produse reale, cu text din categoria potrivită.
   Două reguli, ca raftul să nu se citească fals:
   – note amestecate, nu șase de cinci stele. Antetul spune 4,4 și că notele
     mici rămân afișate; șase carduri identice de 5★ ar contrazice și una,
     și alta.
   – texte distincte. Fondul pe categorie e mic, iar două carduri alăturate cu
     aceeași frază se văd imediat. */
const featured = (() => {
  const cand = catalog.products.filter(
    (p) => p.available && p.image && byHandle[p.handle].count >= 8,
  );
  const luate = [];
  const vendori = new Set();
  const texte = new Set();
  /* Compoziția țintă: patru recenzii bune, una de 4 și una de 3. */
  [5, 5, 5, 5, 4, 3].forEach((nota) => {
    const p = cand.find((q) => {
      if (luate.includes(q)) return false;
      if (Math.round(byHandle[q.handle].avg) !== nota) return false;
      if (vendori.has(q.vendor)) return false;
      return TEXTE[familie(q)].some((t) => !texte.has(t));
    });
    if (!p) return;
    luate.push(p);
    vendori.add(p.vendor);
    texte.add(TEXTE[familie(p)].find((t) => !texte.has(t)));
  });
  return luate.map((p, i) => {
    const rnd = seed(`${p.handle}-rev`);
    const zile = 2 + Math.floor(rnd() * 80);
    const d = new Date(Date.parse('2026-08-20T00:00:00Z') - zile * 864e5);
    const pool = TEXTE[familie(p)];
    const nota = Math.round(byHandle[p.handle].avg);
    return {
      handle: p.handle,
      product: p.title,
      image: p.image,
      stars: nota,
      /* Autori distincți: doi „Cătălin G." în același raft se văd. */
      autor: NUME[(i * 4) % NUME.length],
      /* Sub 5 stele, textul vine din fondul nuanțat, nu din cel pe categorie. */
      text: nota < 5 ? NUANTAT[nota][i % NUANTAT[nota].length] : ([...texte][i] || pick(rnd, pool)),
      data: d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  });
})();

export default {
  DEMO, avg, total, dist, featured, byHandle,
  /* Câte produse au recenzii — folosit în antetul secțiunii. */
  rated: all.length,
};
