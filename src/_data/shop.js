/**
 * Constantele comerciale ale magazinului — o singură sursă de adevăr.
 *
 * Pragul de livrare gratuită apărea în șase locuri (app.js, bara de anunț,
 * slide-ul de hero, bara de USP-uri, cart drawer, footer). La prima schimbare
 * de campanie, cinci dintre ele ar fi rămas în urmă.
 *
 * La portarea în Ella, astea devin setări de temă (Settings → Cart → Free
 * shipping threshold) sau metafields de magazin — vezi docs/ella-mapping.md §3.6.
 */
export default {
  /** Regula reală de pe site: „Livrare GRATUITĂ la comenzile de peste 200 LEI". */
  freeShipping: 200,
  /** Curier standard. */
  shippingFee: 24.9,
  /** Livrare la easybox. */
  easyboxFee: 15,
  /** Retur conform OUG 34/2014. */
  returnDays: 14,
};
