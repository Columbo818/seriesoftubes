/* Badges: achievements with rarities. Earned per game, and also remembered across games on this
   device in a hall of fame, so there is always something grand to work towards. */
const RARITY={c:{n:tr('Common'),col:'#16A866'},r:{n:tr('Rare'),col:'#3A7BEA'},e:{n:tr('Epic'),col:'#9D4EDD'},l:{n:tr('Legendary'),col:'#FF8A3D'}};
const st=()=>S.stats||{};
const BADGES=[
 {id:'hello',i:'👋',t:tr('Hello, Neighbour'),d:tr('Bring up your first peering session.'),r:'c',ok:()=>R.sessions>=1},
 {id:'backhoe',i:'🚜',t:tr('Met the Backhoe'),d:tr('Have a fiber cut.'),r:'c',ok:()=>(st().by||{}).cut>=1},
 {id:'debt',i:'🏦',t:tr('In Debt We Trust'),d:tr('Take out a loan.'),r:'c',ok:()=>(st().loans||0)>=1||(S.loans||[]).length>0},
 {id:'twins',i:'👯',t:tr('Twins'),d:tr('Run two routers in one POP.'),r:'c',ok:()=>Object.values(S.pops).some(p=>(p.routers||1)>=2)},
 {id:'shark',i:'🦈',t:tr('Shark Week'),d:tr('Get a subsea cable bitten by a shark.'),r:'r',ok:()=>(st().sharks||0)>=1},
 {id:'ixc',i:'🔀',t:tr('IX Collector'),d:tr('Have ports on 10 internet exchanges.'),r:'r',ok:()=>Object.keys(S.ixp).length>=10},
 {id:'haggle',i:'🤝',t:tr('Never Paid List Price'),d:tr('Haggle a DE-KICKS quote down.'),r:'r',ok:()=>!!st().haggleWin},
 {id:'unsub',i:'📭',t:tr('Unsubscribed'),d:tr('Opt out of 3 auto-enrolled add-ons.'),r:'r',ok:()=>(st().optouts||0)>=3},
 {id:'read',i:'💔',t:tr('Left on Read'),d:tr('Get de-peered by a big network.'),r:'r',ok:()=>(st().depeered||0)>=1},
 {id:'couch',i:'🛋️',t:tr('Peering From the Couch'),d:tr('Peer at an IX remotely.'),r:'r',ok:()=>Object.keys(S.ixp).some(c=>isRemote(c)&&ixSessions(c).size>0)},
 {id:'sender',i:'🇰🇷',t:tr('Sender Pays'),d:tr('Paid PNIs with all three Korean incumbents.'),r:'e',ok:()=>['ktt','skb','lgu'].every(n=>S.pni.some(p=>p.net===n&&pniOn(p)))},
 {id:'oink',i:'🐖',t:tr('Pig Whisperer'),d:tr('Run a slow-booting PacketOinker chassis.'),r:'r',ok:()=>Object.keys(S.pops).some(c=>/Oinker/.test(RG[S.pops[c].rgen||0].chip)&&slowBoot(c))},
 {id:'gap',i:'🌴',t:tr('Mind the Gap'),d:tr('Link Panama City and Bogotá.'),r:'r',ok:()=>S.links.some(l=>[l.a,l.b].includes('pan')&&[l.a,l.b].includes('bog'))},
 {id:'andes',i:'🏔️',t:tr('Over the Mountains'),d:tr('Build fiber across the Andes.'),r:'r',ok:()=>S.links.some(l=>!l.sub&&andesPair(l.a,l.b))},
 {id:'duo',i:'🏜️',t:tr('Duopoly Customer'),d:tr('Buy a wave inside the UAE.'),r:'r',ok:()=>S.links.some(l=>uaePair(l.a,l.b))},
 {id:'shed',i:'🔌',t:tr('Stage Six'),d:tr('Ride out load shedding on your own generator.'),r:'r',ok:()=>(st().shed||0)>=1},
 {id:'metro3',i:'🏢',t:tr('Two Buildings, Three Cities'),d:tr('Have a second site in 3 metros.'),r:'r',ok:()=>Object.values(S.pops).filter(p=>p.site2).length>=3},
 {id:'penguin',i:'🐧',t:tr('Lonely Penguin'),d:tr('Light a wave on the Humboldt cable to Sydney.'),r:'e',ok:()=>S.links.some(l=>l.cable==='humb')},
 {id:'horn',i:'⛵',t:tr('The Long Way Round'),d:tr('Run a link round Cape Horn.'),r:'e',ok:()=>S.links.some(l=>l.cable==='sam1'&&[l.a,l.b].includes('bue')&&[l.a,l.b].includes('scl'))},
 {id:'six',i:'🌍',t:tr('Six Continents'),d:tr('POPs in every region on the map.'),r:'e',ok:()=>regionsCount()>=6},
 {id:'giants',i:'🏭',t:tr('Friend of Giants'),d:tr('Hold deals at 3 different AI campuses at once.'),r:'e',ok:()=>new Set(S.biz.filter(b=>BIZ_T[b.type]&&BIZ_T[b.type].mega).flatMap(b=>bCities(b))).size>=3},
 {id:'landlord',i:'🧵',t:tr('Trench Landlord'),d:tr('Lease hundreds of fiber pairs to a hyperscaler.'),r:'e',ok:()=>S.biz.some(b=>b.type==='pairs')},
 {id:'t1',i:'👑',t:tr('Tier 1'),d:tr('Go transit-free.'),r:'e',ok:()=>!!S.won},
 {id:'bait',i:'🎣',t:tr('Shark Bait'),d:tr('Get bitten by sharks 3 times in one game.'),r:'l',ok:()=>(st().sharks||0)>=3},
 {id:'nines',i:'💎',t:tr('Five Nines'),d:tr('Serve 99.5% of demand every single day for a whole year.'),r:'l',ok:()=>(st().clean||0)>=365},
 {id:'fifty',i:'🗺️',t:tr('Everywhere at Once'),d:tr('Have POPs in 50 cities.'),r:'l',ok:()=>Object.keys(S.pops).length>=50},
 {id:'unicorn',i:'🦄',t:tr('Unicorn'),d:tr('Hold a billion dollars in cash.'),r:'l',ok:()=>S.cash>=1e9},
 {id:'clean',i:'🧼',t:tr('Debt-Free Tier 1'),d:tr('Win without ever taking a loan.'),r:'l',ok:()=>!!S.won&&!(st().loans||0)&&!(S.loans||[]).length},
 {id:'speed',i:'⚡',t:tr('Speedrun'),d:tr('Reach Tier 1 within three years.'),r:'l',ok:()=>!!S.won&&S.day<=1095},
 {id:'te',i:'🧭',t:tr('Traffic Whisperer'),d:tr('Have Auto-TE move 100 Gbps onto alternate paths at once.'),r:'r',ok:()=>(st().teMax||0)>=100},
 {id:'street',i:'🚧',t:tr('Same Street'),d:tr('Lose a metro ring to one backhoe.'),r:'r',ok:()=>(st().by||{}).ring>=1},
 {id:'anchor',i:'⚓',t:tr('Anchors Aweigh'),d:tr('Have a cable cut by a dragged anchor.'),r:'r',ok:()=>!!(st().f||{}).anchor},
 {id:'retained',i:'🎁',t:tr('Customer Success Story'),d:tr('Take a DE-KICKS retention offer.'),r:'r',ok:()=>!!st().retained},
 {id:'brrr',i:'🇧🇷',t:tr('Samba Peering'),d:tr('Ports on IX.brrr in São Paulo, Rio and Fortaleza.'),r:'e',ok:()=>['sao','rio','for'].every(c=>S.ixp[c]!==undefined)},
 {id:'bingo',i:'🎰',t:tr('DE-KICKS Bingo'),d:tr('Ports at all six DE-KICKS exchanges. They thank you for your continued partnership.'),r:'e',ok:()=>DK_CITIES.filter(c=>CITY[c]&&CITY[c].ix).every(c=>S.ixp[c]!==undefined)},
 {id:'fire',i:'🌋',t:tr('Ring of Fire'),d:tr('POPs all the way round the Pacific: Los Angeles, Tokyo, Taipei, Manila, Jakarta, Sydney, Auckland and Santiago.'),r:'e',ok:()=>['lax','tok','tpe','mnl','jkt','syd','akl','scl'].every(c=>S.pops[c])},
 {id:'curtain',i:'🎭',t:tr('Iron Curtain Call'),d:tr('POPs in Warsaw, Prague, Vienna, Budapest, Bucharest, Sofia, Belgrade and Tallinn.'),r:'e',ok:()=>['waw','prg','vie','bud','buh','sof','beg','tll'].every(c=>S.pops[c])},
 {id:'islands',i:'🏝️',t:tr('Island Hopper'),d:tr('POPs in Reykjavik, Dublin, London, Colombo, Taipei, Manila, Tokyo and Auckland.'),r:'e',ok:()=>['rek','dub','lon','cbo','tpe','mnl','tok','akl'].every(c=>S.pops[c])},
 {id:'wall',i:'🧱',t:tr('Through the Wall'),d:tr('Run a licensed POP in mainland China.'),r:'e',ok:()=>cnOk()&&Object.keys(S.pops).some(cnCity)},
 {id:'beaver',i:'🦫',t:tr('Dam It'),d:tr('Have your fiber chewed through by a beaver.'),r:'e',ok:()=>!!(st().f||{}).beaver},
 {id:'croc',i:'🐊',t:tr('Darwin Award'),d:tr('Have your fiber bitten by a crocodile.'),r:'l',ok:()=>!!(st().f||{}).croc},
 {id:'unbreak',i:'🛡️',t:tr('Unbreakable'),d:tr('Survive 100 incidents without customer impact.'),r:'l',ok:()=>(st().survived||0)>=100},
 {id:'lv13',i:'🌐',t:tr('Is This the Internet?'),d:tr('Reach customer level 13.'),r:'l',ok:()=>(S.lvl||1)>=13},
 {id:'gigawatt',i:'⚛️',t:tr('Gigawatt Landlord'),d:tr('Hold an AI WAN, a training run, an ingest and a fiber-pairs deal at the same time.'),r:'l',ok:()=>['aiwan','mtrain','ingest','pairs'].every(t=>S.biz.some(b=>b.type===t))},
 {id:'blitz',i:'🚀',t:tr('Blitz'),d:tr('Reach Tier 1 within two years.'),r:'l',ok:()=>!!S.won&&S.day<=730},
 {id:'peta',i:'🌌',t:tr('Hundred Terabits'),d:tr('Serve 100 Tbps.'),r:'l',ok:()=>R.served>=100000},
 {id:'petabit',i:'🪐',t:tr('A Petabit a Second'),d:tr('Serve 1 Pbps: a thousand terabits of happy traffic.'),r:'l',ok:()=>R.served>=1e6},
 {id:'llama',i:'🦙',t:tr('Llama Drama'),d:tr('Lose fiber to a llama herd.'),r:'l',secret:true,ok:()=>!!(st().f||{}).llama},
 {id:'hallway',i:'🎤',t:tr('Hallway Track'),d:tr('Attend a conference.'),r:'r',ok:()=>(st().confs||0)>=1},
 {id:'beer',i:'🍺',t:tr('Peering Over Beer'),d:tr('Set up a PNI while the conference glow lasts.'),r:'e',ok:()=>!!st().beerPni},
 {id:'circuit',i:'✈️',t:tr('Conference Circuit'),d:tr('Attend six conferences in one game.'),r:'l',ok:()=>(st().confs||0)>=6},
 {id:'kiddie',i:'💻',t:tr('Script Kiddie'),d:tr('Deploy a RouteScript that cuts your transit bill by 10% without losing traffic.'),r:'r',ok:()=>!!st().kiddie},
 {id:'fat',i:'🫠',t:tr('Fat Finger'),d:tr('Deploy a RouteScript that takes down a third of your traffic.'),r:'r',ok:()=>!!st().fat},
 {id:'scen1',i:'🎯',t:tr('Scenario Solver'),d:tr('Complete any scenario.'),r:'r',ok:()=>!!(S.scn&&S.scn.done&&S.scn.id!=='weekly')},
 {id:'weekly',i:'📅',t:tr('Weekly Regular'),d:tr('Finish a weekly challenge.'),r:'r',ok:()=>!!(S.scn&&S.scn.done&&S.scn.id==='weekly')},
 {id:'scen3',i:'🏅',t:tr('Scenario Specialist'),d:tr('Complete three different scenarios.'),r:'e',ok:()=>!!(S.scn&&S.scn.done&&S.scn.id!=='weekly')&&Object.keys(scnHof()).filter(k=>k!=='weekly').length>=3},
 {id:'scenall',i:'🏆',t:tr('Scenario Grandmaster'),d:tr('Complete every scenario.'),r:'l',ok:()=>!!(S.scn&&S.scn.done&&S.scn.id!=='weekly')&&SCN.every(x=>scnHof()[x.id])},
 {id:'elephant',i:'🐘',t:tr('I Survived the Elephant'),d:tr('Live through the day half the internet went down.'),r:'l',secret:true,ok:()=>!!S.phpDone&&!(S.ev.php>S.day)},
 {id:'vigil',i:'⚖️',t:tr('Vigilante'),d:tr('Fire the HackBack 3000™ and flatten an innocent.'),r:'e',secret:true,ok:()=>(st().vigilante||0)>=1},
 {id:'nullroute',i:'💥',t:tr('Collateral Damage'),d:tr('Blackhole one of your own cities to stop a DDoS.'),r:'r',ok:()=>(st().rtbh||0)>=1},
 {id:'toaster',i:'🍞',t:tr('Toaster Wrangler'),d:tr('Weather a DDoS with your defences ready.'),r:'c',ok:()=>(st().ddosHeld||0)>=1},
 {id:'cleanpipe',i:'🚿',t:tr('Clean Pipes'),d:tr('Turn on a transit clean-pipe add-on.'),r:'r',ok:()=>S.transit.some(t=>t.clean)},
 {id:'lamb',i:'🐐',t:tr('Sacrificial Lamb'),d:tr('Run a sacrificial PNI choke point.'),r:'r',ok:()=>S.pni.some(p=>p.sacrif)},
 {id:'flood',i:'🌊',t:tr('Held the Flood'),d:tr('Weather a multi-terabit DDoS.'),r:'e',ok:()=>(st().ddosMonster||0)>=1},
 {id:'skynot',i:'🤖',t:tr('Skynot Smiles'),d:tr('Land a HackBack 3000™ that actually works.'),r:'e',secret:true,ok:()=>(st().hackWin||0)>=1},
 {id:'zero',i:'🕳️',t:tr('Zero Peers Given'),d:tr('Reach Tier 2 with every single session over the route server.'),r:'l',secret:true,ok:()=>isTier2()&&!Object.keys(S.peers).length&&!S.pni.length},
];
function hof(){try{return JSON.parse(localStorage.getItem('sot-badges')||'{}')||{};}catch(e){return {};}}
function checkBadges(){S.ach=S.ach||{};if(S.mode==='sandbox')return;let h=null;
  for(const b of BADGES){if(S.ach[b.id]!==undefined)continue;let ok=false;try{ok=b.ok();}catch(e){}
    if(!ok)continue;S.ach[b.id]=S.day;const R0=RARITY[b.r];
    if(!h)h=hof();if(!h[b.id])h[b.id]={d:new Date().toISOString().slice(0,10),n:S.name};
    toast(`<b>${b.i} ${tr('Badge unlocked: {name}',{name:esc(b.t)})}</b><br><span style="color:${R0.col};font-weight:900">${R0.n}</span> · ${esc(b.d)}`,'goal',[],{a:'tab',v:'goals'});sfx('coin');track('badge_'+b.id);}
  if(h)try{localStorage.setItem('sot-badges',JSON.stringify(h));}catch(e){}}
