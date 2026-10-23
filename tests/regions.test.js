const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

function start(ev) { ev("ACT.start({});S.cash=1e9;S.lvl=4;for(const g of GOALS)S.done[g.id]=0"); }

test('new cities exist, sit on land and have sellers, cables and IX members', () => {
  const { ev, errors } = load();
  start(ev);
  const ids = ['for', 'rio', 'bue', 'scl', 'lim', 'bog', 'pan', 'del', 'maa', 'blr', 'hyd', 'tpe', 'auh', 'fuj', 'cpt'];
  for (const c of ids) {
    assert.ok(ev(`!!CITY['${c}']`), c);
    assert.ok(ev(`NETS.some(n=>n.price&&n.pops.includes('${c}'))`), `${c} has a transit seller`);
  }
  for (const c of ['for', 'rio', 'bue', 'scl', 'lim', 'bog', 'pan', 'maa', 'tpe', 'fuj', 'cpt'])
    assert.ok(ev(`CABLE_PAIRS.some(p=>p.a==='${c}'||p.b==='${c}')`), `${c} has a cable`);
  assert.ok(ev("ixMembers('sao').includes('clr')&&ixMembers('del').includes('jio')&&ixMembers('tpe').includes('cht')"));
  assert.ok(ev("CABLE_PAIRS.some(p=>(p.a==='scl'&&p.b==='syd')||(p.a==='syd'&&p.b==='scl'))"), 'Humboldt-ish cable to Sydney');
  assert.deepEqual(errors, []);
});

test('South America: no land route over the Darién Gap, the Andes cost double, IX.brrr is cheap', () => {
  const { ev } = load();
  start(ev);
  assert.equal(ev("isSub('pan','bog')"), true, 'Panama to Bogotá is subsea');
  assert.equal(ev("isSub('mia','sao')"), true);
  assert.equal(ev("isSub('bue','sao')"), false);
  assert.equal(ev("landMult('scl','bue')"), 2);
  assert.equal(ev("landMult('bue','sao')"), 1);
  assert.match(ev("landWhy('scl','bue')"), /Andes/);
  assert.equal(ev("regionMult('sao')"), 1.6);
  ev("ACT.buildPop({city:'sao'})");
  assert.ok(ev("ixPortMo('sao',1)") < ev("PORT[1].ix*0.5"), 'nonprofit IX ports are cheap');
  ev("selectCity('sao');ACT.tab({t:'peer'})");
  assert.match(ev("document.getElementById('panelBody').textContent"), /Run by a nonprofit/);
});

test('Brazilian POPs attract provedores', () => {
  const { ev } = load();
  start(ev);
  ev("ACT.buildPop({city:'rio'})");
  const seen = JSON.parse(ev("(()=>{const o=[];for(let i=0;i<300;i++){S.offers=[];spawnOffer();o.push(...S.offers.filter(x=>x.type==='provedor').map(x=>x.city));}return JSON.stringify(o)})()"));
  assert.ok(seen.length > 0, 'provedor offers appear');
  assert.ok(seen.every(c => c === 'rio'), 'only in Brazilian POPs');
});

test('UAE: duopoly fiber only, no dark fiber, free-zone license', () => {
  const { ev, errors } = load();
  start(ev);
  assert.equal(ev("dfAllowed('dxb','auh')"), false);
  assert.equal(ev("dfAllowed('dxb','bom')"), true);
  assert.equal(ev("landMult('dxb','fuj')"), 3);
  assert.equal(ev("popCost('auh')-popCost('fra')"), ev('UAE_LIC'));
  ev("ACT.buildPop({city:'dxb'});UI.lmode='df';openLinkModal('dxb','auh')");
  assert.match(ev("document.getElementById('modalCard').textContent"), /No dark fiber inside the UAE/);
  ev("UI.lmode='wave';openLinkModal('dxb','auh')");
  assert.match(ev("document.getElementById('modalCard').textContent"), /licensed operators/);
  ev("closeModal()");
  assert.deepEqual(errors, []);
});

test('regional incidents: Taiwan anchors, Andes landslides, load shedding', () => {
  const { ev, errors } = load();
  start(ev);
  ev("for(const c of ['tpe','scl','bue','cpt'])ACT.buildPop({city:c})");
  ev("UI.via=null;openLinkModal('tpe','hkg');ACT.buildLink({tier:1});closeModal()");
  ev("UI.via='land';openLinkModal('scl','bue');ACT.buildLink({tier:1});closeModal()");
  assert.ok(ev("S.links.some(l=>l.a==='tpe'&&l.sub)") && ev("S.links.some(l=>l.a==='scl'&&!l.sub)"), 'links built');
  let anchors = 0, andes = 0, shed = 0;
  for (let i = 0; i < 400; i++) {
    ev("S.inc=[];for(const l of S.links)l.cut=0;for(const c in S.pops){S.pops[c].down=0;S.pops[c].gen=false}fireFailure()");
    const m = ev("S.inc.map(x=>x.msg).join(' ')");
    if (/anchor/.test(m) && /Taipei/.test(m)) anchors++;
    if (/Andes|mountain pass|llama|4,000/.test(m)) andes++;
    if (/Load shedding/.test(m)) shed++;
  }
  assert.ok(anchors > 0, 'anchors drag over Taiwan cables');
  assert.ok(andes > 0, 'the Andes break fiber');
  assert.ok(shed > 0, 'South Africa sheds load');
  assert.deepEqual(errors, []);
});

