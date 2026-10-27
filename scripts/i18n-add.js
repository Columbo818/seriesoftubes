#!/usr/bin/env node
// Adds, changes, renames or removes dictionary entries, keeping every site/i18n/*.js sorted (scripts/lib/dict.js).
//
//   node scripts/i18n-add.js changes.json     {"it": {"English": "Italiano", "Old text": null}, "pt": {…}}
//                                             a string adds or replaces the entry, null removes it
//   node scripts/i18n-add.js -                the same JSON from stdin
//   node scripts/i18n-add.js --rename "Old English" "New English"    move a key in every dictionary
const fs = require('node:fs');
const D = require('./lib/dict');

const args = process.argv.slice(2);
if (args[0] === '--rename') {
  const [, from, to] = args;
  if (!from || !to) { console.error('usage: i18n-add.js --rename "Old English" "New English"'); process.exit(2); }
  for (const lang of D.langs()) {
    const { header, dict } = D.read(lang);
    if (!(from in dict)) { console.log(`${lang}: no entry for ${JSON.stringify(from)}`); continue; }
    if (to in dict && to !== from) { console.error(`${lang}: already has ${JSON.stringify(to)}`); process.exit(1); }
    dict[to] = dict[from];
    if (to !== from) delete dict[from];
    D.write(lang, dict, header);
    console.log(`${lang}: renamed`);
  }
  process.exit(0);
}
if (args.length !== 1) { console.error('usage: i18n-add.js changes.json | - | --rename OLD NEW'); process.exit(2); }
const changes = JSON.parse(fs.readFileSync(args[0] === '-' ? 0 : args[0], 'utf8'));
for (const [lang, entries] of Object.entries(changes)) {
  if (!D.langs().includes(lang)) { console.error(`no dictionary site/i18n/${lang}.js`); process.exit(1); }
  const { header, dict } = D.read(lang);
  let add = 0, del = 0;
  for (const [en, xx] of Object.entries(entries)) {
    if (xx === null) { if (en in dict) { delete dict[en]; del++; } continue; }
    if (typeof xx !== 'string' || !xx.trim()) { console.error(`${lang}: empty translation for ${JSON.stringify(en)}`); process.exit(1); }
    dict[en] = xx; add++;
  }
  D.write(lang, dict, header);
  console.log(`${lang}: ${add} added or changed, ${del} removed`);
}
