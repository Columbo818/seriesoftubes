/* Big networks sometimes refuse to peer in a particular city, for a while. Each (network, city)
   pair gets a stable verdict per window, derived from a hash, so asking again does not reroll it. */
const SNUB_WIN=150,SNUB_P=0.22;
const SNUB_IX=[tr('Only peers over PNIs in this metro. Order a cross-connect instead.'),tr('Their IX port here is full until the next upgrade. They promise it is soon.'),tr('Moved everything in this city to PNIs. Please read their PearingDB page, all 40 pages of it.'),tr('The peering coordinator for this city is on a six-month sabbatical.'),tr('Their policy here says "IX peering by invitation only". You were not invited.')];
const SNUB_ALL=[tr('Not accepting new peers in this region right now.'),tr('Region frozen while they renegotiate with the local incumbent.'),tr('Their routers in this city are "at capacity". They are not.'),tr('Already reach you through your transit provider here and think that is fine.'),tr('Their lawyers are reviewing every peering agreement in this country. Again.'),tr('A new VP wants to "monetise interconnection" in this market.')];
function hstr(t){let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function bigPeer(n){return !!n&&n.pol==='selective'&&n.share>=0.03;}
function snub(id,c){
  const n=NET[id];if(!c||!bigPeer(n)||!S||S.myIx[c])return null;
  const off=hstr(id+c)%SNUB_WIN,ep=Math.floor((S.day+off)/SNUB_WIN),h=hstr(S.asn+'|'+id+'|'+c+'|'+ep);
  if(h%1000>=SNUB_P*1000)return null;
  const all=(h>>>10)%5<2,list=all?SNUB_ALL:SNUB_IX;
  return {all,why:list[(h>>>13)%list.length],until:(ep+1)*SNUB_WIN-off};
}
/* Remote peering: offered, but discouraged. A reseller marks up the port, oversubscribes it,
   and many selective networks refuse members who are not physically in the building. */
const REMOTE_FEE=1.5,REMOTE_CAP=0.8;
const REMOTE_WARN=`<p class="note" style="color:var(--bad)">${tr('<b>Remote peering is a last resort.</b> Ports come through a reseller at 1.5× the price, only 80% of the port is really yours, latency rides the fabric, one fabric outage drops every session, and many selective networks refuse remote members. A POP here is better.')}</p>`;
const REMOTE_WHY=[tr('Policy: no remote peers. Be in the building or be in the transit bill.'),tr('Saw your session come in over a fabric and said "we can smell the VXC from here".'),tr('Only peers with members they can reach without a 1,500 km hairpin.'),tr('Their PearingDB entry says "Remote peering: No (we mean it)".'),tr('Tried a remote peer once. It flapped during a product launch. Never again.')];
function isRemote(c){return S.ixp[c]!==undefined&&!S.pops[ixCity(c)]&&!S.myIx[c];}
function noRemote(id){const n=NET[id];if(!n||n.pol!=='selective')return false;return hstr(id+'|remote')%100<(n.share>=0.03?60:30);}
/* Europe's peering market is crowded and competitive: ports are cheaper, and incumbents cut prices
   when a challenger in the same metro gets too popular. DE-KICKS harmonises instead. */
const IX_REG={EU:0.8};
function ixMul(x){const X=XIXM[x],c=ixCity(x);return (X?X.cheap:(CITY[c].ixCheap||1))*(IX_REG[CITY[c].reg]||1)*(CITY[c].au?AU_IX:1)*((S&&S.ixCut&&S.ixCut[x])||1);}
function ixPortMo(c,tier){const X=XIXM[c];if(X&&tier<=(X.freeTo??-1))return 0;return Math.round(PORT[tier].ix*(S.pops[ixCity(c)]?1:REMOTE_FEE)*dkMult(c)*ixMul(c));}
function ixPriceWar(d){if(!S.ixp||Math.random()>=1/120)return;
  const mine=Object.keys(S.ixp).filter(x=>{const c=ixCity(x);return CITY[c].reg==='EU'&&ixStatic(c).length>1;});if(!mine.length)return;
  const x=pick(mine),c=ixCity(x),rival=pick(ixStatic(c).filter(y=>y!==x));
  if(isDk(x)){toast(tr('<b>{rival} is poaching DE-KICKS members in {city}.</b><br>DE-KICKS responded with a webinar about "the value of premium interconnection". Prices unchanged.',{rival:esc(ixName(rival)),city:esc(CITY[c].name)}),'bad');return;}
  S.ixCut=S.ixCut||{};const cur=S.ixCut[x]||1;if(cur<=0.62)return;S.ixCut[x]=+Math.max(0.6,cur*0.9).toFixed(3);
  toast(tr('<b>Price war in {city}!</b><br>{ix} cut its port prices 10% to stop members drifting to {rival}. Your invoice just got smaller.',{city:esc(CITY[c].name),ix:esc(ixName(x)),rival:esc(ixName(rival))}),'good');}
