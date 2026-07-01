import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://b2bindustrial.in';
const modifiedDate = new Date().toISOString().slice(0, 10);
const excludedNames = new Set(['404.html', '410.html', '429.html', '500.html', '503.html', 'offline.html', 'success.html']);
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (extname(entry.name).toLowerCase() === '.html') htmlFiles.push(fullPath);
  }
}

function decodeEntities(value = '') {
  const entities = {
    '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ',
  };
  return value.replace(/&(?:amp|quot|#39|apos|lt|gt|nbsp);/gi, (entity) => entities[entity.toLowerCase()] || ' ');
}

function plainText(value = '') {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function escapeHtml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeXml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function cleanTitle(title) {
  return plainText(title)
    .replace(/\s*[|–—-]\s*B2B Industrial Solutions.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalFor(file) {
  let path = relative(root, file).split(sep).join('/');
  if (path.endsWith(' copy.html')) path = path.replace(' copy.html', '.html');
  if (path === 'index.html') return `${origin}/`;
  if (path.endsWith('/index.html')) return `${origin}/${path.replace(/index\.html$/, '')}`;
  return `${origin}/${path.replace(/\.html$/, '')}`;
}

function relativePrefix(file) {
  const directory = relative(root, dirname(file));
  if (!directory) return './';
  return '../'.repeat(directory.split(sep).filter(Boolean).length);
}

function breadcrumbSchema(file, title, canonical) {
  const path = relative(root, file).split(sep).join('/').replace(/\/index\.html$/, '').replace(/\.html$/, '');
  const parts = path === 'index' ? [] : path.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }];
  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const name = isLast ? cleanTitle(title) : part.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const item = isLast ? canonical : `${origin}/${parts.slice(0, index + 1).join('/')}/`;
    items.push({ '@type': 'ListItem', position: index + 2, name, item });
  });
  return { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: items };
}

function pageType(file) {
  const path = relative(root, file).split(sep).join('/');
  if (path.startsWith('services/')) return 'service';
  if (path.startsWith('blog/') && path !== 'blog/index.html') return 'blog';
  if (path.startsWith('locations/')) return 'location';
  if (path.startsWith('case-studies/')) return 'case-study';
  if (path.startsWith('tools/') && path !== 'tools/index.html') return 'tool';
  if (path === 'faq.html') return 'faq';
  return 'page';
}

function buildSchema(file, html, title, description, canonical) {
  const type = pageType(file);
  const pageName = cleanTitle(title);
  const image = `${origin}/assets/images/og-cover.webp`;
  const organization = {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: 'B2B Industrial Solutions',
    url: `${origin}/`,
    logo: { '@type': 'ImageObject', url: `${origin}/assets/images/logo.webp` },
    foundingDate: '2013',
    telephone: '+91-9899702065',
    email: 'info@b2bindustrial.in',
    address: {
      '@type': 'PostalAddress', streetAddress: 'Shop No. 2, Gali No. 4, Khandsa Road',
      addressLocality: 'Gurugram', addressRegion: 'Haryana', postalCode: '122001', addressCountry: 'IN',
    },
    areaServed: { '@type': 'Country', name: 'India' },
  };
  const website = {
    '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`,
    name: 'B2B Industrial Solutions', publisher: { '@id': `${origin}/#organization` }, inLanguage: 'en-IN',
  };
  const webpage = {
    '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: pageName,
    description, isPartOf: { '@id': `${origin}/#website` },
    about: { '@id': `${origin}/#organization` }, breadcrumb: { '@id': `${canonical}#breadcrumb` },
    primaryImageOfPage: { '@type': 'ImageObject', url: image }, inLanguage: 'en-IN',
  };
  const graph = [organization, website, webpage, breadcrumbSchema(file, title, canonical)];

  if (type === 'service' || type === 'location') {
    graph.push({
      '@type': 'Service', '@id': `${canonical}#service`, name: pageName, description,
      url: canonical, provider: { '@id': `${origin}/#organization` },
      areaServed: type === 'location' ? pageName : { '@type': 'Country', name: 'India' },
      serviceType: pageName,
    });
  }

  if (type === 'blog' || type === 'case-study') {
    const published = html.match(/<time[^>]*datetime=["']([^"']+)["']/i)?.[1] || undefined;
    graph.push({
      '@type': type === 'blog' ? 'BlogPosting' : 'Article', '@id': `${canonical}#article`,
      headline: pageName, description, mainEntityOfPage: { '@id': `${canonical}#webpage` },
      image, author: { '@id': `${origin}/#organization` }, publisher: { '@id': `${origin}/#organization` },
      ...(published ? { datePublished: published } : {}), inLanguage: 'en-IN',
    });
  }

  if (type === 'tool') {
    graph.push({
      '@type': 'WebApplication', '@id': `${canonical}#application`, name: pageName, description,
      url: canonical, applicationCategory: 'BusinessApplication', operatingSystem: 'Any',
      provider: { '@id': `${origin}/#organization` },
    });
  }

  if (type === 'faq') {
    const questions = [...html.matchAll(/<button[^>]*class=["'][^"']*faq-question[^"']*["'][^>]*>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>[\s\S]*?<div[^>]*class=["'][^"']*faq-answer-content[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => ({
        '@type': 'Question', name: plainText(match[1]),
        acceptedAnswer: { '@type': 'Answer', text: plainText(match[2]) },
      }))
      .filter((item) => item.name && item.acceptedAnswer.text);
    if (questions.length) graph.push({ '@type': 'FAQPage', '@id': `${canonical}#faq`, mainEntity: questions });
  }

  if (['index.html', 'about.html', 'contact.html'].includes(relative(root, file).split(sep).join('/'))) {
    graph.push({
      '@type': 'ProfessionalService', '@id': `${origin}/#localbusiness`, name: 'B2B Industrial Solutions',
      image, url: `${origin}/`, telephone: '+91-9899702065', priceRange: 'Request a quote',
      address: organization.address, areaServed: organization.areaServed,
      parentOrganization: { '@id': `${origin}/#organization` },
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
}

function optimizeImages(html) {
  const mainStart = html.search(/<main\b/i);
  let firstMainImage = true;
  return html.replace(/<img\b([^>]*?)>/gi, (tag, attributes, offset) => {
    let result = tag;
    if (!/\bdecoding=/i.test(result)) result = result.replace(/>$/, ' decoding="async">');
    if (offset > mainStart && mainStart >= 0) {
      if (firstMainImage) {
        firstMainImage = false;
        if (!/\bloading=/i.test(result)) result = result.replace(/>$/, ' loading="eager">');
        if (!/\bfetchpriority=/i.test(result)) result = result.replace(/>$/, ' fetchpriority="high">');
      } else if (!/\bloading=/i.test(result)) {
        result = result.replace(/>$/, ' loading="lazy">');
      }
    }
    return result;
  });
}

function imageEntries(html, canonical) {
  const entries = [];
  for (const match of html.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>/gi)) {
    const src = match[1];
    if (/^(?:data:|https?:\/\/)/i.test(src) || /(?:logo|favicon|client-logo)/i.test(src)) continue;
    const url = new URL(src, canonical).href;
    if (!url.startsWith(origin)) continue;
    entries.push({ url, title: plainText(match[2] || cleanTitle(canonical.split('/').pop() || 'Industrial engineering')) });
    if (entries.length === 3) break;
  }
  return entries;
}

walk(root);
const sitemapPages = [];
const titles = new Map();
const descriptions = new Map();

for (const file of htmlFiles) {
  let html = readFileSync(file, 'utf8');
  html = html.replace(/\s*<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->\s*/g, '\n');
  html = html.replace(/\s*<!-- PRELOADER:START -->[\s\S]*?<!-- PRELOADER:END -->\s*/g, '\n');

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || 'B2B Industrial Solutions';
  const existingDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)?.[1];
  const fallbackText = plainText(html.match(/<main\b[^>]*>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '');
  const description = decodeEntities(existingDescription || fallbackText || `${cleanTitle(title)} by B2B Industrial Solutions across India.`).slice(0, 180);
  const canonical = canonicalFor(file);
  const path = relative(root, file).split(sep).join('/');
  const noindex = excludedNames.has(path.split('/').pop()) || path.includes(' copy.html');
  const socialType = ['blog', 'case-study'].includes(pageType(file)) ? 'article' : 'website';
  const schema = buildSchema(file, html, title, description, canonical);

  const seoBlock = `
  <!-- SEO:START -->
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="alternate" hreflang="en-IN" href="${escapeHtml(canonical)}">
  <link rel="manifest" href="${origin}/site.webmanifest">
  <meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
  <meta name="author" content="B2B Industrial Solutions">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:type" content="${socialType}">
  <meta property="og:site_name" content="B2B Industrial Solutions">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="${escapeHtml(plainText(title))}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${origin}/assets/images/og-cover.webp">
  <meta property="og:image:alt" content="B2B Industrial Solutions industrial audit and engineering services">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(plainText(title))}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${origin}/assets/images/og-cover.webp">
  <script type="application/ld+json">${schema}</script>
  <!-- SEO:END -->
`;
  html = html.replace(/\s*<\/head>/i, `${seoBlock}</head>`);

  const prefix = relativePrefix(file);
  const preloader = `
  <!-- PRELOADER:START -->
  <div class="site-preloader" role="status" aria-label="Loading B2B Industrial Solutions">
    <div class="preloader-inner">
      <img src="${prefix}assets/images/logo.webp" alt="B2B Industrial Solutions" decoding="async">
      <div class="preloader-track" aria-hidden="true"><span></span></div>
      <small>Engineering progress</small>
    </div>
  </div>
  <!-- PRELOADER:END -->
`;
  html = html.replace(/(<body\b[^>]*>)/i, `$1${preloader}`);
  html = optimizeImages(html);
  writeFileSync(file, html, 'utf8');

  const normalizedTitle = plainText(title).toLowerCase();
  const normalizedDescription = description.toLowerCase();
  titles.set(normalizedTitle, (titles.get(normalizedTitle) || 0) + 1);
  descriptions.set(normalizedDescription, (descriptions.get(normalizedDescription) || 0) + 1);
  if (!noindex) sitemapPages.push({ canonical, images: imageEntries(html, canonical) });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapPages.map(({ canonical, images }) => `  <url>
    <loc>${escapeXml(canonical)}</loc>
    <lastmod>${modifiedDate}</lastmod>${images.map((image) => `
    <image:image><image:loc>${escapeXml(image.url)}</image:loc><image:title>${escapeXml(image.title)}</image:title></image:image>`).join('')}
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, 'utf8');

const duplicateTitles = [...titles.entries()].filter(([, count]) => count > 1);
const duplicateDescriptions = [...descriptions.entries()].filter(([, count]) => count > 1);
console.log(`SEO enhanced: ${htmlFiles.length} pages, ${sitemapPages.length} indexable URLs, ${duplicateTitles.length} duplicate title groups, ${duplicateDescriptions.length} duplicate description groups.`);
if (duplicateTitles.length) console.log('Duplicate titles:', duplicateTitles);
if (duplicateDescriptions.length) console.log('Duplicate descriptions:', duplicateDescriptions);
