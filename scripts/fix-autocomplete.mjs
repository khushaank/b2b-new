import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd());
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extname(entry.name).toLowerCase() === '.html') htmlFiles.push(full);
  }
}

function autocompleteFor(tag) {
  const type = tag.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
  if (['hidden', 'submit', 'reset', 'button', 'image', 'file', 'checkbox', 'radio'].includes(type)) return null;
  const identity = [
    tag.match(/\bname=["']([^"']+)["']/i)?.[1],
    tag.match(/\bid=["']([^"']+)["']/i)?.[1],
    type,
  ].filter(Boolean).join(' ').toLowerCase().replace(/[-\s]+/g, '_');
  if (/(^|_)first_?name($|_)/.test(identity)) return 'given-name';
  if (/(^|_)last_?name($|_)/.test(identity)) return 'family-name';
  if (/(^|_)(name|full_?name|contact_?name)($|_)/.test(identity)) return 'name';
  if (/(email|e_mail)/.test(identity)) return 'email';
  if (/(phone|mobile|telephone|\btel\b)/.test(identity)) return 'tel';
  if (/(company|organisation|organization|business)/.test(identity)) return 'organization';
  if (/(designation|job_?title|position)/.test(identity)) return 'organization-title';
  if (/(postal|pincode|pin_?code|zip)/.test(identity)) return 'postal-code';
  if (/(street|address)/.test(identity)) return 'street-address';
  if (/(city|locality)/.test(identity)) return 'address-level2';
  if (/(state|province|region)/.test(identity)) return 'address-level1';
  if (/(country)/.test(identity)) return 'country-name';
  if (/(website|\burl\b)/.test(identity)) return 'url';
  return 'off';
}

function addAutocomplete(tag) {
  if (/\bautocomplete=["'][^"']+["']/i.test(tag)) return tag;
  const value = autocompleteFor(tag);
  if (!value) return tag;
  if (/\s*\/>$/.test(tag)) return tag.replace(/\s*\/>$/, ` autocomplete="${value}" />`);
  return tag.replace(/>$/, ` autocomplete="${value}">`);
}

walk(root);
let changedFiles = 0;
let changedFields = 0;
for (const file of htmlFiles) {
  const source = readFileSync(file, 'utf8');
  const updated = source.replace(/<(?:input|select|textarea)\b[^>]*>/gi, (tag) => {
    const next = addAutocomplete(tag);
    if (next !== tag) changedFields += 1;
    return next;
  });
  if (updated !== source) {
    writeFileSync(file, updated, 'utf8');
    changedFiles += 1;
  }
}
console.log(`Autocomplete fixed: ${changedFields} fields across ${changedFiles} files.`);
