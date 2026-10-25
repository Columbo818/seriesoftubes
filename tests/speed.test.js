const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

// A network on four continents: POPs, waves, transit, IX ports, PNIs, caches and customers.
function bigNet(ev) {
  ev("ACT.start({});S.cash=1e10;S.lvl=6;for(const g of GOALS)S.done[g.id]=0;ACT.launchBB({city:'fra'})");
  ev("for(const c of ['ams','lon','par','nyc','ash','chi','sjc','tok','hkg','sin','syd','sao'])ACT.buildPop({city:c})");
  ev("for(const [a,b] of [['fra','ams'],['ams','lon'],['lon','par'],['par','fra'],['lon','nyc'],['nyc','ash'],['ash','chi'],['chi','sjc'],['sjc','syd'],['tok','hkg'],['hkg','sin'],['sin','syd'],['nyc','sao']]){UI.via=null;openLinkModal(a,b);ACT.buildLink({tier:1});closeModal();}");
  ev("for(const c in S.pops){S.pops[c].bb=S.pops[c].bb||{d:0};S.pops[c].bb.d=500;}");
  ev("for(const [c,n] of [['fra','cog'],['nyc','lvl'],['sin','cog'],['tok','lvl']])ACT.buyTransit({city:c,net:n,tier:1})");
  ev("for(const c of ['fra','ams','lon','nyc','sin','tok'])ACT.buyIx({city:c,tier:1,signed:true});for(const c in S.ixp)ACT.rs({city:c});compute()");
  ev("for(const n of ['ggl','nfx','fbk','amz','akm'])for(const c of ['fra','nyc','sin'])ACT.pni({city:c,net:n,tier:1});compute()");
  ev("for(const n of ['nfx','ggl'])for(const c of ['fra','nyc','sin','lon'])ACT.cache({city:c,net:n})");
  ev("for(let i=0;i<150;i++){S.offers=[];spawnOffer();for(const o of S.offers.slice())if(bHas(o))ACT.accept({id:o.id});}closeModal();compute()");
}

test('a preferred exit far away still wins over a normal one next door', () => {
  const { ev, errors } = load();
  ev("ACT.start({});S.cash=1e8;for(const g of GOALS)S.done[g.id]=0;ACT.launchBB({city:'fra'});ACT.buildPop({city:'ams'})");
  ev("UI.via=null;openLinkModal('fra','ams');ACT.buildLink({tier:1});closeModal();ACT.buyTransit({city:'fra',net:'cog',tier:1});ACT.buyTransit({city:'ams',net:'tly',tier:1});compute()");
  assert.equal(ev('S.links.length'), 1);
  const use = () => JSON.parse(ev("JSON.stringify(S.transit.map(t=>R.useT[t.id]||0))"));
  assert.equal(use()[1], 0, 'normal: the local transit carries it all');
  ev("S.transit[1].pref='high';compute()");
  const [fra, ams] = use();
  assert.ok(ams > 0 && ams > fra, `preferred: Amsterdam's transit comes first (${fra} / ${ams})`);
  assert.deepEqual(errors, []);
});

test('what crosses each link adds up, and is put together when it is looked at', () => {
  const { ev, errors } = load();
  bigNet(ev);
  assert.ok(ev("Object.keys(R.ef).length") > 5, 'traffic on many links');
  // every push adds the same amount to one egress, one network and one source city
  const bad = ev(`Object.keys(R.ef).filter(k=>{const r=R.ef[k],s=o=>Object.values(o).reduce((a,b)=>a+b,0),n=s(r.net);
    const load=S.links.filter(l=>edgeKey(l)===k).reduce((a,l)=>a+(R.load[l.id]||0),0);
    return Math.abs(n-s(r.eg))>1e-6*(1+n)||Math.abs(n-s(r.dst))>1e-6*(1+n)||Math.abs(n-load)>1e-6*(1+n);}).join()`);
  assert.equal(bad, '', 'per network, per egress, per source city and the link load agree');
  assert.equal(ev("const k=Object.keys(R.ef)[0];R.ef[k]===R.ef[k]"), true, 'the same record every time');
  assert.equal(ev("JSON.parse(JSON.stringify(R)).ef[Object.keys(R.ef)[0]].net!==undefined"), true);
  // the link panel reads it
  ev("const k=Object.keys(R.ef)[0],l=S.links.find(x=>edgeKey(x)===k);selectLink(l.id)");
  assert.match(ev("document.getElementById('panelBody').textContent"), /Content from/);
  assert.deepEqual(errors, []);
});

test('a big network routes every flow to an exit with room, and caches serve their own city', () => {
  const { ev, errors } = load();
  bigNet(ev);
  for (let d = 0; d < 20; d++) ev('dayTick()');
  assert.ok(ev('R.served>0&&R.served<=R.demand+1e-6'));
  assert.equal(ev(`[...S.transit.map(t=>[R.useT[t.id]||0,lagCap(PORT[t.tier].g,t.n)]),...S.pni.map(p=>[R.usePni[p.id]||0,lagCap(PORT[p.tier].g,p.n)]),...S.caches.map(c=>[R.useCache[c.id]||0,CACHE_CAP])].filter(([u,c])=>u>c+1e-6).length`), 0, 'no port over capacity');
  assert.equal(ev("Object.keys(S.pops).filter(c=>R.citySrv[c]>R.cityDem[c]+1e-6).length"), 0, 'no city served more than it asked for');
  assert.ok(ev('S.caches.length>0&&S.caches.every(c=>R.useCache[c.id]>0)'), 'every cache serves its own city');
  assert.deepEqual(errors, []);
});

