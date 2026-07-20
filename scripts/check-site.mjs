import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');
const servicesModule = read('js', 'services-data.js');
const { serviceCategories } = await import(`data:text/javascript;base64,${Buffer.from(servicesModule).toString('base64')}`);
const errors = [];
const home = read('index.html');
const contact = read('contact.html');
const locations = read('locations', 'index.html');
const sitemap = read('sitemap.xml');
const htaccess = read('.htaccess');
const coreJs = read('js', 'core.js');
const coreCss = read('css', 'core.css');
const locationFiles = readdirSync(join(root, 'locations'))
  .filter((name) => name.endsWith('.html') && name !== 'index.html');
const htmlFiles = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) htmlFiles.push(file);
  }
};

const requireMatch = (text, pattern, message) => {
  if (!pattern.test(text)) errors.push(message);
};
const checkJsonLd = (name, html) => {
  for (const json of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json[1]); } catch { errors.push(`${name} contains invalid JSON-LD`); }
  }
};
const localTargetExists = (pathname) => {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, '');
  const target = join(root, decoded);
  return existsSync(target)
    || existsSync(`${target}.html`)
    || existsSync(join(target, 'index.html'));
};

requireMatch(home, /<title>Industrial Audits, Compliance, HVAC &amp; Turnkey Projects \| B2B Industrial Solutions<\/title>/,
  'homepage multidisciplinary-services title is missing');
requireMatch(home, /<h1[^>]*>Engineering safer, compliant and more efficient facilities\.<\/h1>/,
  'homepage multidisciplinary-services heading is missing');
if (serviceCategories.length !== 11) errors.push('service navigation must contain exactly 11 categories');
if (serviceCategories.reduce((total, category) => total + category.services.length, 0) !== 84) {
  errors.push('service navigation must contain the complete 84-service hierarchy');
}
for (const category of serviceCategories) {
  if (!localTargetExists(category.href)) errors.push(`service category links to missing target ${category.href}`);
  for (const service of category.services) {
    if (!localTargetExists(service.href)) errors.push(`service navigation links to missing target ${service.href}`);
  }
}
requireMatch(home, /<link rel="icon" href="\/favicon\.png"/,
  'homepage must declare the stable root favicon');
requireMatch(home, /"contentUrl": "https:\/\/b2bindustrial\.in\/favicon\.png"/,
  'homepage Organization schema must declare the current logo');
if ((contact.match(/\bdata-step(?:\s|>)/g) || []).length !== 3) {
  errors.push('contact form must have exactly three grouped steps');
}
requireMatch(contact, /data-step-label>Step 1 of 3</,
  'contact form must start with the three-step progress label');
requireMatch(contact,
  /data-step-name="Contact details"[\s\S]*name="name"[\s\S]*name="company"[\s\S]*name="email"[\s\S]*name="phone"/,
  'step 1 must contain all contact fields');
requireMatch(contact,
  /data-step-name="Requirement"[\s\S]*name="service"[\s\S]*name="message"/,
  'step 2 must contain service and requirement fields');
requireMatch(contact,
  /data-step-name="Confirm and send"[\s\S]*name="consent"/,
  'step 3 must contain review and consent');
requireMatch(htaccess, /^AcceptPathInfo Off$/m,
  'Apache must reject invalid path info instead of returning 500');
requireMatch(htaccess, /RewriteRule \^ https:\/\/b2bindustrial\.in%\{REQUEST_URI\} \[R=301,L,NE\]/,
  'production redirects must use the canonical host');
requireMatch(htaccess, /RewriteRule \^search\/\?\$ - \[G,L\]/,
  'retired search URLs must return 410');
requireMatch(htaccess, /RewriteRule \^servicess\?\/\?\$ \/service \[R=301,L,NE\]/,
  'legacy services URLs must redirect to /service');
