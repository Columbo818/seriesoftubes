/* Sold out: now and then a carrier has no spare capacity of a size on a route. Each route, size and 90-day window
   gets a stable verdict from a hash, so asking again does not reroll it, and bigger waves sell out more often. */
const SOLD_WIN=90,SOLD_WHY=[N_('A hyperscaler bought every wave of that size on this route last week.'),N_('The carrier is out of spectrum here until its next line-system upgrade.'),N_('The transponders for this route are on a container ship. The ship is somewhere near Singapore.'),N_('The capacity is “available in the system”. Nobody can find it in the system.'),N_('Their capacity planner is on holiday, and he took the spreadsheet with him.'),N_('The upgrade is planned for Q3. Which year, the email does not say.')];
const soldP=tier=>Math.min(0.1,0.02+0.012*tier);
// Never in the first 90 days: a new network has enough on its plate. Never in the tutorial or a scenario's first quarter either.
function soldOut(a,b,tier,via){if(!S||S.day<SOLD_WIN||S.tut)return null;const k=(a<b?a+b:b+a)+'|'+(via||'')+'|'+tier,off=hstr(k)%SOLD_WIN,ep=Math.floor((S.day+off)/SOLD_WIN),h=hstr(S.asn+'|'+k+'|'+ep);
  if(h%1000>=soldP(tier)*1000)return null;return {why:SOLD_WHY[(h>>>10)%SOLD_WHY.length],until:(ep+1)*SOLD_WIN-off};}
function snubWhy(sn){const d=Math.max(1,sn.until-S.day);return sn.why+' '+trn('They will reconsider in {n} day.','They will reconsider in {n} days.',d);}
// Paid-peering giants drop the fee for networks too big to ignore (freeLv: the customer level that does it).
const paidFree=n=>!!(n&&n.freeLv&&lvl()>=n.freeLv);
function peerOk(id,via,city){
  const n=NET[id],dem=R.demTo[id]||0;
  const sn=snub(id,city);if(sn&&(via==='ix'||sn.all))return {ok:false,snub:true,why:snubWhy(sn)};
  if(msfNope(id,city))return {ok:false,why:tr(MSF_NOPE[hstr(ixCity(city)+S.day)%MSF_NOPE.length])};
  if(via==='ix'&&city&&isRemote(city)&&noRemote(id))return {ok:false,remote:true,why:REMOTE_WHY[hstr(id)%REMOTE_WHY.length]};
  if(n.pol==='open')return {ok:true};
  if(n.pol==='selective'){const need=Math.round((via==='pni'?n.minPni:n.minIx)*confBoost(id)*repMul());return dem>=need?{ok:true}:{ok:false,why:tr('Wants ≥ {need} Gbps of traffic from you (you send {dem})',{need,dem:dem.toFixed(1)})};}
  if(n.pol==='paid'&&paidFree(n))return via==='pni'?{ok:true,free:true}:{ok:false,why:tr('Peers with you for free now, but only over a PNI')};
  if(n.pol==='paid')return via==='pni'?{ok:true,fee:n.paidFee}:{ok:false,why:n.perG?tr('Sender pays: a paid PNI only, {fee}/mo plus {g} per Gbps you send',{fee:fmt$(n.paidFee),g:fmt$(n.perG)}):tr('Paid peering only, over a PNI')};
  if(n.type!=='t1'){if(via!=='pni')return {ok:false,why:tr('Only peers over PNIs, and only with networks it considers important')};const need=Math.round(60*confBoost(id));return dem>=need||isTier2()?{ok:true}:{ok:false,why:tr('Wants you to be a Tier 2, or send ≥ {need} Gbps to it (you send {dem})',{need,dem:dem.toFixed(1)})};}
  if(via!=='pni')return {ok:false,why:tr('Tier 1s never peer at IXs')};
  const c=t1Club();return c.ok?{ok:true}:{ok:false,why:tr('Not big enough yet: {list}',{list:c.missing.join(', ')})};
}
