/* DE-KICKS Group: runs several big exchanges and really, really hates open pricing.
   No price list, personalised quotes, haggling, yearly "harmonisation", auto-enrolled add-ons
   you have to opt out of, and a retention offer when you try to leave. */
const DK_CITIES=['fra','mad','mrs','dxb','bom','nyc'];
const isDk=c=>(DK_CITIES.includes(c)||scnRule('dkAll'))&&!!CITY[c]&&!!CITY[c].ix&&!S.myIx[c];
const DK_ADDONS=[['Blackholing Plus™',tr('Like blackholing, but with a Plus.')],['Route Server Gold',tr('The same route server, in a gold-coloured portal.')],['Premium Port LEDs',tr('Your port light now blinks in brand colours.')],['Strategic Peering Insights',tr('A monthly PDF of your own traffic graphs.')],['GlobePeer Ready™',tr('Makes your port "ready" for a product you did not buy.')],['Cloud Exchange Readiness Fee',tr('A fee for being ready for the cloud.')],['Account Manager Lunch Fund',tr('Your account manager is hungry.')]];
const DK_STALL=[tr('Your account manager would love to "align on value" first. Strategic call booked for next week.'),tr('Pricing is reviewed by the Global Commercial Council, who meet on the next full moon.'),tr('They sent a 14-page NDA before they can even repeat the price. Lawyers estimate a week.'),tr('Your account manager is at a conference in Dubai. And then one in Madrid.')];
function dkMult(c){if(!S||!isDk(c)||!S.dk||!S.dk.m[c])return 1;const ret=S.dk.ret[c];return S.dk.m[c]*(ret&&ret>S.day?0.6:1);}
function dkAddonMo(c){return S.dk&&S.dk.add[c]?S.dk.add[c].reduce((a,x)=>a+x.mo,0):0;}
function dkState(){S.dk=S.dk||{m:{},add:{},ret:{},retUsed:{},stall:0,q:null};return S.dk;}
function dkQuoteMult(){const pops=Object.keys(S.pops).length,big=Math.min(1.2,pops*0.04+(R.served||0)/20000);return +(0.95+Math.random()*0.45+big).toFixed(2);}
function dkQuoteModal(){const q=S.dk.q,c=q.city,mo=Math.round(PORT[q.tier].ix*(S.pops[c]?1:REMOTE_FEE)*q.m*ixMul(c));
  openModal(`<div class="eyebrow">${tr('DE-KICKS Group · Sales')}</div><h2 style="font-size:26px">${tr('Your personalised {port} quote for {ix}',{port:PORT[q.tier].n,ix:esc(ixName(c))})}</h2>
  <p class="tagline">${tr("“Thanks for your interest! We don't publish prices, because every customer is unique.”")}</p>
  <div class="kv"><span>${tr('Monthly price, just for you')}</span><b>${tr('{price}/mo',{price:fmt$(mo)})}</b></div>
  <div class="kv"><span>${tr('List price')}</span><b>${tr('Confidential')}</b></div>
  <div class="kv"><span>${tr('What others pay')}</span><b>${tr('Covered by NDA')}</b></div>
  <p class="note">${tr('Quotes go up with how big you look.')} ${q.h>=3?tr('Your account manager has stopped replying to haggling.'):tr('Haggles left: {n}.',{n:3-q.h})}</p>
  <div class="btns">${btn(tr('Sign <small>{price}/mo</small>',{price:fmt$(mo)}),'dkAccept',{},'pink',S.cash<mo)}${btn(tr('Haggle'),'dkHaggle',{},'',q.h>=3)}${btn(tr('Walk away'),'dkWalk',{},'ghost')}</div>`);}
function dkTick(d){if(!S.dk)return;const dk=S.dk;
  for(const c in S.ixp){if(!isDk(c))continue;
    if(dk.ret[c]&&dk.ret[c]===d){dk.m[c]=+(dk.m[c]*1.1).toFixed(3);toast(tr('<b>Your {ix} promo ended.</b><br>Price is back, plus 10% for "loyalty programme administration".',{ix:esc(ixName(c))}),'bad');}
    if(dk.m[c]&&(d+hstr(c)%90)%365===0){const f=1.08+Math.random()*0.07;dk.m[c]=+(dk.m[c]*f).toFixed(3);toast(tr('<b>DE-KICKS has harmonised its prices.</b><br>Harmonised means up: {ix} now costs {p}% more. Thank you for your continued partnership.',{ix:esc(ixName(c)),p:Math.round((f-1)*100)}),'bad');}
    const add=dk.add[c]=dk.add[c]||[];
    if(add.length<3&&Math.random()<1/150){const a=DK_ADDONS.filter(x=>!add.some(y=>y.n===x[0]));if(a.length){const [n,blurb]=pick(a),mo=Math.round((300+Math.random()*1200)/50)*50;add.push({n,blurb,mo,day:d});
      toast(tr("<b>Good news! You've been enrolled in {addon}.</b><br>{blurb} {price}/mo, added to your {ix} invoice. Opt out any time in the IX panel.",{addon:esc(n),blurb:esc(blurb),price:fmt$(mo),ix:esc(ixName(c))}),'bad');}}}
}

function elephant(){S.phpDone=true;S.ev.php=S.day+4;
  toast(tr(`<b>🐘 BREAKING: CVE-2026-31337 just took down half the internet.</b><br>A bug in PHP turned every WordPress-ish site on Earth into a crypto miner. Eyeball traffic is down 30% for a few days while the world patches. Your hosting customers are doing it at 3 a.m.`),'bad');sfx('alert');renderMega();}
