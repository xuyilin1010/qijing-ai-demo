import { readFileSync, writeFileSync } from 'node:fs';

const base = new URL('./', import.meta.url);
const source = readFileSync(new URL('article-fragment.html', base), 'utf8');
const mapping = JSON.parse(readFileSync(new URL('wechat-image-map.json', base), 'utf8'));
const required = [...new Set([...source.matchAll(/\{\{WECHAT_IMAGE:([^}]+)\}\}/g)].map(match => match[1]))];
const missing = required.filter(name => !mapping[name] || !/^https:\/\//i.test(mapping[name]));
if (missing.length) {
  console.error('Missing HTTPS image URLs:', missing.join(', '));
  process.exitCode = 1;
} else {
  let output = source;
  for (const name of required) output = output.replaceAll(`{{WECHAT_IMAGE:${name}}}`, mapping[name].replaceAll('&', '&amp;').replaceAll('"', '&quot;'));
  writeFileSync(new URL('article-wechat-ready.html', base), output, 'utf8');
  console.log(`Replaced ${required.length} image URLs.`);
}
