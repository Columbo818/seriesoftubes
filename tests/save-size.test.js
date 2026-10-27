const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

// Make the browser's storage refuse the save: 'QuotaExceededError' (too big) or 'SecurityError' (not allowed).
const refuse = name => `window.__err=${JSON.stringify(name)};{const P=Object.getPrototypeOf(localStorage),set=P.setItem;
  P.setItem=function(k,v){if(k==='sot-save-v1'&&__err){const e=new Error('no');e.name=__err;throw e;}return set.call(this,k,v);};}`;

test('#176 a save that does not fit tells the player once, with Export, and the menu says so', () => {
  const { ev, dom, errors } = load();
  ev("ACT.start({});UI.saveFail=null;" + refuse('QuotaExceededError'));
  ev('save()');
  const toasts = () => [...dom.window.document.querySelectorAll('.toast')].filter(t => /not being saved/.test(t.textContent));
  assert.equal(toasts().length, 1, 'one warning');
  assert.match(toasts()[0].textContent, /too big for this browser/);
  assert.ok(toasts()[0].querySelector('[data-act=exportSave]'), 'with an Export button');
  ev('UI.saveFail.at-=1e6;save();save(true)');
  assert.equal(toasts().length, 1, 'not again for every retry');
  ev('ACT.menu()');
  const card = ev("document.getElementById('modalCard').innerHTML");
  assert.match(card, /not being saved/);
  assert.doesNotMatch(card, /saves itself every few seconds/, 'the menu no longer claims it saves');
  // Once a save works again, the menu goes back to normal.
  ev("__err=null;save(true);ACT.menu()");
  assert.equal(ev('saveFailing()'), false);
  assert.match(ev("document.getElementById('modalCard').innerHTML"), /saves itself every few seconds/);
  assert.deepEqual(errors, []);
});

test('#176 storage that is blocked altogether gets its own advice', () => {
  const { ev, dom, errors } = load();
  ev("ACT.start({});UI.saveFail=null;" + refuse('SecurityError') + ';save()');
  assert.match(dom.window.document.body.textContent, /private window/);
  assert.deepEqual(errors, []);
});
