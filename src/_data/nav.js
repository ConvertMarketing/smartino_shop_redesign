import catalog from './catalog.js';

const byHandle = new Map(catalog.collections.map((c) => [c.handle, c]));
const has = (h) => byHandle.has(h);
const titleOf = (h) => byHandle.get(h)?.title || h;
const countOf = (h) => byHandle.get(h)?.count || 0;

/**
 * Colecții interne care nu au ce căuta în navigație. Sunt artefacte reale din
 * catalog — teste, duplicate și colecții sezoniere vechi. De semnalat clientului
 * pentru curățenie, dar între timp nu le arătăm clienților lui.
 */
const HIDDEN = /(^|-)(test|cr)$|reelup|do-not-delete|^cosmetice-1$|craciun-202[0-4]/i;

const link = (h) => (has(h) && !HIDDEN.test(h)
  ? { title: titleOf(h), url: `/collections/${h}/`, count: countOf(h) }
  : null);

const col = (heading, handles) => {
  const links = handles.map(link).filter(Boolean);
  return links.length ? { title: heading, links } : null;
};

/**
 * Categoriile de nivel 1 pentru railul vertical. Ordinea urmează publicurile
 * confirmate (design-brief.md §2.4): bebeluși și incontinență primesc intrări
 * separate, ca fiecare public să se auto-selecteze imediat.
 * `icon` trimite la un simbol din components/icons.liquid — fără emoji.
 */
const primary = [
  {
    title: 'Scutece bebeluși', icon: 'baby', url: '/collections/scutece-copii/',
    children: [
      col('Scutece', ['scutece-copii', 'scutece-si-chilotei-copii', 'scutece-chilotel']),
      col('Șervețele', ['servetele-umede-bebelusi', 'servetele-doyfresh']),
      col('Îngrijire', ['ingrijire-copii', 'kit-igiena-scoala']),
      col('Pachete promo', ['pachete-promo-scutece-copii', 'pachete-promotionale']),
    ].filter(Boolean),
  },
  {
    // Nu există o colecție `produse-incontinenta` curată — doar varianta de
    // Crăciun. Reale sunt cele două colecții duplicate de adulți (design-brief §2.8).
    title: 'Incontinență adulți', icon: 'shield', url: '/collections/scutece-pentru-adulti/',
    children: [
      col('Scutece adulți', ['scutece-pentru-adulti', 'scutece-adulți']),
      col('Igienă', ['servetele-umede-incontinenta', 'igiena-intima']),
    ].filter(Boolean),
  },
  {
    title: 'Șervețele umede', icon: 'wipes', url: '/collections/servetele-umede/',
    children: [
      col('Pe utilizare', ['servetele-umede-bebelusi', 'servetele-umede-multisuprafete', 'servetele-umede-pardoseli', 'servetele-faciale']),
      col('Easy Clean', ['servețele-umede-easy-clean', 'servetele-bucatarie-easyclean']),
    ].filter(Boolean),
  },
  {
    title: 'Curățenie & menaj', icon: 'spray', url: '/collections/curatenie-intretinere/',
    children: [
      col('Rufe & vase', ['detergent-rufe', 'balsam-rufe', 'balsam-si-detergent-rufe', 'detergent-vase', 'capsule-pentru-masina-de-spalat']),
      col('Suprafețe', ['solutii-suprafete-baie', 'solutie-curata-podele', 'solutie-curatat-geamuri']),
      col('Ustensile', ['mop-si-lavete', 'lavete', 'lavete-umede-mop', 'bureti-vase', 'manusi-unica-folosinta', 'saci-gunoi']),
      col('Branduri', ['produse-macromax', 'scrub-daddy', 'perlux']),
    ].filter(Boolean),
  },
  {
    title: 'Produse din hârtie', icon: 'paper', url: '/collections/produse-din-hartie/',
    children: [
      col('Hârtie', ['hartie-igienica', 'prosoape-de-bucatarie', 'batiste-nazale', 'servetele-faciale']),
    ].filter(Boolean),
  },
  {
    title: 'Bucătărie', icon: 'kitchen', url: '/collections/produse-pentru-bucatarie/',
    children: [
      col('Bucătărie', ['produse-pentru-bucatarie', 'echipamente-si-accesorii', 'rafturi-depozitare']),
    ].filter(Boolean),
  },
  {
    title: 'Îngrijire personală', icon: 'care', url: '/collections/produse-ingrijire-personala/',
    children: [
      col('Corp & păr', ['ingrijire-corp', 'ingrijire-par', 'șampoane', 'sapunuri']),
      col('Igienă', ['igiena-orala', 'jtf-periute-de-dinti-electrice', 'igiena-intima']),
    ].filter(Boolean),
  },
  {
    title: 'Cosmetice coreene', icon: 'beauty', url: '/collections/cosmetice-coreene/',
    flag: 'Importator oficial',
    children: [
      col('Îngrijirea pielii', ['cosmetice-coreene', 'ingrijirea-pielii', 'tonere-pentru-fata', 'pachet-promo-ingrijire-ten']),
      col('Branduri', ['unleashia', 'luvum', 'pyunkang-yul']),
      col('Promoții', ['promotii-cosmetice-coreene', 'seturi-cadou']),
    ].filter(Boolean),
  },
  {
    title: 'Machiaj', icon: 'makeup', url: '/collections/machiaje/',
    children: [
      col('Machiaj', ['machiaje', 'fond-de-ten', 'paleta-de-farduri-1', 'eyeliner', 'tint', 'creion-pentru-sprancene']),
      col('Accesorii', ['frigidere-cosmetice']),
    ].filter(Boolean),
  },
  {
    title: 'Îngrijire animale', icon: 'pet', url: '/collections/produse-ingrijire-animale/',
    children: [col('Animale', ['produse-ingrijire-animale', 'servetele-umede-animale'])].filter(Boolean) },
  {
    title: 'Încălțăminte', icon: 'shoe', url: '/collections/incaltaminte/', children: [] },
  {
    title: 'Diverse', icon: 'dots', url: '/collections/diverse/', children: [] },
]
  .map((i) => ({ ...i, children: (i.children || []).filter(Boolean) }))
  .filter((i) => has(i.url.split('/')[2]));

