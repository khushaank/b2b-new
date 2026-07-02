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

function removeDivByClass(html, className) {
  const classPattern = new RegExp(`<div\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  let match;
  while ((match = classPattern.exec(html))) {
    const tagPattern = /<div\b[^>]*>|<\/div\s*>/gi;
    tagPattern.lastIndex = match.index + match[0].length;
    let depth = 1;
    let tag;
    while (depth && (tag = tagPattern.exec(html))) depth += /^<div\b/i.test(tag[0]) ? 1 : -1;
    if (depth) break;
    html = `${html.slice(0, match.index)}${html.slice(tagPattern.lastIndex)}`;
  }
  return html;
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
  if (path === 'locations/index.html') return 'page';
  if (path.startsWith('locations/')) return 'location';
  if (path.startsWith('case-studies/')) return 'case-study';
  if (path.startsWith('tools/') && path !== 'tools/index.html') return 'tool';
  if (path === 'faq.html') return 'faq';
  return 'page';
}

function editorialAsset(file, title) {
  const subject = `${relative(root, file).split(sep).join('/')} ${plainText(title)}`.toLowerCase();
  if (/(fire|hse|safety|emergency|disaster|drill|first-aid|occupational|permit|incident|behaviour|posh|tbt)/.test(subject)) {
    return { file: 'fire-safety.webp', alt: 'Industrial fire and life-safety engineers inspecting compliant protection systems' };
  }
  if (/(hvac|duct|ventilation|air-balanc|lighting|interior|project-management|repair|cable|panel|transformer)/.test(subject)) {
    return { file: 'hvac-projects.webp', alt: 'Industrial engineers commissioning efficient HVAC and engineering systems' };
  }
  if (/(environment|emission|carbon|esg|waste|renewable|solar|water|cpcb|recd|ocems|stack)/.test(subject)) {
    return { file: 'sustainability-emissions.webp', alt: 'Industrial sustainability engineer monitoring emissions and renewable energy performance' };
  }
  if (/(audit|energy|electrical|thermograph|power|earthing|arc-flash|harmonic|nabl|boiler|steam|compressed-air)/.test(subject)) {
    return { file: 'audits-electrical.webp', alt: 'Certified industrial auditors performing a thermal electrical inspection' };
  }
  return { file: 'engineering-knowledge.webp', alt: 'Industrial engineering workspace with technical drawings, instruments and performance data' };
}

function buildSchema(file, html, title, description, canonical, image) {
  const type = pageType(file);
  const pageName = cleanTitle(title);
  const organization = {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: 'B2B Industrial Solutions',
    url: `${origin}/`,
    logo: { '@type': 'ImageObject', url: `${origin}/assets/images/logo.webp` },
    foundingDate: '2013',
    telephone: '+91-9899702065',
    email: 'info@b2bindustrial.in',
    sameAs: ['https://www.linkedin.com/company/b2bindustrial/'],
    knowsAbout: ['Industrial energy audits', 'Electrical safety', 'Fire and HSE compliance', 'HVAC engineering', 'Emission control', 'Statutory industrial compliance'],
    contactPoint: {
      '@type': 'ContactPoint', telephone: '+91-9899702065', email: 'info@b2bindustrial.in',
      contactType: 'sales and technical enquiries', areaServed: 'IN', availableLanguage: ['English', 'Hindi'],
    },
    address: {
      '@type': 'PostalAddress', streetAddress: 'Shop No. 2, Gali No. 4, Khandsa Road',
      addressLocality: 'Gurugram', addressRegion: 'Haryana', postalCode: '122001', addressCountry: 'IN',
    },
    areaServed: { '@type': 'Country', name: 'India' },
  };
  const website = {
    '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`,
    name: 'B2B Industrial Solutions', publisher: { '@id': `${origin}/#organization` }, inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction', target: `${origin}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  const webpage = {
    '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: pageName,
    description, isPartOf: { '@id': `${origin}/#website` },
    about: { '@id': `${origin}/#organization` }, breadcrumb: { '@id': `${canonical}#breadcrumb` },
    primaryImageOfPage: { '@type': 'ImageObject', url: image }, inLanguage: 'en-IN',
  };
  const graph = [organization, website, webpage, breadcrumbSchema(file, title, canonical)];

  if (type === 'service' || type === 'location') {
    const locationSlug = relative(root, file).split(sep).pop()?.split('-')[0];
    const knownLocations = { ahmedabad: 'Ahmedabad', bangalore: 'Bengaluru', chennai: 'Chennai', delhi: 'Delhi', faridabad: 'Faridabad', gurgaon: 'Gurugram', hyderabad: 'Hyderabad', manesar: 'Manesar', mumbai: 'Mumbai', noida: 'Noida', pune: 'Pune' };
    const locationName = html.match(/<body\b[^>]*\bdata-location=["']([^"']+)["']/i)?.[1] || knownLocations[locationSlug];
    const serviceName = html.match(/<body\b[^>]*\bdata-service=["']([^"']+)["']/i)?.[1];
    graph.push({
      '@type': 'Service', '@id': `${canonical}#service`, name: pageName, description,
      url: canonical, provider: { '@id': `${origin}/#organization` },
      areaServed: type === 'location' && locationName
        ? { '@type': 'City', name: locationName }
        : { '@type': 'Country', name: 'India' },
      serviceType: serviceName || pageName,
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

  if (relative(root, file).split(sep).join('/') === 'index.html') {
    const questions = [...html.matchAll(/<div class=["'][^"']*accordion[^"']*["'][^>]*>[\s\S]*?<button[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<div class=["']accordion-content["'][^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/gi)]
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
      sameAs: organization.sameAs,
      hasOfferCatalog: {
        '@type': 'OfferCatalog', name: 'Industrial audit and engineering services',
        itemListElement: ['Energy audits', 'Electrical safety audits', 'Fire and HSE audits', 'Statutory compliance', 'HVAC engineering projects', 'Emission control systems']
          .map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
      },
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
  const orphanSeoEnd = html.indexOf('<!-- SEO:END -->');
  if (orphanSeoEnd !== -1) {
    const orphanSeoStart = html.lastIndexOf('<link rel="canonical"', orphanSeoEnd);
    if (orphanSeoStart !== -1) {
      html = `${html.slice(0, orphanSeoStart)}${html.slice(orphanSeoEnd + '<!-- SEO:END -->'.length)}`;
    }
  }
  html = html.replace(/\s*<!-- PRELOADER:START -->[\s\S]*?<!-- PRELOADER:END -->\s*/g, '\n');
  html = html.replace(/\s*<!-- EDITORIAL:START -->[\s\S]*?<!-- EDITORIAL:END -->\s*/g, '\n');
  html = html.replace(/\s*<!-- CONTENT-SOCIAL:START -->[\s\S]*?<!-- CONTENT-SOCIAL:END -->\s*/g, '\n');
  html = html.replace(/\s*<!-- FOOTER-SOCIAL:START -->[\s\S]*?<!-- FOOTER-SOCIAL:END -->\s*/g, '\n');
  html = html.replace(/\s*<link\b[^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*>/gi, '');
  html = removeDivByClass(html, 'blog-share-bar');
  html = removeDivByClass(html, 'share-box');
  html = removeDivByClass(html, 'glass-preloader');

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || 'B2B Industrial Solutions';
  const existingDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)?.[1];
  const fallbackText = plainText(html.match(/<main\b[^>]*>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '');
  const description = decodeEntities(existingDescription || fallbackText || `${cleanTitle(title)} by B2B Industrial Solutions across India.`).slice(0, 180);
  const canonical = canonicalFor(file);
  const path = relative(root, file).split(sep).join('/');
  const noindex = excludedNames.has(path.split('/').pop()) || path.includes(' copy.html');
  const socialType = ['blog', 'case-study'].includes(pageType(file)) ? 'article' : 'website';
  const editorial = editorialAsset(file, title);
  const socialImage = `${origin}/assets/images/editorial/${editorial.file}`;
  const schema = buildSchema(file, html, title, description, canonical, socialImage);
  const prefix = relativePrefix(file);
  html = html.replace(/href=["']#["'](\s+class=["'][^"']*\brelated-link\b[^"']*["'])/gi, `href="${prefix}contact.html"$1`);

  const seoBlock = `
  <!-- SEO:START -->
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="alternate" hreflang="en-IN" href="${escapeHtml(canonical)}">
  <link rel="manifest" href="${prefix}site.webmanifest">
  <link rel="icon" href="${prefix}assets/images/favicon.png" type="image/png" sizes="318x318">
  <link rel="apple-touch-icon" href="${prefix}assets/images/favicon.png">
  <meta name="msapplication-config" content="${prefix}browserconfig.xml">
  <link rel="alternate" type="application/rss+xml" title="B2B Industrial Insights" href="${origin}/rss.xml">
  <link rel="search" type="application/opensearchdescription+xml" title="B2B Industrial Solutions" href="${origin}/opensearch.xml">
  <meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
  <meta name="author" content="B2B Industrial Solutions">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:type" content="${socialType}">
  <meta property="og:site_name" content="B2B Industrial Solutions">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="${escapeHtml(plainText(title))}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:alt" content="${escapeHtml(editorial.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(plainText(title))}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${socialImage}">
  <script type="application/ld+json">${schema}</script>
  <!-- SEO:END -->
`;
  html = html.replace(/\s*<\/head>/i, `${seoBlock}</head>`);

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

  const mainContent = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] || '';
  if (mainContent && !/<img\b/i.test(mainContent)) {
    const editorialFigure = `
    <!-- EDITORIAL:START -->
    <figure class="page-editorial-visual">
      <img src="${prefix}assets/images/editorial/${editorial.file}" alt="${escapeHtml(editorial.alt)}" width="1600" height="900" loading="lazy" decoding="async">
    </figure>
    <!-- EDITORIAL:END -->
`;
    html = html.replace(/<\/main>/i, `${editorialFigure}</main>`);
  }

  if (['blog', 'case-study'].includes(pageType(file))) {
    const whatsappUrl = `https://wa.me/919899702065?text=${encodeURIComponent(`Hello B2B Industrial Solutions, I am reading ${plainText(title)}: ${canonical}`)}`;
    const emailUrl = `mailto:info@b2bindustrial.in?subject=${encodeURIComponent(`Regarding ${plainText(title)}`)}&body=${encodeURIComponent(`Hello B2B Industrial Solutions,\n\nI would like to discuss this page:\n${canonical}`)}`;
    const socialBlock = `
    <!-- CONTENT-SOCIAL:START -->
    <aside class="content-social" aria-label="Connect with B2B Industrial Solutions">
      <div><small>CONTINUE THE CONVERSATION</small><strong>Discuss or share this insight.</strong></div>
      <nav aria-label="Social and contact links">
        <a class="social-whatsapp" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Contact B2B Industrial Solutions on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Zm-5.1 1.8c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-1.4-.7-2.4-1.4-3.3-3-.2-.3.2-.5.5-1 .1-.2 0-.4 0-.6l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.8.8-1.2 1.9-.7 3 .6 1.7 1.9 3.4 3.5 4.5 1.8 1.2 4.1 2.1 5.4 1.5.7-.3 1.2-1.1 1.3-1.9.1-.3.1-.5-.2-.6l-1.1-.6Z"/></svg><span>WhatsApp</span></a>
        <a class="social-email" href="${escapeHtml(emailUrl)}" aria-label="Email B2B Industrial Solutions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm2 2v.4l7 5.1 7-5.1V7H5Zm14 10V9.9l-7 5-7-5V17h14Z"/></svg><span>Email</span></a>
        <a class="social-linkedin" href="https://www.linkedin.com/company/b2bindustrial/" target="_blank" rel="noopener noreferrer" aria-label="Follow B2B Industrial Solutions on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.3 7.7H2.2V21h3.1V7.7ZM3.8 2A1.8 1.8 0 1 0 3.8 5.6 1.8 1.8 0 0 0 3.8 2ZM21.8 13.4c0-4-2.1-5.9-4.9-5.9-2.3 0-3.3 1.3-3.8 2.2v-2h-3.1V21h3.1v-6.6c0-1.7.3-3.4 2.5-3.4 2.1 0 2.2 2 2.2 3.5V21h3.1l.9-7.6Z"/></svg><span>LinkedIn</span></a>
      </nav>
    </aside>
    <!-- CONTENT-SOCIAL:END -->
`;
    html = html.replace(/<\/main>/i, `${socialBlock}</main>`);
  }

  html = html.replace(/(<div class="footer-links"><b>Company<\/b>[\s\S]*?)(<\/div>)/i, (block, content, close) => {
    let links = content;
    if (!/href=["'][^"']*locations\//i.test(links)) links += `<a href="${prefix}locations/">Service locations</a>`;
    if (!/href=["'][^"']*tools\//i.test(links)) links += `<a href="${prefix}tools/">Engineering tools</a>`;
    return `${links}${close}`;
  });

  const footerSocial = `<!-- FOOTER-SOCIAL:START --><div class="footer-socials" aria-label="Connect with us"><a href="https://wa.me/919899702065" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="mailto:info@b2bindustrial.in">Email</a><a href="https://www.linkedin.com/company/b2bindustrial/" target="_blank" rel="noopener noreferrer">LinkedIn</a></div><!-- FOOTER-SOCIAL:END -->`;
  html = html.replace(/(<div class="footer-links footer-contact">[\s\S]*?)(<\/div>)/i, `$1${footerSocial}$2`);
  html = optimizeImages(html);
  html = html.replace(/[ \t]+$/gm, '');
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
writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\nSitemap: ${origin}/sitemap-images.xml\n`, 'utf8');

const duplicateTitles = [...titles.entries()].filter(([, count]) => count > 1);
const duplicateDescriptions = [...descriptions.entries()].filter(([, count]) => count > 1);
console.log(`SEO enhanced: ${htmlFiles.length} pages, ${sitemapPages.length} indexable URLs, ${duplicateTitles.length} duplicate title groups, ${duplicateDescriptions.length} duplicate description groups.`);
if (duplicateTitles.length) console.log('Duplicate titles:', duplicateTitles);
if (duplicateDescriptions.length) console.log('Duplicate descriptions:', duplicateDescriptions);
