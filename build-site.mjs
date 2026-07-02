import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.dirname(here);
const outputRoot = here;

const groups = {
  services: 'services',
  blog: 'blogs',
  locations: 'locations',
  tools: 'tools',
  'case-studies': 'case-studies'
};

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (entry.name === 'premium-homepage' || entry.name === '.git' || entry.name === 'node_modules') return [];
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const sourcePages = walk(sourceRoot)
  .filter((file) => file.toLowerCase().endsWith('.html'))
  .map((file) => path.relative(sourceRoot, file).replaceAll('\\', '/'));

const pageSet = new Set(sourcePages);

const cleanText = (value = '') => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

const escapeHtml = (value = '') => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const groupFor = (relativePath) => {
  const first = relativePath.split('/')[0];
  return groups[first] || 'core-pages';
};

const rootPrefixFor = (relativePath) => {
  const depth = relativePath.split('/').length - 1;
  return depth ? '../'.repeat(depth) : './';
};

const normalizeRoute = (pathname) => {
  let candidate = pathname.replace(/^\/+/, '').replaceAll('\\', '/');
  if (!candidate) return 'index.html';
  if (pageSet.has(candidate)) return candidate;
  if (pageSet.has(`${candidate}.html`)) return `${candidate}.html`;
  if (pageSet.has(`${candidate.replace(/\/$/, '')}/index.html`)) return `${candidate.replace(/\/$/, '')}/index.html`;
  return candidate;
};

