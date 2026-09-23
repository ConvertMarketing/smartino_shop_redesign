/**
 * Packshot-urile din panoul de newsletter al footer-ului. Doar produse reale,
 * active, cu PNG pe fundal transparent (verificat pe canvas — scratchpad/alpha2.mjs;
 * scutecele Sleepy pentru copii nu au deocamdată packshot transparent în catalog).
 *  x  = poziția centrului, în % din lățimea benzii
 *  w  = lățimea în px pe desktop (pe mobil se scalează din CSS)
 *  r  = rotația în grade
 *  b  = offset față de marginea de jos; negativ = intră sub margine (tăiat)
 *  mobile = rămâne vizibil sub 640px
 */
export default [
  { handle: 'lavete-umede-pentru-curatare-pardoseli-sleepy-easy-clean-herbal-soap-50buc', x: 6, w: 200, r: -9, b: -30 },
  { handle: 'lavete-umede-pentru-curatare-pardoseli-sleepy-easy-clean-white-soap-50buc', x: 17, w: 210, r: 5, b: -35, mobile: true },
  { handle: 'solutie-spray-pentru-curatare-bucatarie-kalyon-750ml', x: 31, w: 130, r: -10, b: -20, mobile: true },
  { handle: 'burete-de-vase-macromax-color-10-buc', x: 40, w: 220, r: 6, b: -60 },
  { handle: 'scutece-adulți-dailee-slip-maxi-plus-m-80-135-cm-8-5-pic-28-buc', x: 50, w: 220, r: -4, b: -50, mobile: true },
  { handle: 'unleashia-sisua-popcorn-syrup-lip-plumper-n1-strawberry-cream', x: 63, w: 120, r: 12, b: -5 },
  { handle: 'servetele-batiste-nazale-copii-6-buc-3-str', x: 74, w: 190, r: -7, b: -55, mobile: true },
  { handle: 'remaple-spray-curatare-bucatarie-750ml', x: 85, w: 190, r: 8, b: -30 },
  { handle: 'unleashia-paleta-farduri-ochi-cu-glitter-n1-all-of-glitter-6-2g', x: 93, w: 130, r: -12, b: -30, mobile: true },
];
