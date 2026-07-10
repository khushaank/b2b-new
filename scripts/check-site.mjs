import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (extname(entry.name) === '.html') htmlFiles.push(fullPath);
  }
}

walk(root);
const errors = [];
const indexedTitles = new Map();
const indexedDescriptions = new Map();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const display = relative(root, file);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${display}: expected one h1, found ${h1Count}`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${display}: missing title`);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1] || '';
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const manifestHref = html.match(/<link\s+rel=["']manifest["']\s+href=["']([^"']+)["']/i)?.[1];
  const faviconCount = (html.match(/<link\s+rel=["']icon["']/gi) || []).length;
  const canonicalCount = (html.match(/<link\s+rel=["']canonical["']/gi) || []).length;
  const seoStartCount = (html.match(/<!-- SEO:START -->/g) || []).length;
  const seoEndCount = (html.match(/<!-- SEO:END -->/g) || []).length;
  if (!description) errors.push(`${display}: missing meta description`);
  if (!canonical || !canonical.startsWith('https://b2bindustrial.in/')) errors.push(`${display}: missing or invalid canonical URL`);
  if (!manifestHref || /^https?:\/\//i.test(manifestHref)) errors.push(`${display}: manifest must use a same-origin relative URL`);
  if (faviconCount !== 1) errors.push(`${display}: expected one favicon link, found ${faviconCount}`);
  if (canonicalCount !== 1) errors.push(`${display}: expected one canonical URL, found ${canonicalCount}`);
  if (seoStartCount !== 1 || seoEndCount !== 1) errors.push(`${display}: invalid generated SEO block markers`);
  if (!/<meta\s+property=["']og:title["']/i.test(html)) errors.push(`${display}: missing Open Graph title`);
  if (!/<meta\s+name=["']twitter:card["']/i.test(html)) errors.push(`${display}: missing Twitter card`);
  if (!/class=["'][^"']*site-preloader/i.test(html)) errors.push(`${display}: missing load-synced preloader`);
  if (/<footer\b/i.test(html) && !/<footer[\s\S]*?>[\s\S]*?href=["'][^"']*tools\//i.test(html)) errors.push(`${display}: footer is missing Engineering tools link`);
  if (/href=["']#["']\s+class=["'][^"']*related-link/i.test(html)) errors.push(`${display}: unresolved related-link placeholder`);
  for (const tag of html.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || []) {
    if (!/rel=["'][^"']*noopener/i.test(tag)) errors.push(`${display}: external new-tab link missing noopener`);
  }
  for (const tag of html.match(/<(?:input|select|textarea)\b[^>]*>/gi) || []) {
    const type = tag.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
    if (['hidden', 'submit', 'reset', 'button', 'image', 'file', 'checkbox', 'radio'].includes(type)) continue;
    if (!/\bautocomplete=["'][^"']+["']/i.test(tag)) errors.push(`${display}: form field missing autocomplete ${tag.slice(0, 110)}`);
  }
  for (const form of html.match(/<form\b(?=[^>]*\baction=["']https:\/\/api\.web3forms\.com\/submit["'])[^>]*>[\s\S]*?<\/form>/gi) || []) {
    if (!/\bname=["']botcheck["']/.test(form)) errors.push(`${display}: Web3Forms form missing botcheck`);
  }
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] || '';
  if (!/<img\b/i.test(main)) errors.push(`${display}: main content has no image`);

  const schemaBlocks = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (!schemaBlocks.length) errors.push(`${display}: missing JSON-LD structured data`);
  for (const [, json] of schemaBlocks) {
    try { JSON.parse(json); } catch { errors.push(`${display}: invalid JSON-LD`); }
  }

  if (!/noindex/i.test(robots)) {
    const titleKey = title?.toLowerCase();
    const descriptionKey = description?.toLowerCase();
    if (titleKey) indexedTitles.set(titleKey, [...(indexedTitles.get(titleKey) || []), display]);
    if (descriptionKey) indexedDescriptions.set(descriptionKey, [...(indexedDescriptions.get(descriptionKey) || []), display]);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const idSet = new Set(ids);
  for (const label of html.match(/<label\b[^>]*>[\s\S]*?<\/label>/gi) || []) {
    const target = label.match(/\bfor=["']([^"']+)["']/i)?.[1];
    if (target && !idSet.has(target)) errors.push(`${display}: label references missing field #${target}`);
    if (!target && !/<(?:input|select|textarea)\b/i.test(label)) errors.push(`${display}: label is not associated with a form field`);
  }
  for (const id of new Set(ids)) {
    if (ids.filter((value) => value === id).length > 1) errors.push(`${display}: duplicate id #${id}`);
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1].split('#')[0].split('?')[0];
    if (!reference || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) continue;
    const target = resolve(dirname(file), decodeURIComponent(reference));
    if (!existsSync(target)) errors.push(`${display}: broken reference ${match[1]}`);
  }
}

for (const [title, files] of indexedTitles) {
  if (files.length > 1) errors.push(`duplicate indexed title "${title}": ${files.join(', ')}`);
}
for (const [description, files] of indexedDescriptions) {
  if (files.length > 1) errors.push(`duplicate indexed description "${description}": ${files.join(', ')}`);
}
if (!existsSync(join(root, 'sitemap.xml'))) errors.push('missing sitemap.xml');
if (!existsSync(join(root, 'robots.txt'))) errors.push('missing robots.txt');
for (const artifact of ['sitemap-images.xml', 'site.webmanifest', 'manifest.json', 'sw.js', 'offline.html', 'rss.xml', 'opensearch.xml', 'llms.txt', 'humans.txt', 'schema-master.json', '.htaccess', '.well-known/security.txt']) {
  if (!existsSync(join(root, artifact))) errors.push(`missing ${artifact}`);
}

if (errors.length) {
  console.error(`Site check failed with ${errors.length} issue(s):\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Site check passed: ${htmlFiles.length} HTML pages with valid structure, local references, metadata and JSON-LD.`);
}
