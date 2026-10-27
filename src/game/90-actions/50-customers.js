Object.assign(ACT,{
 advertise:({id})=>{const l=S.links.find(x=>x.id===id);if(!l||l.kind!=='df'||l.ready>S.day)return;if(S.offers.some(o=>o.link===l.id))return;
   const t=freeCh(l)>=1?'wwave':pairFree(l)?'dfpair':null;if(!t){toast(tr('<b>Nothing spare to sell on this fiber.</b><br>Every channel is lit or sold, and the trench has no free pair.'),'bad');sfx('err');return;}
   const T=BIZ_T[t],nm=()=>{const list=T.names.filter(n=>!S.usedNames.includes(n)),n=list.length?pick(list):pick(T.names);S.usedNames.push(n);return n;};
   // A capacity broker finds a buyer at once and keeps 10% of the monthly price.
   const o=fiberOffer(t,l,nm,0.9);o.broker=true;S.offers.push(o);toast(tr('<b>Listed with a capacity broker.</b><br>{name} wants {what}. Accept it on the fiber or in Deals.',{name:esc(o.name),what:esc(o.what)}),'good');sfx('click');after();},
 accept:({id})=>{const o=S.offers.find(x=>x.id===id);if(!o)return;if(!bHas(o)){toast(tr('<b>You need a POP in every city on the contract first.</b>'),'bad');return;}
   if(o.type==='wwave'){const l=S.links.find(x=>x.id===o.link);if(!l||chMax(l)-(l.ch||[]).length-soldSlots(l)<o.slots){toast(tr('<b>Not enough free channels on that fiber any more.</b>'),'bad');return;}}
   if(BIZ_T[o.type].event&&S.day>=o.start){toast(tr('<b>Too late: the event has already started.</b>'),'bad');return;}
   // A carrier renting more alien waves on a fiber it already rents grows its contract, like a real order for extra waves,
   // instead of a new customer for every few waves (a big fiber business otherwise fills the save with tiny contracts).
   const more=o.type==='wwave'&&S.biz.find(b=>b.type==='wwave'&&b.link===o.link&&b.name===o.name);
   if(more){const l=S.links.find(x=>x.id===o.link);S.offers=S.offers.filter(x=>x!==o);more.slots=(more.slots||0)+(o.slots||0);more.rate+=o.rate;if(l)more.what=wwWhat(l,more.slots);
     floater(CITY[o.city].x,CITY[o.city].y-30,tr('Signed!'),'#16A866');sfx('coin');after();return;}
   S.offers=S.offers.filter(x=>x!==o);S.biz.push({id:o.id,city:o.city,city2:o.city2||null,reqs:o.reqs||[],latMax:o.latMax||null,route:BIZ_T[o.type].scenic?'scenic':BIZ_T[o.type].lat?'fast':'normal',name:o.name,type:o.type,bw:o.bw,rate:o.rate,mood:100,since:S.day,sites:o.sites||null,start:o.start,dur:o.dur,fee:o.fee,link:o.link,slots:o.slots||0,what:o.what,prov:o.prov});
   floater(CITY[o.city].x,CITY[o.city].y-30,tr('Signed!'),'#16A866');sfx('coin');after();},
 decline:({id})=>{S.offers=S.offers.filter(x=>x.id!==id);after();},
 dropBiz:({id})=>{const b0=S.biz.find(x=>x.id===id);if(!b0)return;if(BIZ_T[b0.type].event&&S.day>=b0.start){toast(tr('<b>The event is already running.</b><br>The organisers will not let you walk out now.'),'bad');sfx('err');return;}if(UI.confirm!==id){UI.confirm=id;renderPanel();return;}S.biz=S.biz.filter(b=>b.id!==id);UI.confirm=null;after();},
});
