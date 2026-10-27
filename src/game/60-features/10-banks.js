/* ================= BANKS & LOANS =================
   Lenders make offers now and then (more often when you are broke). Each loan
   is a fixed monthly payment that shows up in your costs; conditions are checked
   daily and breaking one costs a penalty. */
const BANKS={
 gs:{name:'Goldman Sacks',col:'#6F8FAF',min:'AA',apr:[.07,.11],amt:[4,9],term:[24,48],covs:['peer30','continents2','golf','yacht'],blurb:tr('Only lends to people who do not need it.')},
 db:{name:'Deutsche Bankrupt',col:'#0018A8',min:'A',apr:[.08,.13],amt:[3,7],term:[18,36],covs:['nocog','gen','fax'],blurb:tr('Very solid. Mostly.')},
 jpm:{name:'JP Morgain',col:'#5B4636',min:'A',apr:[.09,.14],amt:[3,6],term:[12,36],covs:['uptime','logo','nephew'],blurb:tr('Lends you money and also a little bit of their own.')},
 cs:{name:'Credit Sweaty',col:'#7A9CC6',min:'BBB',apr:[.11,.17],amt:[2,5],term:[12,30],covs:['cash50','nochina'],blurb:tr('Nervous, but enthusiastic.')},
 wf:{name:'Wells Far-Gone',col:'#D71E28',min:'BB',apr:[.12,.18],amt:[2,4],term:[12,24],covs:['nosub','logo','reach99'],blurb:tr('Opened three accounts for you while you read this.')},
 spk:{name:'Spätzle-Sparkasse',col:'#E30613',min:'B',apr:[.05,.08],amt:[1,3],term:[24,60],covs:['spaetzle','kehrwoche'],blurb:tr('Cheap, patient, and very particular about Stuttgart.')},
 rev:{name:'Revoloot',col:'#191C1F',min:'B',apr:[.13,.2],amt:[1,3],term:[6,18],covs:['app'],blurb:tr('Instant approval. Instant regret.')},
 gov:{name:'Ministry of Tubes',col:'#2E7D32',min:'CCC',apr:[.01,.02],amt:[1,2],term:[36,60],covs:['rural','forms'],blurb:tr('Cheap state money for connecting the underserved. Bring a pen.')},
 crypto:{name:'Crypto Bros Capital',col:'#F7931A',min:'CCC',apr:[.15,.25],amt:[2,6],term:[6,18],covs:['hodl','tier3'],crypto:true,blurb:tr('Pays out in TubeCoin. Value may vary. A lot.')},
 vult:{name:'Venture Vultures',col:'#8E44AD',min:'CCC',amt:[6,12],share:[.1,.15],covs:['blitz'],equity:true,blurb:tr('No repayments, ever. Just a slice of your revenue, forever, and a lot of opinions.')},
 balloon:{name:'Ballooney Brothers',col:'#E91E63',min:'B',apr:[.1,.15],amt:[2,6],term:[12,24],covs:['oddpops'],model:'balloon',blurb:tr('No payments at all! Until the very end. Then all of them, at once.')},
 storm:{name:'Stormy Weather Lending',col:'#546E7A',min:'BB',apr:[.04,.06],amt:[2,5],term:[12,36],covs:['nogen'],model:'storm',blurb:tr('Cheap while the sun shines. Every open incident adds 2% to your rate.')},
 ppp:{name:'Peer Pressure Partners',col:'#00897B',min:'B',amt:[2,5],term:[24,36],covs:['nocache'],model:'transit',blurb:tr('You repay with 30% of your transit bill. Go transit-free and you stop paying. Until the end.')},
 astro:{name:'Horoscope Holdings',col:'#5E35B1',min:'CCC',apr:[.02,.3],amt:[1,4],term:[12,24],covs:['friday','nobude'],model:'astro',blurb:tr('Your rate is set by the stars every month. Mercury is in retrograde a lot.')},
 pizza:{name:'Papa Pizza Capital',col:'#FF7043',min:'BB',apr:[.03,.05],amt:[1,3],term:[12,24],covs:['pizza'],blurb:tr('The cheapest money in town. There is a catch, and it has extra cheese.')},
 shark:{name:'Loan Shark Telecom Finance',col:'#37474F',min:'C',apr:[.6,.9],amt:[1,2],term:[4,8],covs:[],shark:true,blurb:tr('Always open. Ask no questions. Do not be late.')},
};
const RATINGS=['C','CCC','B','BB','BBB','A','AA','AAA'];
const COVS={
 peer30:{l:tr('Keep your peering ratio above 30%. The bank read a blog post about peering.'),ok:()=>(R.peerShare||0)>=0.3},
 continents2:{l:tr('Keep POPs on at least 2 continents. Diversification!'),ok:()=>regionsCount()>=2},
 golf:{l:tr('Your CEO plays golf with our CEO every Thursday.'),ok:()=>true},
 nocog:{l:tr('No Cogentle transit anywhere. Our CEO got de-peered once and has not recovered.'),ok:()=>!S.transit.some(t=>t.net==='cog')},
 gen:{l:tr('Every POP needs a backup generator. Our risk team saw one disaster movie.'),ok:()=>Object.values(S.pops).every(p=>p.gen)},
 fax:{l:tr('Send us your monthly report by fax.'),ok:()=>true},
 uptime:{l:tr('Deliver at least 95% of what your customers want.'),ok:()=>!R.demand||R.served/R.demand>=0.95},
 logo:{l:tr('Our logo goes on every router you own.'),ok:()=>true},
 cash50:{l:tr('Never let cash drop below $50k. It makes us sweat.'),ok:()=>S.cash>=50000},
 nochina:{l:tr('Stay out of mainland China. Compliance said so.'),ok:()=>!Object.keys(S.pops).some(cnCity)},
 nosub:{l:tr('No new subsea links while this loan runs. We are afraid of sharks.'),ok:l=>S.links.filter(x=>x.sub).length<=(l.base&&l.base.sub||0)},
 spaetzle:{l:tr('Peer at the Spätzle-IX in Stuttgart. Local money for local packets.'),ok:()=>S.ixp.stg!==undefined},
 kehrwoche:{l:tr('Do the Kehrwoche: keep your NOC free of incidents older than a week.'),ok:()=>!S.inc.some(i=>S.day-i.start>7)},
 app:{l:tr('Download our app and enable all notifications.'),ok:()=>true},
 rural:{l:tr('Run home broadband somewhere underserved (Asia, Africa, Oceania or South America).'),ok:()=>Object.keys(S.pops).some(c=>S.pops[c].bb&&['AS','AF','OC','SA'].includes(CITY[c].reg))},
 forms:{l:tr('Fill in form T-17b in triplicate, every month, forever.'),ok:()=>true},
 hodl:{l:tr('Never sell your TubeCoin. Diamond hands.'),ok:()=>true},
 oddpops:{l:tr('Always run an odd number of POPs. Our numerologist insists.'),ok:()=>Object.keys(S.pops).length%2===1},
 nobude:{l:tr('Never build in Bude. The loan officer had a bad surfing holiday there.'),ok:()=>!S.pops.bde},
 nogen:{l:tr('No diesel generators anywhere. Our sustainability team is watching.'),ok:()=>!Object.values(S.pops).some(p=>p.gen)},
 friday:{l:tr('No new links on a Friday. The stars do not allow it.'),ok:l=>!S.links.some(x=>(x.day||0)>=l.start&&(x.day||0)%7===4)},
 nocache:{l:tr('No Goggle cache boxes. Our chairman lost an argument with a search engine.'),ok:()=>!S.caches.some(c=>c.net==='ggl')},
 reach99:{l:tr('Reach 99% of the internet at all times. We looked up what a network is for.'),ok:()=>(R.reach||0)>=0.99},
 tier3:{l:tr('Stay Tier 3. Number go up, rank stay down.'),ok:()=>tierLabel()==='Tier 3'},
 nephew:{l:tr('Give our CEO’s nephew a job. He needs {price}/mo and a parking spot.'),fee:3000,ok:()=>true},
 yacht:{l:tr('Our chairman needs a yacht for the summer. You don’t own one, so you rent one: {price}/mo.'),fee:8000,ok:()=>true},
 pizza:{l:tr('Pizza for the whole NOC after every incident: {price} each.'),each:400,ok:()=>true},
 blitz:{l:tr('Open a new POP at least every 90 days. Blitzscale or die.'),ok:l=>S.day-Math.max(l.start,...Object.values(S.pops).map(p=>p.day||0))<=90},
};
// Conditions read with their price filled in; some cost money every month, one costs money per incident.
const covLabel=c=>COVS[c]?COVS[c].l.replace('{price}',fmt$(COVS[c].fee||COVS[c].each||0)):c;
const loanFees=l=>(l.covs||[]).reduce((a,c)=>a+((COVS[c]&&COVS[c].fee)||0),0);
// Good terms are for good credit: every notch below AAA adds to the rate.
const RATE_PREM={AAA:0,AA:.005,A:.01,BBB:.02,BB:.04,B:.07,CCC:.12,C:.2};
// A loan worth more than this many months of revenue also wants a slice of revenue until it is repaid.
const BIG_LOAN=5;
const STAR_SIGNS=[N_('Mercury'),N_('Saturn'),N_('Venus'),N_('Your rising sign'),N_('The moon'),N_('Pluto, which is not even a planet')];
function niceAmt(v){const m=Math.pow(10,Math.floor(Math.log10(Math.max(1,v)))-1);return Math.max(50000,Math.round(v/m)*m);}
function rating(){if(!S)return 'BB';const rev=R.revMo||0,pay=(R.cost&&R.cost.loans)||0;let sc=2;
  if(rev>100000)sc++;if(rev>500000)sc++;if(rev>2000000)sc++;if(R.revMo>R.costMo)sc++;else sc--;if(rev&&(R.revMo-R.costMo)/rev>=0.25)sc++;
  if(S.cash<0)sc-=2;if(rev&&pay/rev>0.3)sc--;if(rev&&pay/rev>0.6)sc--;sc-=Math.min(3,S.loanStrikes||0);
  return RATINGS[clamp(sc,0,RATINGS.length-1)];}
