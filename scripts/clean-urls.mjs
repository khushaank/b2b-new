import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = [];
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) walk(path);
  else if (entry.name.endsWith('.html')) files.push(path);
});
walk(root);

let changed = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = before.replaceAll('https://b2bindustrial.in/success.html', 'https://b2bindustrial.in/success').replace(/href=(['"])(?!https?:|mailto:|tel:|data:)([^'"?#]*?)\.html([?#][^'"]*)?\1/gi, (_, quote, path, suffix = '') => {
    const clean = /(?:^|\/)index$/i.test(path) ? path.replace(/index$/i, '') || './' : path;
    return `href=${quote}${clean}${suffix}${quote}`;
  });
  if (after !== before) {
    writeFileSync(file, after);
    changed += 1;
  }
}
console.log(`Cleaned internal HTML links in ${changed} files.`);