test('every new city panel renders', () => {
  const { ev, errors } = load();
  start(ev);
  for (const c of ['for', 'pan', 'del', 'tpe', 'auh', 'fuj', 'cpt', 'bog']) {
    ev(`selectCity('${c}');for(const t of ['cust','up','peer','links','infra'])ACT.tab({t})`);
  }
  assert.deepEqual(errors, []);
});

test('Asia-Pacific and Eastern Europe POPs exist with sellers', () => {
  const { ev } = load();
  start(ev);
  for (const c of ['mel', 'bne', 'drw', 'osa', 'kul', 'bkk', 'sgn', 'khi', 'dac', 'cbo', 'waw', 'prg', 'vie', 'bud', 'buh', 'tll', 'ist'])
    assert.ok(ev(`!!CITY['${c}']&&NETS.some(n=>n.price&&n.pops.includes('${c}'))`), c);
  assert.ok(ev("CABLE_PAIRS.some(p=>p.cid==='balt')&&CABLE_PAIRS.some(p=>p.cid==='darwin')&&CABLE_PAIRS.some(p=>p.cid==='smw4')"));
});

test('metro diversity: a second site keeps half the POP up and uplinks follow their site', () => {
  const { ev, errors } = load();
  start(ev);
  ev("ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'cog',tier:1});ACT.buyTransit({city:'fra',net:'lvl',tier:1});compute()");
  const cap0 = ev("nodeCap('fra')");
  ev("ACT.addSite({city:'fra'})");
  assert.ok(ev("S.pops.fra.site2"));
  ev("ACT.siteSet({k:'t',id:S.transit[1].id,s:'b'})");
  assert.equal(ev("S.transit[1].site"), 'b');
  // a power cut in site A: the POP stays up at half capacity, only site-B transit works
  ev("S.pops.fra.sdown={until:S.day+3,s:'a'};compute()");
  assert.equal(ev("popUp('fra')"), true);
  assert.equal(ev("nodeCap('fra')"), cap0 / 2);
  assert.equal(ev("R.useT[S.transit[0].id]||0"), 0, 'site A transit is dark');
  assert.ok(ev("R.useT[S.transit[1].id]") > 0, 'site B transit carries traffic');
  // the incident path also uses the second site
  ev("S.pops.fra.sdown=null;S.pops.fra.gen=false;for(let i=0;i<500&&!S.inc.some(x=>x.type==='site'||x.type==='ring');i++){fireFailure();S.inc=S.inc.filter(x=>x.type==='site'||x.type==='ring');for(const c in S.pops)S.pops[c].down=0;}");
  assert.ok(ev("S.inc.some(x=>x.type==='site'||x.type==='ring')"), 'site outages and ring cuts happen');
  ev("selectCity('fra');ACT.tab({t:'infra'})");
  assert.match(ev("document.getElementById('panelBody').textContent"), /Metro diversity/);
  ev("selectCity('fra');ACT.tab({t:'up'})");
  assert.match(ev("document.getElementById('panelBody').textContent"), /Site:/);
  assert.deepEqual(errors, []);
});

test('the giants ask for AI WANs, multi-site training, ingests and hundreds of fiber pairs', () => {
  const { ev, errors } = load();
  start(ev);
  ev("for(const c of ['ash','dal','chi','nyc'])ACT.buildPop({city:c})");
  ev("UI.pending={a:'chi',b:'ash'};UI.lmode='df';UI.dfSrc='build';UI.dfSys='roadm';ACT.orderDf();UI.lmode='wave';S.links.filter(l=>l.kind==='df').forEach(l=>l.ready=S.day)");
  const seen = {};
  for (let i = 0; i < 600; i++) { ev('S.offers=[];spawnOffer()'); for (const o of JSON.parse(ev("JSON.stringify(S.offers.filter(o=>o.mega).map(o=>({t:o.type,c:bCities(o),r:o.rate,bw:o.bw})))"))) seen[o.t] = o; }
  for (const t of ['aiwan', 'mtrain', 'ingest', 'pairs']) assert.ok(seen[t], `${t} offers appear`);
  assert.ok(seen.mtrain.c.length >= 3, 'training runs span several sites');
  assert.ok(seen.aiwan.bw >= 3200);
  // accept one and make sure it earns
  ev("for(let i=0;i<400&&!S.offers.some(o=>o.type==='pairs');i++){S.offers=[];spawnOffer();}const o=S.offers.find(o=>o.type==='pairs');ACT.accept({id:o.id});compute()");
  assert.ok(ev("S.biz.some(b=>b.type==='pairs')"));
  assert.ok(ev("R.revMo") > 0);
  ev("selectCity('dal')");
  assert.match(ev("document.getElementById('panelBody').textContent+''"), /./);
  ev("ACT.leftTab({t:'deals'})");
  assert.deepEqual(errors, []);
});
