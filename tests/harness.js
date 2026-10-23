// Loads site/index.html in jsdom with the animation loop disabled, so tests can
// drive the simulation directly through the game's globals (ACT, S, R, dayTick…).
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

function load(opts = {}) {
  const file = opts.file || path.join(__dirname, '..', 'site', 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => {
    // jsdom has no canvas; drawing calls are expected to be unimplemented.
    if (!/getContext|Not implemented/.test(e.message)) errors.push(e.message);
  });
  const dom = new JSDOM(html, {
    url: 'https://tests.invalid/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.__TUBES_TEST__ = true;
      for (const [k, v] of Object.entries(opts.storage || {})) window.localStorage.setItem(k, v);
      window.Path2D = class { moveTo() {} quadraticCurveTo() {} closePath() {} };
    },
  });
  const ev = (src) => dom.window.eval(src);
  return { dom, ev, errors };
}

// Deterministic Math.random so failures are reproducible.
function seed(ev, n) {
  ev(`Math.random=(()=>{let s=${n};return()=>{s=(s*16807)%2147483647;return s/2147483647;};})();`);
}

module.exports = { load, seed };
