const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');

test('build stamps version and date into the site', () => {
  execFileSync('bash', ['scripts/build.sh'], { cwd: root, env: { ...process.env, VERSION: '9.9.9', BUILD_DATE: '2030-01-01' } });
  const html = fs.readFileSync(path.join(root, '_site', 'index.html'), 'utf8');
  assert.match(html, /const APP_VERSION='9\.9\.9'/);
  assert.match(html, /"softwareVersion": "9\.9\.9"/);
  assert.match(fs.readFileSync(path.join(root, '_site', 'sitemap.xml'), 'utf8'), /<lastmod>2030-01-01<\/lastmod>/);
  for (const f of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'site.webmanifest', 'robots.txt', 'images/og-image.png', '404.html', 'CNAME', 'version.json']) {
    assert.ok(fs.existsSync(path.join(root, '_site', f)), `${f} is shipped`);
  }
});

test('version.json carries the release notes from the changelog', () => {
  execFileSync('bash', ['scripts/build.sh'], { cwd: root, env: { ...process.env, VERSION: '1.0.0', BUILD_DATE: '2026-10-23' } });
  const v = JSON.parse(fs.readFileSync(path.join(root, '_site', 'version.json'), 'utf8'));
  assert.equal(v.version, '1.0.0');
  assert.ok(v.notes.length >= 5);
  assert.ok(v.notes.every((n) => !n.startsWith('-')));
});

test('head carries the SEO and social metadata', () => {
  const html = fs.readFileSync(path.join(root, 'site', 'index.html'), 'utf8');
  for (const needle of ['<link rel="canonical" href="https://seriesoftub.es/">', 'property="og:image"', 'name="twitter:card"', 'application/ld+json', 'rel="manifest"', 'name="description"']) {
    assert.ok(html.includes(needle), `missing ${needle}`);
  }
  for (const block of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(block.replace(/<\/?script[^>]*>/g, ''));
  }
});
