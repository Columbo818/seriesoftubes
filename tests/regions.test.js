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
