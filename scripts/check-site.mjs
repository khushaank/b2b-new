import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');
const errors = [];
const home = read('index.html');
const locations = read('locations', 'index.html');
const sitemap = read('sitemap.xml');
const htaccess = read('.htaccess');
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

requireMatch(home, /<title>Industrial Audit Company in India \| B2B Industrial Solutions<\/title>/,
  'homepage audit-company title is missing');
requireMatch(home, /<h1>Pan-India industrial audits/,
  'homepage Pan-India audit heading is missing');
requireMatch(home, /<link rel="icon" href="\/favicon\.png"/,
  'homepage must declare the stable root favicon');
requireMatch(home, /"contentUrl": "https:\/\/b2bindustrial\.in\/favicon\.png"/,
  'homepage Organization schema must declare the current logo');
requireMatch(htaccess, /^AcceptPathInfo Off$/m,
  'Apache must reject invalid path info instead of returning 500');
requireMatch(htaccess, /RewriteRule \^servicess\?\/\?\$ \/service \[R=301,L,NE\]/,
  'legacy services URLs must redirect to /service');

walk(root);
for (const file of htmlFiles) {
  const name = file.slice(root.length + 1);
  const html = readFileSync(file, 'utf8');
  requireMatch(html, /<link rel="icon" href="\/favicon\.png"/,
    `${name} must declare the stable root favicon`);
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
