import catalog from './catalog.js';

const byHandle = new Map(catalog.collections.map((c) => [c.handle, c]));
const has = (h) => byHandle.has(h);
const title = (h, fallback) => (byHandle.get(h)?.title || fallback);

/** Construiește o coloană de mega-menu doar din colecțiile care există cu produse. */
const col = (heading, handles) => ({
  title: heading,
  links: handles
    .filter(has)
    .map((h) => ({ title: title(h), url: `/collections/${h}/` })),
});

const keep = (c) => c.links.length > 0;

/**
 * Gruparea urmează categoriile confirmate din catalog (docs/design-brief.md §2.7).
 * Cele două publicuri foarte diferite — bebeluși și incontinență — primesc
 * intrări separate de nivel 1, ca fiecare să se auto-selecteze rapid.
 */
const primary = [
  {
    title: 'Bebeluși',
    url: '/collections/scutece-copii/',
    children: [
      col('Scutece', ['scutece-copii', 'scutece-chilotel', 'scutece-si-chilotei-copii', 'pachete-promo-scutece-copii']),
      col('Șervețele', ['servetele-umede-bebelusi', 'servetele-umede']),
      col('Îngrijire', ['ingrijire-copii', 'kit-igiena-scoala']),
    ].filter(keep),
  },
  {
    title: 'Incontinență',
    url: '/collections/produse-incontinenta/',
    children: [
      col('Scutece adulți', ['scutece-adulți', 'scutece-pentru-adulti', 'produse-incontinenta']),
      col('Protecție & igienă', ['servetele-umede-incontinenta', 'igiena-intima']),
    ].filter(keep),
  },
  {
    title: 'Curățenie',
    url: '/collections/curatenie-intretinere/',
    children: [
      col('Rufe & vase', ['detergent-rufe', 'balsam-rufe', 'detergent-vase', 'capsule-pentru-masina-de-spalat']),
      col('Suprafețe', ['solutii-suprafete-baie', 'solutie-curata-podele', 'solutie-curatat-geamuri']),
      col('Ustensile', ['lavete', 'mop-si-lavete', 'bureti-vase', 'manusi-unica-folosinta', 'saci-gunoi']),
      col('Branduri', ['produse-macromax', 'scrub-daddy']),
    ].filter(keep),
  },
  {
    title: 'Hârtie',
    url: '/collections/produse-din-hartie/',
    children: [
      col('Produse din hârtie', ['hartie-igienica', 'prosoape-de-bucatarie', 'batiste-nazale', 'servetele-faciale']),
    ].filter(keep),
  },
  {
    title: 'Îngrijire personală',
    url: '/collections/produse-ingrijire-personala/',
    children: [
      col('Corp & păr', ['ingrijire-corp', 'ingrijire-par', 'șampoane', 'sapunuri']),
      col('Igienă', ['igiena-orala', 'periute-de-dinti-electrice', 'igiena-intima']),
    ].filter(keep),
  },
  {
    title: 'Cosmetice coreene',
    url: '/collections/cosmetice-coreene/',
    badge: 'Importator oficial',
    children: [
      col('Îngrijirea pielii', ['cosmetice-coreene', 'ingrijirea-pielii', 'tonere-pentru-fata', 'pachet-promo-ingrijire-ten']),
      col('Machiaj', ['machiaje', 'fond-de-ten', 'paleta-de-farduri-1', 'eyeliner', 'tint', 'creion-pentru-sprancene']),
      col('Branduri', ['unleashia', 'luvum', 'pyunkang-yul']),
    ].filter(keep),
  },
  { title: 'Reduceri', url: '/collections/reduceri/', highlight: true },
].filter((i) => !i.children || i.children.length > 0);

export default {
  primary,
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
