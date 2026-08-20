# data/

Aici stau datele reale extrase din magazin. **Nimic din ce e aici nu se scrie de mână.**

Populare:

```bash
node scripts/fetch-shopify-data.mjs
```

Scriptul trebuie rulat de pe un calculator cu acces la `smartinoshop.ro`
(sesiunile Claude Code pe web au egress blocat către acest domeniu).

Fișiere generate:

| Fișier | Conținut |
| --- | --- |
| `products.json` | toate produsele: titlu, handle, preț, compare_at_price, imagini CDN, vendor, tags, descriere, variante |
| `collections.json` | toate colecțiile: titlu, handle, descriere, imagine |
| `collection-products.json` | handle colecție → listă de handle-uri produse |
| `_meta.json` | sursa și momentul descărcării |
