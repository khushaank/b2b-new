import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://b2bindustrial.in';

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const plain = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extname(entry.name).toLowerCase() === '.html') htmlFiles.push(full);
  }
}

function canonicalOf(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
}

walk(root);
const pages = htmlFiles.map((file) => {
  const html = readFileSync(file, 'utf8');
  return {
    file,
    path: relative(root, file).split(sep).join('/'),
    html,
    canonical: canonicalOf(html),
    title: plain(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ''),
    description: html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)/i)?.[1] || '',
    noindex: /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html),
  };
});

const blogItems = pages.filter((page) => page.path.startsWith('blog/') && page.path !== 'blog/index.html' && !page.noindex);
const searchItems = pages.filter((page) => !page.noindex && page.canonical).map((page) => ({
  title: page.title,
  url: new URL(page.canonical).pathname.replace(/\/$/, '') || '/',
  tags: page.html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)/i)?.[1] || '',
  text: plain(page.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '').slice(0, 4200),
}));
writeFileSync(join(root, 'assets', 'js', 'search-data.min.js'), `const SEARCH_DATA=${JSON.stringify(searchItems)};`);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>B2B Industrial Insights</title>
    <link>${origin}/blog/</link>
    <description>Practical industrial audit, safety, energy, HVAC and compliance guidance.</description>
    <language>en-IN</language>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
${blogItems.map((page) => `    <item><title>${escapeXml(page.title)}</title><link>${escapeXml(page.canonical)}</link><guid isPermaLink="true">${escapeXml(page.canonical)}</guid><description>${escapeXml(page.description)}</description></item>`).join('\n')}
  </channel>
</rss>
`;
writeFileSync(join(root, 'rss.xml'), rss);

const imageUrls = new Map();
for (const page of pages.filter((item) => !item.noindex && item.canonical)) {
  const candidates = [
    ...page.html.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>/gi),
  ];
  for (const match of candidates) {
    const src = match[1];
    if (/^(?:data:|javascript:)/i.test(src)) continue;
    const image = new URL(src, page.canonical).href;
    if (!image.startsWith(origin)) continue;
    const key = `${page.canonical}|${image}`;
    imageUrls.set(key, { page: page.canonical, image, title: plain(match[2] || page.title) });
  }
}
const groupedImages = new Map();
for (const entry of imageUrls.values()) groupedImages.set(entry.page, [...(groupedImages.get(entry.page) || []), entry]);
const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...groupedImages].map(([page, images]) => `  <url><loc>${escapeXml(page)}</loc>${images.slice(0, 8).map((item) => `<image:image><image:loc>${escapeXml(item.image)}</image:loc><image:title>${escapeXml(item.title)}</image:title></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap-images.xml'), imageSitemap);

const organization = {
  '@context': 'https://schema.org', '@type': ['Organization', 'ProfessionalService'],
  '@id': `${origin}/#organization`, name: 'B2B Industrial Solutions', url: `${origin}/`,
  logo: `${origin}/assets/images/logo.webp`, image: `${origin}/assets/images/og-cover.webp`,
  telephone: '+91-9899702065', email: 'info@b2bindustrial.in', foundingDate: '2013',
  address: { '@type': 'PostalAddress', streetAddress: 'Shop No. 2, Gali No. 4, Khandsa Road', addressLocality: 'Gurugram', addressRegion: 'Haryana', postalCode: '122001', addressCountry: 'IN' },
  areaServed: { '@type': 'Country', name: 'India' },
};
writeFileSync(join(root, 'schema-master.json'), `${JSON.stringify(organization, null, 2)}\n`);

writeFileSync(join(root, 'opensearch.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"><ShortName>B2B Industrial</ShortName><Description>Search B2B Industrial Solutions</Description><InputEncoding>UTF-8</InputEncoding><Image height="32" width="32" type="image/png">${origin}/assets/images/favicon.png</Image><Url type="text/html" template="${origin}/?q={searchTerms}" /></OpenSearchDescription>\n`);
writeFileSync(join(root, 'browserconfig.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig><msapplication><tile><square150x150logo src="assets/images/pwa/icon-192.webp"/><TileColor>#0874d1</TileColor></tile></msapplication></browserconfig>\n`);
writeFileSync(join(root, 'dublincore.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>B2B Industrial Solutions</dc:title><dc:creator>B2B Industrial Solutions</dc:creator><dc:subject>Industrial audits, compliance, safety, energy, HVAC and engineering</dc:subject><dc:description>Pan-India industrial audit, compliance and turnkey engineering services.</dc:description><dc:publisher>B2B Industrial Solutions</dc:publisher><dc:language>en-IN</dc:language><dc:coverage>India</dc:coverage></metadata>\n`);
writeFileSync(join(root, 'humans.txt'), `/* TEAM */\nCompany: B2B Industrial Solutions\nContact: info@b2bindustrial.in\nLocation: Gurugram, Haryana, India\n\n/* SITE */\nLanguage: English (India)\nStandards: HTML5, CSS, JavaScript, Schema.org, Open Graph\n`);

const serviceLinks = pages.filter((page) => page.path.startsWith('services/') && !page.noindex).map((page) => `- [${page.title}](${page.canonical}): ${page.description}`);
writeFileSync(join(root, 'llms.txt'), `# B2B Industrial Solutions\n\n> B2B Industrial Solutions provides industrial audits, statutory compliance, fire and HSE safety, energy, electrical, HVAC, emission-control and turnkey engineering services across India.\n\n## Primary pages\n- [Home](${origin}/)\n- [Services](${origin}/service)\n- [About](${origin}/about)\n- [Industrial insights](${origin}/blog/)\n- [Service locations](${origin}/locations/)\n- [Engineering tools](${origin}/tools/)\n- [Contact](${origin}/contact)\n\n## Services\n${serviceLinks.join('\n')}\n\n## Contact\n- Email: info@b2bindustrial.in\n- Phone: +91 98997 02065\n- Service area: India\n`);

const manifest = JSON.parse(readFileSync(join(root, 'site.webmanifest'), 'utf8'));
writeFileSync(join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Discovery files generated from ${pages.length} pages, ${blogItems.length} feed items, ${searchItems.length} search entries and ${imageUrls.size} page-image associations.`);
