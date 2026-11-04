import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', 'tests']);
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name)) return [];
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) : [filename];
  });
}
let checked = 0;
function check(reference, base, source) {
  if (!reference || /^(?:[a-z]+:|#|\/\/)/i.test(reference) || reference.includes('${')) return;
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  if (!clean) return;
  assert.ok(fs.existsSync(path.resolve(base, clean)), source + ': missing ' + reference);
  checked++;
}
for (const filename of walk(root)) {
  if (!/\.(html|css|webmanifest)$/.test(filename)) continue;
  const source = path.relative(root, filename);
  const text = fs.readFileSync(filename, 'utf8');
  const base = source === 'tools/landing/landing.css' ? path.join(root, 'site') : path.dirname(filename);
  if (filename.endsWith('.webmanifest')) {
    for (const icon of JSON.parse(text).icons || []) check(icon.src, base, source);
    continue;
  }
  for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']|url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    check(match[1] || match[2], base, source);
  }
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const entrypoints = [
  manifest.background.service_worker, manifest.action.default_popup, manifest.options_page,
  ...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon),
  ...manifest.content_scripts.flatMap(script => [...script.js, ...script.css])
];
for (const entry of entrypoints) check(entry, root, 'manifest.json');
for (const group of manifest.web_accessible_resources) {
  for (const entry of group.resources) check(entry.replace(/\*$/, ''), root, 'manifest.json');
}
console.log('Verified ' + checked + ' local asset references and extension entrypoints.');