/** Link-uri promo din bara de sus, lângă butonul de categorii. */
const promo = [
  { title: 'Reduceri', url: '/collections/reduceri/', hot: true },
  { title: 'Pachete promo', url: '/collections/pachete-promotionale/' },
  { title: 'Cele mai vândute', url: '/collections/best-seller/' },
  { title: 'Noutăți', url: '/collections/cele-mai-recente/' },
].filter((l) => has(l.url.split('/')[2]));

export default {
  primary,
  promo,
  footer: {
    ajutor: [
      { title: 'Întrebări frecvente', url: '/pages/intrebari-frecvente/' },
      { title: 'Livrare', url: '/pages/livrare/' },
      { title: 'Politica de retur', url: '/pages/politica-de-retur/' },
      { title: 'Metode de plată', url: '/pages/metode-de-plata/' },
      { title: 'Contact', url: '/pages/contact/' },
    ],
    despre: [
      { title: 'Despre noi', url: '/pages/despre-noi/' },
      { title: 'Branduri', url: '/pages/branduri/' },
      { title: 'Smartino Supermarket', url: '/pages/smartino-supermarket/' },
      { title: 'Cariere', url: '/pages/cariere/' },
    ],
    legal: [
      { title: 'Termeni și condiții', url: '/pages/termeni-si-conditii/' },
      { title: 'Politica de confidențialitate', url: '/pages/politica-de-confidentialitate/' },
      { title: 'Politica de cookies', url: '/pages/politica-de-cookies/' },
    ],
  },
};
