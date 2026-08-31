export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addWatchTarget('src/assets/');

  // Preț în format românesc: 51,27 lei
  eleventyConfig.addFilter('lei', (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' lei';
  });

  // srcset de pe CDN-ul Shopify, prin parametrul width
  eleventyConfig.addFilter('cdn', (src, width) => {
    if (!src) return '';
    const base = src.split('?')[0];
    return `${base}?width=${width}`;
  });

  // Liquid trimite argumentele ca parametri separați, nu ca array.
  eleventyConfig.addFilter('srcset', (src, ...widths) => {
    if (!src) return '';
    const base = src.split('?')[0];
    const list = widths.flat().filter((w) => Number.isFinite(Number(w)));
    return (list.length ? list : [200, 400, 600, 800])
      .map((w) => `${base}?width=${w} ${w}w`)
      .join(', ');
  });

  // Mii cu punct: 11.320. Liquid pe Shopify nu are echivalent — la portare
  // numărul vine deja formatat din Judge.me, deci filtrul nu se portează.
  eleventyConfig.addFilter('nr', (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString('ro-RO') : '';
  });

  eleventyConfig.addFilter('json', (v) => JSON.stringify(v));

  return {
    dir: { input: 'src', output: 'dist', includes: '_includes', data: '_data' },
    templateFormats: ['liquid', 'md', 'html'],
    htmlTemplateEngine: 'liquid',
    markdownTemplateEngine: 'liquid',
    pathPrefix: process.env.PATH_PREFIX || '/',
  };
}
