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

// A network with plenty of alien waves and ordinary customers, the shape of big late-game saves.
const bigBiz = "ACT.start({});S.cash=1e9;ACT.launchBB({city:'fra'});ACT.buildPop({city:'ams'});" +
  "S.links.push({id:'df1',a:'fra',b:'ams',kind:'df',own:true,km:450,sys:'roadm',ch:[],ready:0,mo:500,day:0,cut:0});" +
  "for(let i=0;i<300;i++){const slots=1+i%4;S.biz.push({id:'w'+i,city:'fra',city2:'ams',reqs:[],latMax:null,route:'normal',name:'Carrier '+i,type:'wwave',bw:1,rate:4000,mood:100-i%9*1.37,since:i,sites:null,link:'df1',slots,what:wwWhat(S.links.find(l=>l.id==='df1'),slots),pm:i%2?100:99,warned:i%5===0,warn60:false});}" +
  "S.biz.push({id:'l2',city:'fra',city2:'ams',reqs:['diverse'],latMax:3.2,route:'fast',name:'Fast Co',type:'hft',bw:5,rate:900,mood:80,since:0,sites:null,slots:0,pm:81,warned:false,warn60:true});" +
  "S.biz.push({id:'d1',city:'fra',city2:null,reqs:[],latMax:null,route:'normal',name:'Plain Co',type:'dia',bw:5,rate:600,mood:100,since:0,sites:null,slots:0});compute()";
const sorted = "JSON.stringify(S.biz.map(b=>Object.keys(b).sort().map(k=>[k,b[k]])))";

test('#176 saves leave customer defaults out, and loading puts them back exactly', () => {
  const { ev, errors } = load();
  ev(bigBiz);
  const full = ev('JSON.stringify(S).length'), packed = ev('JSON.stringify(packSave(S)).length');
  assert.ok(packed < full * 0.75, `the save is much smaller (${packed} vs ${full})`);
  const before = ev(sorted);
  ev("save(true);S=migrate(loadSave());compute()");
  const after = JSON.parse(ev(sorted)), want = JSON.parse(before);
  // Customers that never got warnings or a previous mood come back with the defaults; everything else is identical.
  const norm = list => list.map(b => Object.fromEntries(b)).map(b => ({ pm: b.mood, warned: false, warn60: false, ...b }));
  assert.deepEqual(norm(after), norm(want));
  assert.equal(ev("S.biz.find(b=>b.id==='l2').route"), 'fast', 'a chosen route is kept');
  assert.equal(ev("S.biz.find(b=>b.id==='w7').what"), ev("wwWhat(S.links.find(l=>l.id==='df1'),4)"), 'alien waves get their description back');
  assert.match(ev("localStorage.getItem('sot-save-v1')"), /"Carrier 1"/);
  assert.doesNotMatch(ev("localStorage.getItem('sot-save-v1')"), /alien wave on your/, 'descriptions are not stored');
  assert.deepEqual(errors, []);
});

test('#176 an older, unpacked save still loads the same', () => {
  const { ev, errors } = load();
  ev(bigBiz);
  const before = ev(sorted);
  ev("S=migrate(JSON.parse(JSON.stringify(S)));compute()");
  const norm = list => list.map(b => Object.fromEntries(b)).map(b => ({ pm: b.mood, warned: false, warn60: false, ...b }));
  assert.deepEqual(norm(JSON.parse(ev(sorted))), norm(JSON.parse(before)));
  assert.deepEqual(errors, []);
});
