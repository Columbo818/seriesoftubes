function fireEvent(){
  const opts=['viral','price','grant'];
  if(S.day>50)opts.push('sanction','tariff','hijack','landban','shutdown','redsea','baltic');
  if(S.day>HW_FREE&&!hwShock())opts.push('hwshock');
  if(S.day>90&&S.links.filter(l=>l.kind==='wave'&&!l.sub).length>=3)opts.push('ctrlplane');
  if(Object.keys(S.pops).some(ruCity))opts.push('runet','runet');
  if(S.pops.doh&&Object.keys(S.pops).some(c=>CITY[c].gcc||CITY[c].uae)&&!(S.ev.gulf>S.day))opts.push('gulf');
  if(Object.keys(S.pops).some(c=>CITY[c].saudi))opts.push('mega');
  if(['mnl','hkg','tok','icn','sha','jkt'].some(c=>S.pops[c]))opts.push('typhoon');
  if(S.pops.icn&&!S.krExit)opts.push('krexit');if(S.pops.icn&&!(S.ev.krroute>S.day))opts.push('krroute');
  if(Object.keys(S.pops).some(cnCity)||R.gfwCross>1)opts.push('golden','gfw');
  if(S.transit.some(t=>t.net==='cog'))opts.push('depeer','depeer');
  if(Object.keys(S.peers).some(k=>k.startsWith('drz@'))||Object.keys(S.rs).length)opts.push('cake');
  const e=pick(opts);
  if(e==='gulf'){const dur=60+Math.floor(Math.random()*60);S.ev.gulf=S.day+dur;toast(tr('<b>The neighbours have fallen out.</b><br>A diplomatic spat closes borders and airspace around Qatar. Every link between Doha and Saudi Arabia or the UAE is down for about {n} days. Route the long way round, by sea.',{n:dur}),'bad');sfx('alert');}
  /* A wave supplier pushes one bad update to its optical control plane, and every wave it sells you in a
     region goes dark for a day or two. Your own dark fiber, subsea waves and fabric circuits keep working. */
  if(e==='ctrlplane'){const by={};for(const l of S.links)if(l.kind==='wave'&&!l.sub&&!(l.cut>S.day)){const r=CITY[l.a].reg;(by[r]=by[r]||[]).push(l);}
    const reg=Object.keys(by).sort((a,b)=>by[b].length-by[a].length)[0];if(!reg)return;const hit=by[reg],until=S.day+2;
    for(const l of hit)l.cut=Math.max(l.cut||0,until);
    const RN={EU:tr('Europe'),AM:tr('North America'),SA:tr('South America'),AS:tr('Asia'),OC:tr('Oceania'),AF:tr('Africa')};
    addInc({type:'ctrlplane',ref:'reg:'+reg,links:hit.map(l=>l.id),until,msg:tr('Your wave supplier pushed one malformed update to its optical control plane, and it flooded every node. All {n} leased waves you have in {reg} are dark. Their status page says “degraded”.',{n:hit.length,reg:RN[reg]||reg}),cost:Math.round(hit.reduce((a,l)=>a+l.mo,0)*0.3),fix:tr('Escalate to their CTO')},'ctrlplane');
    toast(tr('<b>Optical control plane meltdown!</b><br>Every leased wave in {reg} just went dark at once. Your own dark fiber is fine. This is why people own fiber.',{reg:RN[reg]||reg}),'bad');sfx('alert');return;}
  if(e==='krexit'){S.krExit=S.day+1;S.stats.incidents++;S.stats.survived++;
    toast(tr('<b>Glitch is leaving Korea.</b><br>The game-streaming site says Korean network fees are “prohibitively expensive” and shuts down there. Its Seoul traffic drops by half, for good. Local streamers have already moved on.'),'bad');sfx('alert');return;}
  if(e==='krroute'){S.ev.krroute=S.day+20;addInc({type:'krroute',ref:'icn',until:S.day+20,msg:tr('Faceplant got tired of Korean usage fees and quietly moved Korean users to its Hong Kong servers. Pages crawl in for everyone in Seoul. The regulator is drafting a fine.'),cost:0},'krroute');
    toast(tr('<b>Faceplant rerouted Korea via Hong Kong.</b><br>Seoul users get a fifth less of it for 20 days, however you connect.'),'bad');sfx('alert');return;}
  if(e==='mega'){const c=pick(Object.keys(S.pops).filter(x=>CITY[x].saudi)),bw=pick([800,1600,3200]),start=S.day+15;S.offers.push({id:uid(),city:c,city2:null,name:tr('A futuristic city that is not built yet, demo day in {city}',{city:CITY[c].name}),type:'event',bw,rate:0,reqs:[],start,dur:4,fee:bw*4*90,exp:start-2});toast(tr('<b>A gigaproject wants a demo.</b><br>{bw} for four days in {city}, to show off a city that is still mostly renderings. Check the Deals tab.',{bw:fmtG(bw),city:CITY[c].name}),'goal');}
  if(e==='sanction'){S.ev.sanction=S.day+60;toast(tr('<b>Sanctions!</b><br>The Republic of Paperworkistan sanctioned your router vendor’s favorite screw supplier. Spare parts are slow: router crashes take twice as long to fix for 60 days.'),'bad');sfx('alert');return;}
  if(e==='hwshock'){hwShockStart();return;}
  if(e==='tariff'){S.ev.tariff=S.day+90;toast(tr('<b>Trade war on optics</b><br>Two governments slapped tariffs on each other’s lasers. Optics cost 40% more for 90 days.'),'bad');sfx('alert');return;}
  if(e==='hijack'){const nh=NETS.map(n=>n.id).filter(()=>Math.random()<0.6),old=S.ev.rpki&&S.ev.rpki.until>S.day?S.ev.rpki:null;S.ev.rpki=old?{until:Math.max(old.until,S.day+1),nets:[...new Set(old.nets.concat(nh))]}:{until:S.day+1,nets:nh};addInc({type:'hijack',ref:'rpki',until:S.day+1,msg:tr('A state-owned ISP “accidentally” announced your prefixes for 18 minutes. Their apology press release was suspiciously well written. Many networks are still routing your traffic into the void.'),cost:1500,fix:tr('Call everyone you know')});toast(tr('<b>BGP hijack</b><br>Someone else is announcing your prefixes. Reach is down until it is cleaned up.'),'bad');sfx('alert');return;}
  if(e==='landban'){const lc=[...new Set(CABLE_PAIRS.flatMap(c=>[c.a,c.b]))];const c=pick(lc);S.ev.landban={city:c,until:S.day+45};toast(tr('<b>Landing permit dispute in {city}</b><br>Two ministries both claim the beach. No new subsea links can land there for 45 days.',{city:CITY[c].name}),'bad');return;}
  if(e==='shutdown'){const ps=Object.keys(S.pops).filter(c=>c!==S.home);if(!ps.length)return;const c=pick(ps);S.pops[c].down=Math.max(S.pops[c].down||0,S.day+1);addInc({type:'shutdown',ref:c,until:S.day+1,msg:tr('Regulators ordered every network in {city} to switch off for a day during national school exams. Yes, this really happens.',{city:CITY[c].name}),cost:0});toast(tr('<b>Ordered offline in {city}</b><br>A government exam-day shutdown. Your POP there is dark for a day.',{city:CITY[c].name}),'bad');sfx('alert');return;}
  if(e==='typhoon'){const c=pick(['mnl','hkg','tok','icn','sha','jkt'].filter(x=>S.pops[x])),p=S.pops[c],nm=pick([tr('Typhoon Bandwidth'),tr('Typhoon Latency'),tr('Typhoon Jitter'),tr('Typhoon Packet-Loss')]);
    if(p.gen){S.stats.survived++;toast(tr('<b>{name} hits {city}</b><br>The grid is down, but your backup generator kept the routers running.',{name:nm,city:CITY[c].name}),'good');sfx('alert');return;}
    p.down=Math.max(p.down||0,S.day+2);addInc({type:'power',ref:c,until:p.down,msg:tr('{name} knocked out power in {city}. Your POP has no generator.',{name:nm,city:CITY[c].name}),cost:7000,fix:tr('Rent a generator')});toast(tr('<b>{name} hits {city}</b><br>Power is out and your POP is dark for two days. A generator would have saved it.',{name:nm,city:CITY[c].name}),'bad');sfx('alert');compute();return;}
  if(e==='runet'){S.ev.runet=S.day+1;toast(tr('<b>Sovereign internet drill</b><br>Moscow unplugged itself from the rest of the internet for a day to see what happens. Everything leaving Russia is dark until tomorrow.'),'bad');sfx('alert');compute();return;}
  if(e==='baltic'){const BAL=['clion','havf','danice'];const hit=S.links.filter(l=>l.cable&&BAL.includes(l.cable)&&!(l.cut>S.day));
    if(!hit.length){toast(tr('<b>Baltic cable damaged</b><br>A cargo ship dragged its anchor for 100 km and swears it noticed nothing. You have no links on those cables.'),'goal');return;}
    const dur=15+Math.floor(Math.random()*15),en=N_('A cargo ship dragged its anchor along the Baltic seabed for 100 km and swears it noticed nothing. Investigators are “looking into it”.');for(const tk of new Set(hit.map(l=>l.trench||l.id))){S.links.filter(l=>(l.trench||l.id)===tk).forEach(l=>l.cut=Math.max(l.cut||0,S.day+dur));addInc({type:'redsea',ref:tk,until:S.day+dur,msg:tr(en),cost:0},en);}
    toast(tr('<b>Baltic cable damaged</b><br>{n} of your links are down for about {d} days.',{n:hit.length,d:dur}),'bad');sfx('alert');compute();return;}
  if(e==='redsea'){const RED=['twoaf','smw6','peace','aae','eig','eassy'];const hit=S.links.filter(l=>l.cable&&RED.includes(l.cable)&&!(l.cut>S.day));
    if(!hit.length){toast(tr('<b>Cables cut in the Red Sea</b><br>A ship dragged its anchor across several cables. Everyone blames everyone. Luckily you do not use those cables.'),'goal');return;}
    const dur=20+Math.floor(Math.random()*15),en=N_(`A ship drifting without power dragged its anchor through the Red Sea cables. Everyone blames everyone. Repair ships need permits from three governments.`);for(const tk of new Set(hit.map(l=>l.trench||l.id))){S.links.filter(l=>(l.trench||l.id)===tk).forEach(l=>l.cut=Math.max(l.cut||0,S.day+dur));addInc({type:'redsea',ref:tk,until:S.day+dur,msg:tr(en),cost:0},en);}
    toast(tr('<b>Cables cut in the Red Sea</b><br>{n} of your subsea links are down for about {d} days while the diplomats argue about repair ships.',{n:hit.length,d:dur}),'bad');sfx('alert');compute();return;}
  if(e==='golden'){S.ev.golden=S.day+7;toast(tr('<b>Golden Week!</b><br>Demand in mainland China is up 40% for a week.'),'goal');return;}
  if(e==='gfw'){S.ev.gfw=S.day+10;toast(tr('<b>The border got stricter.</b><br>Cross-border packet loss rises to 35% for 10 days. Premium routes are barely affected.'),'bad');sfx('alert');return;}
  if(e==='viral'){S.ev.viral=S.day+8;toast(tr('<b>New season of “Stranger Pings” just dropped!</b><br>Eyeball demand is up 25% for a week. Got headroom?'),'goal');}
  else if(e==='price'){S.priceMul*=0.92;toast(tr('<b>Transit prices fell 8%.</b><br>They do this every year. Nobody knows where the bottom is.'),'good');}
  else if(e==='grant'){S.cash+=30000;toast(tr('<b>Rural broadband grant: +$30k</b><br>The Ministry of Tubes likes what you are doing.'),'good');sfx('coin');}
  else if(e==='depeer'){S.ev.depeer=S.day+20;addInc({type:'depeer',ref:'cog',until:S.day+20,msg:tr('Cogentle and Goggle are in a peering spat. Goggle is unreachable through Cogentle transit.'),cost:0});toast(tr('<b>Peering spat!</b><br>Cogentle de-peered Goggle for 20 days. Goggle traffic over Cogentle transit is gone. Peer with Goggle directly or use another upstream.'),'bad');sfx('alert');}
  else if(e==='cake'){S.cash+=8000;toast(tr('<b>Drizzle Electric sent you an IPv6 cake.</b><br>You sold it for $8k.'),'good');sfx('coin');}
}

