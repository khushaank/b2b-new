import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (extname(entry.name) === '.html') htmlFiles.push(fullPath);
  }
}

walk(root);
const errors = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const display = relative(root, file);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${display}: expected one h1, found ${h1Count}`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${display}: missing title`);

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
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

if (errors.length) {
  console.error(`Site check failed with ${errors.length} issue(s):\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Site check passed: ${htmlFiles.length} HTML pages, no broken local references or structural errors.`);
}