const rIdx=r=>RATINGS.indexOf(r);
function annuity(P,apr,n){const r=apr/12;return r?P*r/(1-Math.pow(1+r,-n)):P/n;}
function spawnLoanOffer(emergency){
  const rt=rating(),keys=Object.keys(BANKS).filter(k=>rIdx(rt)>=rIdx(BANKS[k].min)&&!S.loanOffers.some(o=>o.bank===k)&&!(BANKS[k].equity&&S.loans.some(l=>l.bank===k)));
  let pool=emergency?keys.filter(k=>['shark','gov','crypto','vult','rev','spk','astro','balloon'].includes(k)):keys.filter(k=>k!=='shark');if(!pool.length)pool=keys;if(!pool.length)return;
  const k=pick(pool),B=BANKS[k],base=Math.max(60000,R.revMo||0),ra=(a)=>a[0]+Math.random()*(a[1]-a[0]);
  const amount=niceAmt(base*ra(B.amt)*(emergency?0.6:1)),o={id:uid(),bank:k,amount,exp:S.day+(emergency?10:25),covs:B.covs.slice()};
  if(B.equity){o.share=+ra(B.share).toFixed(3);}
  else if(B.model==='transit'){o.model='transit';o.cut=0.3;o.term=Math.round(ra(B.term)/6)*6||6;o.owe=Math.round(amount*1.3);o.apr=0;o.pay=0;}
  else{o.apr=+(ra(B.apr)+(RATE_PREM[rt]||0)).toFixed(3);o.term=Math.round(ra(B.term)/6)*6||6;o.pay=B.model==='balloon'?0:Math.round(annuity(amount,o.apr,o.term));if(B.model)o.model=B.model;}
  if(!B.equity&&amount>BIG_LOAN*base)o.share=+Math.min(0.08,0.02+0.01*(amount/base-BIG_LOAN)).toFixed(3);
  S.loanOffers.push(o);
  toast(tr('<b>{bank} would like to lend you {amount}.</b>',{bank:esc(B.name),amount:fmt$(amount)})+'<br>'+(emergency?tr('They heard you might be in a spot of bother.'):tr('Terms apply. Several terms.')),emergency?'bad':'goal',[{l:tr('Open bank'),act:'bank',args:{}}]);
}
function loanTick(d){
  // conditions: 15-day grace, then a penalty every 30 days while broken
  for(const l of S.loans){const B=BANKS[l.bank];
    const broken=l.covs.filter(c=>COVS[c]&&!COVS[c].ok(l));
    if(d-l.start<15||!broken.length){l.breach=0;continue;}
    l.breach=(l.breach||0)+1;
    if(l.breach===1)toast(tr('<b>{bank} is unhappy.</b><br>You broke a loan condition: {cond} Fix it within 10 days or pay a penalty.',{bank:esc(B.name),cond:esc(covLabel(broken[0]))}),'bad',[{l:tr('Open bank'),act:'bank',args:{}}]);
    if(l.breach===10||(l.breach>10&&(l.breach-10)%30===0)){
      if(B.equity){l.share=+(l.share+0.02).toFixed(3);toast(tr('<b>{bank} are circling.</b><br>They now take {pct} of your revenue.',{bank:esc(B.name),pct:pct(l.share)}),'bad');}
      else{const fee=Math.round(l.bal*0.05);l.bal+=fee;l.pay=Math.round(annuity(l.bal,l.apr,Math.max(1,l.left)));S.loanStrikes=(S.loanStrikes||0)+1;toast(tr('<b>Penalty from {bank}: {fee}</b><br>Added to what you owe. Your monthly payment is now {pay}.',{bank:esc(B.name),fee:fmt$(fee),pay:fmt$(l.pay)}),'bad');}
      sfx('err');}}
  // monthly statement: payments already leave your cash daily as part of costs
  for(const l of S.loans.slice()){const B0=BANKS[l.bank];if(B0.equity||(d-l.start)%30!==0||d===l.start)continue;
    if(l.model==='transit')l.bal=Math.max(0,l.bal-Math.round(((R.cost&&R.cost.transit)||0)*(l.cut||0.3)));else l.bal=Math.max(0,l.bal*(1+l.apr/12)-l.pay);l.left--;
    // A balloon, or what a transit-free network never paid, is due in one go at the end.
    if(l.left<=0&&l.bal>=1&&(l.model==='balloon'||l.model==='transit')){S.cash-=Math.round(l.bal);toast(tr('<b>{bank}: the balloon popped.</b><br>The remaining {price} was due today, all at once. It has left your account.',{bank:esc(B0.name),price:fmt$(l.bal)}),'bad');sfx('err');l.bal=0;}
    if(l.left>0&&l.bal>=1){if(l.model==='storm'){l.apr=+((l.apr0||0)+0.02*S.inc.length).toFixed(3);l.pay=Math.round(annuity(l.bal,l.apr,l.left));}
      else if(l.model==='astro'){const a=+(0.02+Math.random()*0.28).toFixed(3);if(Math.abs(a-l.apr)>=0.08)toast(tr('<b>{bank}: {sign} is in retrograde.</b><br>Your rate is now {apr}%.',{bank:esc(B0.name),sign:tr(pick(STAR_SIGNS)),apr:(a*100).toFixed(1)}),a>l.apr?'bad':'good');l.apr=a;l.pay=Math.round(annuity(l.bal,l.apr,l.left));}}
    if(l.left<=0||l.bal<1){S.loans=S.loans.filter(x=>x!==l);track('loan_repaid');toast(tr('<b>Loan from {bank} paid off!</b><br>They sent a fruit basket. It is mostly bananas.',{bank:esc(BANKS[l.bank].name)}),'good');sfx('coin');}}
  // the shark's collectors come by when you are broke
  if(S.cash<0&&S.loans.some(l=>BANKS[l.bank].shark)&&Math.random()<0.03){const c=pick(Object.keys(S.pops));const p=S.pops[c];p.down=Math.max(p.down||0,d+1);const en=N_('Two very large gentlemen from Loan Shark Telecom Finance unplugged your router in {city} "as a reminder".');addInc({type:'shutdown',ref:c,until:d+1,msg:tr(en,{city:CITY[c].name}),cost:0},en);toast(tr('<b>The loan shark sent a reminder.</b><br>Your POP in {city} is dark until tomorrow.',{city:CITY[c].name}),'bad');sfx('alert');}
  // offers: now and then, and much more often when you are in trouble
  S.loanOffers=S.loanOffers.filter(o=>o.exp>d);
  const broke=S.cash<0;
  // With half a billion in the vault, loan offers are just noise (#52): banks stop calling, open offers lapse.
  if(S.cash>=RICH_NO_LOANS){if(S.loanOffers.length||!S.richTold){S.loanOffers=[];if(!S.richTold&&S.mode!=='sandbox'){S.richTold=1;toast(tr('<b>The banks have stopped calling.</b><br>You have more money than most of them. Loan offers come back if your cash ever drops below {cash}.',{cash:fmt$(RICH_NO_LOANS)}),'good');}}return;}
  if(S.loanOffers.length<4&&(broke?Math.random()<0.25:(d>20&&Math.random()<1/40)))spawnLoanOffer(broke);
}
const RICH_NO_LOANS=5e8;