if (/addEventListener\(['"]copy['"]/.test(coreJs)) errors.push('copying must not be blocked');
if (/user-select:\s*none/.test(coreCss)) errors.push('site content must remain selectable');
if (/\.register\([^)]*sw\.js/.test(coreJs)) errors.push('the retired service worker must not be registered');
requireMatch(coreJs, /name="consent" value="Agreed" required/,
  'Web3Forms submissions must require contact consent');
requireMatch(coreJs, /submitting \|\| !validateBeforeSubmit\(\) \|\| !form\.reportValidity\(\)/,
  'the guided contact form must prevent invalid or duplicate submissions');
if (existsSync(join(root, 'opensearch.xml'))) errors.push('opensearch.xml must remain removed');
if (existsSync(join(root, 'sw.js'))) errors.push('sw.js must remain removed');
for (const [source, target] of [
  ['about-us', '/about'],
  ['contact-us', '/contact'],
  ['our_clients', '/clients'],
  ['terms-and-conditions', '/terms'],
  ['services/energy-audit', '/services/energy-audits'],
  ['services/vesda', '/services/fire-detection'],
  ['services/hse-fire-safety', '/services/fire-life-safety'],
  ['services/fire-pump-testing', '/services/fire-compliance'],
  ['b2b-services/hvac', '/services/hvac-projects'],
  ['b2b-services/fire-management', '/services/fire-projects'],
  ['b2b-services/led-lights', '/services/lighting-projects'],
  ['b2b-services/liasion-services-for-regulatory-compliances', '/services/compliances'],
]) {
  requireMatch(htaccess, new RegExp(`RewriteRule \\^${source.replaceAll('/', '\\/')}.*? ${target.replaceAll('/', '\\/')} \\[R=301,L,NE\\]`),
    `${source} must redirect to ${target}`);
}

walk(root);
for (const file of htmlFiles) {
  const name = file.slice(root.length + 1);
  const html = readFileSync(file, 'utf8');
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  requireMatch(html, /<link(?=[^>]*\brel="icon")(?=[^>]*\bhref="\/favicon\.png")[^>]*>/,
    `${name} must declare the stable root favicon`);
  requireMatch(html, /<title>[^<]+<\/title>/, `${name} must have a title`);
  requireMatch(html, /<meta(?=[^>]*\bname="description")(?=[^>]*\bcontent="[^"]+")[^>]*>/,
    `${name} must have a meta description`);
  requireMatch(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/, `${name} must have an h1`);
  requireMatch(html, /<link(?=[^>]*\brel="canonical")(?=[^>]*\bhref="https:\/\/b2bindustrial\.in\/[^"]*")[^>]*>/,
    `${name} must have a canonical URL on the production host`);
  if (!noindex && canonical && !sitemap.includes(`<loc>${canonical}</loc>`)) {
    errors.push(`${name} is missing from sitemap.xml`);
  }
  if (/opensearch/i.test(html)) errors.push(`${name} references retired OpenSearch metadata`);
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\bwidth="\d+"/i.test(match[0]) || !/\bheight="\d+"/i.test(match[0])) {
      errors.push(`${name} contains an image without intrinsic dimensions`);
    }
  }
  for (const match of html.matchAll(/<form\b[^>]*api\.web3forms\.com[\s\S]*?<\/form>/gi)) {
    if (!/name="botcheck"/i.test(match[0])) errors.push(`${name} has a public form without a bot trap`);
  }
  const basePath = html.match(/<base\s+href="([^"]+)"/i)?.[1] || '/' + relative(root, file).replaceAll('\\', '/');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const value = match[1];
    if (/^(?:#|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    const url = new URL(value, `https://b2bindustrial.in${basePath}`);
    if (url.hostname === 'b2bindustrial.in' && !localTargetExists(url.pathname)) {
      errors.push(`${name} links to missing local target ${url.pathname}`);
    }
  }
  if (/<a\b[^>]*>\s*(?:Learn|Read) More\s*(?:<i\b[^>]*><\/i>)?\s*<\/a>/i.test(html)) {
    errors.push(`${name} contains a non-descriptive link label`);
  }
  checkJsonLd(name, html);
}

for (const code of ['404', '410', '421', '429', '500', '503']) {
  requireMatch(read(`${code}.html`), /<base href="\/">/,
    `${code}.html must resolve assets from the site root`);
}

for (const name of locationFiles) {
  const slug = name.slice(0, -5);
  const html = read('locations', name);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!locations.includes(`./${slug}`)) errors.push(`locations/index.html does not link ${name}`);
  if (!canonical || !sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`${name} is missing from sitemap.xml`);
}

if (!existsSync(join(root, 'favicon.png'))) errors.push('favicon.png is missing');

if (errors.length) {
  console.error(`Site check failed:\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Site check passed: ${htmlFiles.length} pages, routing, error handling, favicon and ${locationFiles.length} location pages.`);
}