const rewriteReference = (value, sourcePage, prefix) => {
  if (!value || /^(#|mailto:|tel:|data:|javascript:)/i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) {
    const imageMatch = value.match(/^https?:\/\/(?:www\.)?b2bindustrial\.in\/images\/(.*)$/i);
    return imageMatch ? `${prefix}assets/images/${imageMatch[1]}` : value;
  }
  const [pathname, suffix = ''] = value.split(/(?=[?#])/s, 2);
  if (pathname.startsWith('/images/')) return `${prefix}assets/images/${pathname.slice(8)}${suffix}`;
  if (pathname.startsWith('/js/')) return `${prefix}assets/js/${pathname.slice(4)}${suffix}`;
  if (pathname.startsWith('/css/')) return `${prefix}assets/legacy-css/${pathname.slice(5)}${suffix}`;
  if (pathname.startsWith('/')) return `${prefix}${normalizeRoute(pathname)}${suffix}`;

  const sourceDir = path.posix.dirname(sourcePage);
  const resolved = path.posix.normalize(path.posix.join(sourceDir, pathname));
  if (resolved.startsWith('images/')) return `${prefix}assets/images/${resolved.slice(7)}${suffix}`;
  if (resolved.startsWith('js/')) return `${prefix}assets/js/${resolved.slice(3)}${suffix}`;
  const routed = normalizeRoute(resolved);
  if (pageSet.has(routed)) {
    const outputDir = path.posix.dirname(sourcePage);
    let relative = path.posix.relative(outputDir, routed);
    if (!relative.startsWith('.')) relative = `./${relative}`;
    return `${relative}${suffix}`;
  }
  return value;
};

const rewriteContent = (html, sourcePage, prefix) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace(/\s(?:onclick|onload|onerror)="[^"]*"/gi, '')
  .replace(/(href|src)=(['"])(.*?)\2/gi, (full, attr, quote, value) => `${attr}=${quote}${rewriteReference(value, sourcePage, prefix)}${quote}`)
  .replace(/url\((['"]?)\/images\//gi, `url($1${prefix}assets/images/`)
  .replace(/Sandeep Bharti/g, 'Sandeep Gupta');

const extractBody = (source) => {
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return main[1];
  const body = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  return body
    .replace(/<header\b[\s\S]*?<\/header>/gi, '')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, '')
    .replace(/<div\b[^>]*class="[^"]*(?:nav-overlay|search-bar)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
};

const header = (prefix) => `
  <header class="site-header" id="top">
    <div class="global-bar">
      <div class="shell global-bar-inner">
        <a class="brand" href="${prefix}index.html" aria-label="B2B Industrial Solutions home"><img src="${prefix}assets/images/logo.webp" alt="B2B Industrial Solutions"></a>
        <nav class="global-nav" aria-label="Company navigation">
          <a href="${prefix}about.html">About</a><a href="${prefix}index.html#approach">Process</a><a href="${prefix}case-studies/cement-plant-energy-audit.html">Case studies</a><a href="${prefix}blog/index.html">Insights</a><a href="${prefix}contact.html">Contact</a>
        </nav>
        <div class="header-contact"><span>Pan-India service</span><a href="tel:+919899702065" class="global-phone">+91 98997 02065</a></div>
      </div>
    </div>
    <div class="service-bar">
      <div class="shell nav-wrap">
        <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
        <nav class="main-nav" aria-label="Primary services">
          <a href="${prefix}services/energy-audits.html">Audits</a><a href="${prefix}services/compliances.html">Compliance</a><a href="${prefix}services/hvac-projects.html">HVAC &amp; IAQ</a><a href="${prefix}services/recd-kit.html">RECD &amp; Emission</a><a href="${prefix}services/fire-life-safety.html">Fire &amp; HSE</a><a href="${prefix}service.html">All services</a>
        </nav>
        <a class="button nav-cta" href="${prefix}contact.html">Request a site visit</a>
      </div>
    </div>
  </header>`;

const footer = (prefix) => `
  <footer id="footer">
    <div class="shell footer-top">
      <div class="footer-brand"><img src="${prefix}assets/images/logo.webp" alt="B2B Industrial Solutions"><p>Audits, compliance and turnkey engineering solutions for safer, efficient and future-ready industrial operations.</p><a class="footer-cta" href="${prefix}contact.html">Discuss your requirement <span>›</span></a></div>
      <div class="footer-links"><b>Audits &amp; compliance</b><a href="${prefix}services/energy-audits.html">Energy audits</a><a href="${prefix}services/electrical-safety-audit.html">Electrical safety</a><a href="${prefix}services/fire-life-safety.html">Fire &amp; HSE audits</a><a href="${prefix}services/compliances.html">Statutory compliance</a><a href="${prefix}services/environment-compliances.html">Environment compliance</a></div>
      <div class="footer-links"><b>Engineering projects</b><a href="${prefix}services/hvac-projects.html">HVAC &amp; duct cleaning</a><a href="${prefix}services/recd-kit.html">RECD &amp; DFK kits</a><a href="${prefix}services/emission-control.html">Emission control</a><a href="${prefix}services/electrical-projects.html">Electrical projects</a><a href="${prefix}services/fire-projects.html">Fire projects</a></div>
      <div class="footer-links"><b>Company</b><a href="${prefix}about.html">About us</a><a href="${prefix}index.html#approach">Our process</a><a href="${prefix}blog/index.html">Insights</a><a href="${prefix}service.html">All services</a><a href="${prefix}faq.html">FAQs</a></div>
      <div class="footer-links footer-contact"><b>Contact</b><a href="tel:+919899702065">+91 98997 02065</a><a href="mailto:info@b2bindustrial.in">info@b2bindustrial.in</a><p>Shop No. 2, Gali No. 4<br>Khandsa Road, Gurugram<br>Haryana 122001</p></div>
    </div>
    <div class="shell footer-credentials"><span><b>ISO 9001:2015</b> Certified</span><span><b>BEE-certified</b> audit experts</span><span><b>Pan-India</b> project delivery</span><span><b>Since 2013</b> industrial expertise</span></div>
    <div class="shell footer-bottom"><span>© <span data-current-year></span> B2B Industrial Solutions</span><div><a href="${prefix}privacy.html">Privacy</a><a href="${prefix}terms.html">Terms</a><a href="#top">Back to top ↑</a></div></div>
  </footer>`;

const groupLabel = {
  services: 'Industrial services', blogs: 'Industrial insights', locations: 'Service locations', tools: 'Engineering tools', 'case-studies': 'Case studies', 'core-pages': 'B2B Industrial Solutions'
};

const servicePresentation = (relativePath) => {
  const name = path.basename(relativePath, '.html').toLowerCase();
  const rules = [
    { match: /(hvac|duct|air-balanc|ventilation)/, category: 'HVAC & indoor air quality', image: 'services/HVAC Projects & Robot Duct Cleaning.webp', focus: 'Performance, comfort and clean air' },
    { match: /(fire|fm200|emergency|disaster|drill|public-address)/, category: 'Fire, HSE & emergency readiness', image: 'services/HSE & Fire Safety Audits.webp', focus: 'Protect people, property and continuity' },
    { match: /(recd|cpcb|gas-dg|emission|ocems|stack)/, category: 'Emission control & CPCB compliance', image: 'services/Emission Control Projects.webp', focus: 'Cleaner operation. Documented compliance.' },
    { match: /(compliance|compliances|noc|chartered|environment|waste|e-waste)/, category: 'Compliance & statutory approvals', image: 'services/Compliance Management Services.webp', focus: 'Clarity across approvals and obligations' },
    { match: /(lighting|light-|poles)/, category: 'Industrial lighting projects', image: 'services/Lighting Projects.webp', focus: 'Efficient illumination, engineered for work' },
    { match: /(electrical|cable|panel|transformer|earthing-project|lightning|ev-charging)/, category: 'Electrical engineering', image: 'services/Electrical Engineering Services.webp', focus: 'Safe, reliable power infrastructure' },
    { match: /(solar|renewable)/, category: 'Energy transition projects', image: 'services/solar-energy.webp', focus: 'Lower-carbon infrastructure with measurable returns' },
    { match: /(repair|maintenance|execution|project-management)/, category: 'Execution & asset reliability', image: 'services/Repair & Maintenance Services.webp', focus: 'From recommendation to reliable operation' },
    { match: /(interior)/, category: 'Turnkey workplace projects', image: 'Sliders/interior.webp', focus: 'Functional spaces, delivered end to end' },
    { match: /(safety|hira|hazop|risk|behaviour|permit|incident|occupational|ergonomic|first-aid|tbt|posh|well-being)/, category: 'Workplace safety & risk', image: 'services/HSE & Fire Safety Audits.webp', focus: 'Practical systems for safer work' },
    { match: /(audit|energy|steam|boiler|compressed|power-quality|harmonic|thermography|water|carbon|sustainab|cyber|nabl)/, category: 'Industrial audits & technical studies', image: 'services/Energy and Electrical Audits.webp', focus: 'Find loss, quantify risk and prioritise action' }
  ];
  return rules.find((rule) => rule.match.test(name)) || { category: 'Industrial engineering solutions', image: 'og-cover.webp', focus: 'Specialist support from study to execution' };
};

for (const relativePath of sourcePages) {
  if (relativePath === 'index.html') continue;
  const source = fs.readFileSync(path.join(sourceRoot, relativePath), 'utf8');
  const group = groupFor(relativePath);
  const prefix = rootPrefixFor(relativePath);
  const title = cleanText(source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || path.basename(relativePath, '.html'));
  const description = source.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1]
    || source.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)?.[1]
    || 'Industrial engineering, audits and compliance services from B2B Industrial Solutions.';
  const h1 = cleanText(source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || title.split('|')[0]);
  let extractedContent = extractBody(source);
  if (group === 'services') {
    extractedContent = extractedContent.replace(/<section\b[^>]*class=["'][^"']*page-header[^"']*["'][^>]*>[\s\S]*?<\/section>/i, '');
  }
  const content = rewriteContent(extractedContent, relativePath, prefix);
  const presentation = group === 'services' ? servicePresentation(relativePath) : null;
  const serviceHero = presentation ? `
  <section class="service-hero">
    <div class="shell service-hero-grid">
      <div class="service-hero-copy">
        <span class="service-category">${escapeHtml(presentation.category)}</span>
        <h1>${escapeHtml(h1)}</h1>
        <p>${escapeHtml(cleanText(description))}</p>
        <div class="service-hero-actions"><a class="button" href="${prefix}contact.html">Request a consultation</a><a href="#service-content">Explore the service <span>↓</span></a></div>
        <div class="service-trust"><span><b>ISO 9001:2015</b> certified</span><span><b>Pan-India</b> delivery</span><span><b>Audit to execution</b> support</span></div>
      </div>
      <div class="service-hero-media"><img src="${prefix}assets/images/${presentation.image}" alt="${escapeHtml(h1)}"><div><small>OUR FOCUS</small><b>${escapeHtml(presentation.focus)}</b></div></div>
    </div>
  </section>
  <div class="service-proof-strip"><div class="shell"><span>Specialist engineers</span><span>Clear technical reporting</span><span>Regulatory alignment</span><span>Measurable recommendations</span></div></div>` : '';
  const toolName = path.basename(relativePath, '.html');
  const toolScript = group === 'tools' && fs.existsSync(path.join(sourceRoot, 'js', 'tooljs', `${toolName}.min.js`))
    ? `<script src="${prefix}assets/js/tooljs/${toolName}.min.js" defer></script>` : '';
  const toolLegacyCss = group === 'tools' ? `<link rel="stylesheet" href="${prefix}assets/legacy-css/tools.min.css">` : '';

  const output = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="${prefix}assets/images/favicon.png">
  ${toolLegacyCss}
  <link rel="stylesheet" href="${prefix}css/core.css">
  <link rel="stylesheet" href="${prefix}css/content.css">
  <link rel="stylesheet" href="${prefix}css/${group}.css">
  <link rel="stylesheet" href="${prefix}css/responsive.css">
</head>
<body class="interior-page ${group}-page">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(prefix)}
  <div class="page-context"><div class="shell"><span>${groupLabel[group]}</span><b>${escapeHtml(h1)}</b><a href="${prefix}contact.html">Discuss a project</a></div></div>
  ${serviceHero}
  <main id="main" class="legacy-content"${group === 'services' ? ' data-service-page' : ''}>
    ${group === 'services' ? '<span id="service-content" class="anchor-target"></span>' : ''}
    ${content}
  </main>
  ${footer(prefix)}
  <script src="${prefix}js/core.js" defer></script>
  <script src="${prefix}js/${group}.js" defer></script>
  ${toolScript}
</body>
</html>`;

  const destination = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, output, 'utf8');
}

fs.mkdirSync(path.join(outputRoot, 'assets'), { recursive: true });
fs.cpSync(path.join(sourceRoot, 'images'), path.join(outputRoot, 'assets', 'images'), { recursive: true });
fs.cpSync(path.join(sourceRoot, 'js'), path.join(outputRoot, 'assets', 'js'), { recursive: true });
fs.mkdirSync(path.join(outputRoot, 'assets', 'legacy-css'), { recursive: true });
for (const name of ['tools.min.css']) {
  fs.copyFileSync(path.join(sourceRoot, 'css', name), path.join(outputRoot, 'assets', 'legacy-css', name));
}

fs.mkdirSync(path.join(outputRoot, 'css'), { recursive: true });
fs.mkdirSync(path.join(outputRoot, 'js'), { recursive: true });
fs.copyFileSync(path.join(outputRoot, 'style.css'), path.join(outputRoot, 'css', 'home.css'));
fs.copyFileSync(path.join(outputRoot, 'script.js'), path.join(outputRoot, 'js', 'home.js'));

const homepagePath = path.join(outputRoot, 'index.html');
const homepage = fs.readFileSync(homepagePath, 'utf8')
  .replace('href="style.css"', 'href="css/core.css">\n  <link rel="stylesheet" href="css/home.css">\n  <link rel="stylesheet" href="css/responsive.css"')
  .replace('src="script.js"', 'src="js/home.js"')
  .replaceAll('../services/', 'services/')
  .replaceAll('../case-studies/', 'case-studies/')
  .replaceAll('../privacy.html', 'privacy.html')
  .replaceAll('../terms.html', 'terms.html');
fs.writeFileSync(homepagePath, homepage, 'utf8');

await import('./scripts/enhance-seo.mjs');
await import('./scripts/generate-discovery.mjs');

console.log(`Generated ${sourcePages.length - 1} interior pages. Homepage retained. Total parallel pages: ${sourcePages.length}.`);