test('panels are patched in place: the same HTML, and buttons that now do something else are new', () => {
  const { ev, errors } = load();
  bigNet(ev);
  ev("selectCity('fra');ACT.tab({t:'peer'})");
  const fresh = "(()=>{const d=document.createElement('div');d.innerHTML=UI._ph;return d.innerHTML;})()";
  const same = () => ev(`(()=>{const a=[...document.getElementById('panelBody').querySelectorAll('*')],d=document.createElement('div');d.innerHTML=UI._ph;const b=[...d.querySelectorAll('*')];
    return a.length===b.length&&a.every((x,i)=>x.nodeName===b[i].nodeName&&x.attributes.length===b[i].attributes.length&&[...b[i].attributes].every(t=>x.getAttribute(t.name)===t.value)&&(x.children.length||x.textContent===b[i].textContent));})()`);
  assert.equal(same(), true);
  ev("window.__tab=document.querySelector('#panelBody [data-act=\"tab\"]')");
  for (let d = 0; d < 3; d++) ev('dayTick();renderPanel()');
  assert.equal(same(), true, 'patched panel matches a fresh render');
  assert.equal(ev("window.__tab===document.querySelector('#panelBody [data-act=\"tab\"]')"), true, 'an unchanged button stays the same button');
  // another city: its buttons act on that city, so a tap that started on the old ones cannot fire them (#44)
  ev("window.__btn=[...document.querySelectorAll('#panelBody [data-act]')].find(b=>(b.dataset.args||'').includes('\"fra\"'))");
  ev("selectCity('nyc');ACT.tab({t:'peer'})");
  assert.equal(same(), true);
  assert.equal(ev("document.getElementById('panelBody').contains(window.__btn)"), false);
  assert.ok(ev(fresh).length > 1000);
  assert.deepEqual(errors, []);
});

test('the network list shows where you connect to each network', () => {
  const { ev, errors } = load();
  bigNet(ev);
  // one index for the whole list says the same as asking network by network
  assert.equal(ev("const w=netWhereIdx();NETS.filter(n=>netWhere(n,w)!==netWhere(n)).length"), 0);
  assert.ok(ev("netWhere(NET.ggl).includes('goConn')"));
  ev("UI.leftOpen=true;ACT.leftTab({t:'nets'})");
  assert.match(ev("document.getElementById('leftBody').textContent"), /Goggle/);
  assert.deepEqual(errors, []);
});

test('the map draws a big network at every zoom, with a city or a link selected', () => {
  const { ev, errors } = load();
  bigNet(ev);
  ev("localStorage.setItem('sot-anim','on');UI.anim='on'");
  for (const sel of ['null', "{type:'city',id:'fra'}", "{type:'link',id:S.links[2].id}"]) {
    for (const z of [0.35, 0.6, 1.2, 2.5, 6]) ev(`UI.sel=${sel};cam.z=${z};draw(1000);draw(1016)`);
  }
  assert.ok(ev('ctx.calls.n') > 1000);
  assert.ok(ev("hitLink(...toS(CITY.fra.x,CITY.fra.y,0))!==undefined"));
  assert.deepEqual(errors, []);
});

test('long lists in the NOC dashboard show 100 rows at a time and grow on request', () => {
  const { ev, errors } = load();
  bigNet(ev);
  // well over a hundred PNIs and customers
  ev("const cs=Object.keys(S.pops);let i=0;for(const n of NETS)for(const c of cs.slice(0,2))S.pni.push({id:'tp'+(i++),city:c,net:n.id,tier:0,n:1,site:'a',sacrif:false});");
  ev("for(let j=0;j<150;j++)S.biz.push({id:'tb'+j,city:'fra',city2:null,name:'Test '+j,type:'dia',bw:1,rate:100,mood:50+j%40,since:0,reqs:[],pm:50});compute()");
  const total = ev('conns().length');
  assert.ok(total > 200);
  ev("UI.dtab='conn';ACT.connOpen()");
  const rows = () => ev("document.querySelectorAll('#dashCard tbody tr').length");
  assert.equal(rows(), 100);
  assert.match(ev("document.querySelector('#dashCard [data-act=\"listMore\"]').textContent"), /\+100 more connections/);
  assert.match(ev("document.getElementById('dashCard').textContent"), new RegExp(`${total} connections`), 'totals still count every connection');
  ev("document.querySelector('#dashCard [data-act=\"listMore\"]').click()");
  assert.equal(rows(), 200);
  ev("ACT.connSort({k:'mo'})");
  assert.equal(rows(), 100, 'a new sort starts short again');
  // customers
  ev("ACT.custOpen()");
  const custRows = () => ev("document.querySelectorAll('#custSec .row').length");
  assert.equal(custRows(), 100);
  const left = ev('S.biz.length') - 100;
  assert.ok(ev("document.querySelector('#custSec [data-act=\"listMore\"]').textContent").startsWith(`+${Math.min(100, left)} more customer`));
  ev("ACT.listMore({k:'cust'});ACT.listMore({k:'cust'});ACT.listMore({k:'nope'})");
  assert.equal(custRows(), Math.min(300, ev('S.biz.length')));
  // phones get the same cap
  ev("window.innerWidth=390;UI.dtab='conn';ACT.connOpen()");
  assert.equal(ev("document.querySelectorAll('#connSec .row').length"), 100);
  assert.deepEqual(errors, []);
});
