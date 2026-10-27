#!/usr/bin/env node
// Carries a branch that still edits site/index.html (started before the page was split into src/) over
// to the src/ layout. Run it in the middle of merging main into that branch:
//
//   git checkout my-branch
//   git merge origin/main                        # stops: site/index.html was deleted on main
//   node scripts/legacy/port-branch.js           # moves your edits into src/, merges the dictionaries
//   git status                                   # fix any conflict markers it reports, then
//   git commit
//
// How: your branch's site/index.html and the one you started from are both split with the same rules
// that made src/ (split-index-html.js + transforms.js), and each partial gets a three-way merge
// (git merge-file) into the src/ file from main. Your dictionary changes (site/i18n/*.js) are applied
// entry by entry onto main's sorted dictionaries, so appended lines never conflict.
//
// Options: --base REF (the pre-split commit your page started from; default: merge-base of HEAD and
// MERGE_HEAD) and --theirs REF (your branch; default HEAD).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { split } = require('./split-index-html');
const { transform } = require('./transforms');
const D = require('../lib/dict');

const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
const show = (ref, p) => { try { return git('show', `${ref}:${p}`); } catch { return null; } };
const die = (m) => { console.error(`port-branch: ${m}`); process.exit(1); };

let mergeHead = null;
try { mergeHead = git('rev-parse', '-q', '--verify', 'MERGE_HEAD').trim(); } catch {}
const theirs = opt('--theirs', 'HEAD');
const base = opt('--base', null) || (mergeHead ? git('merge-base', theirs, mergeHead).trim() : null);
if (!base) die('no merge in progress: run `git merge origin/main` first, or pass --base REF');
if (!fs.existsSync(path.join(ROOT, 'src', 'index.html'))) die('src/ is missing: merge main (which has src/) first');

const basePage = show(base, 'site/index.html'), theirPage = show(theirs, 'site/index.html');
if (!basePage) die(`${base} has no site/index.html; is it from before the split?`);
if (!theirPage) die(`${theirs} has no site/index.html; nothing to port`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tubes-port-'));
const parts = (html, label) => {
  try { return new Map(transform(split(html))); }
  catch (e) { die(`could not split ${label}'s site/index.html the way src/ was made: ${e.message}`); }
};
const B = parts(basePage, 'the base'), T = parts(theirPage, 'your branch');
let changed = 0;
const conflicts = [];
for (const [file, t] of T) {
  const b = B.get(file);
  if (b === t) continue;   // you did not touch this part
  const ours = path.join(ROOT, 'src', file);
  if (!fs.existsSync(ours)) { conflicts.push(`${file} (no longer exists on main; apply your change by hand)`); continue; }
  const fb = path.join(tmp, 'base'), ft = path.join(tmp, 'theirs');
  fs.writeFileSync(fb, b || '');
  fs.writeFileSync(ft, t);
  const r = spawnSync('git', ['merge-file', '-L', 'main', '-L', 'base', '-L', 'your branch', ours, fb, ft], { cwd: ROOT });
  changed++;
  if (r.status !== 0) conflicts.push(`src/${file}`);
}

// Dictionaries: your additions, edits and removals, applied onto main's sorted files.
for (const lang of D.langs()) {
  const rel = `site/i18n/${lang}.js`;
  const tb = show(base, rel), tt = show(theirs, rel);
  if (!tt || tb === tt) continue;
  const db = tb ? D.parse(tb, lang) : {}, dt = D.parse(tt, lang);
  const main = mergeHead ? show(mergeHead, rel) : null;
  // During a merge the working file may hold conflict markers, so start from main's own copy.
  const { header, dict } = main ? { header: main.slice(0, main.indexOf('(window.I18N')), dict: D.parse(main, lang) } : D.read(lang);
  let n = 0;
  for (const k of new Set([...Object.keys(db), ...Object.keys(dt)])) {
    if (db[k] === dt[k]) continue;
    if (k in dict && db[k] !== dict[k] && dict[k] !== dt[k] && k in dt) conflicts.push(`${rel}: ${JSON.stringify(k)} changed on both sides (kept yours)`);
    if (k in dt) dict[k] = dt[k]; else delete dict[k];
    n++;
  }
  D.write(lang, dict, header);
  git('add', rel);
  console.log(`${rel}: ${n} of your entries applied`);
}

if (fs.existsSync(path.join(ROOT, 'site', 'index.html'))) fs.rmSync(path.join(ROOT, 'site', 'index.html'));
try { git('rm', '-q', '--cached', '--ignore-unmatch', 'site/index.html'); } catch {}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Ported your site/index.html changes into ${changed} file(s) under src/.`);
if (conflicts.length) {
  console.log('Resolve these by hand (look for <<<<<<< markers), then git add them:');
  for (const c of conflicts) console.log(`  ${c}`);
  process.exit(1);
}
git('add', 'src');
console.log('No conflicts. Run npm test, then git commit.');