function badgeGrid(){const h=hof(),got=BADGES.filter(b=>S.ach&&S.ach[b.id]!==undefined).length;
  return `<h3 style="font-size:15px;margin:14px 0 6px">${tr('Badges')} <span class="meta">${tr('{got}/{total} this game · {ever} ever',{got,total:BADGES.length,ever:Object.keys(h).filter(k=>BADGES.some(b=>b.id===k)).length})}</span></h3><div class="badges">${BADGES.map(b=>{const on=S.ach&&S.ach[b.id]!==undefined,ever=!!h[b.id],R0=RARITY[b.r],hide=b.secret&&!on&&!ever;
    return `<div class="bdg ${on?'on':ever?'ever':''}" style="--rc:${R0.col}" title="${esc(hide?tr('A secret badge'):b.t+': '+b.d)}"><span class="bi">${hide?'❔':b.i}</span><span class="bt">${esc(hide?'???':b.t)}</span><span class="br">${R0.n}${ever&&!on?' · '+tr('earned before'):''}</span>${hide?'':`<span class="bd">${esc(b.d)}</span>`}</div>`;}).join('')}</div>`;}
function checkGoals(){checkBadges();
  for(const g of GOALS){if(S.done[g.id]!==undefined)continue;let ok=false;try{ok=g.ok();}catch(e){}
    if(ok){S.done[g.id]=S.day;if(g.r&&S.mode!=='sandbox'){S.cash+=g.r;}
      toast(`<b>${tr('Goal complete: {name}',{name:esc(g.t)})}</b>${g.r?`<br>${tr('Reward: +{amt}',{amt:fmt$(g.r)})}`:''}`,'goal',[],{a:'tab',v:'goals'});sfx('coin');
      track('goal_'+g.id);if(g.win&&!S.won){S.won=true;track('win_tier1');checkBadges();showWin();}}}
}

