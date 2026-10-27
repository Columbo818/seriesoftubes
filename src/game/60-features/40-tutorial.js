/* ---------- guided first game ---------- */
const TUT=[
 {t:tr('Your router is live. Press “Launch broadband” to sell internet to the people of your city.'),sel:'[data-act="launchBB"]',ok:()=>S.pops[S.home]&&S.pops[S.home].bb},
 {t:tr('Your customers want the whole internet. Open the Transit tab and buy a port from a carrier.'),sel:'[data-act="tab"][data-args*=\'"up"\'],[data-act="buyTransit"]',ok:()=>S.transit.length>0,skip:()=>!NETS.some(n=>sellsAt(n,S.home))},
 {t:tr('Transit costs money per gigabit. Peering is free: open the Peering tab, buy an IX port, then join the route server.'),sel:'[data-act="tab"][data-args*=\'"peer"\'],[data-act="buyIx"],[data-act="rs"]',ok:()=>Object.keys(S.rs).length>0,skip:()=>!ixName(S.home)},
 {t:tr('Start the clock with 1× and watch traffic and money flow. You can pause any time.'),sel:'#sp1',ok:()=>S.day>=5},
 {t:tr('Grow: drag from your pink router onto a nearby city to lay fiber and open a second POP.'),sel:null,ok:()=>S.links.length>0},
 {t:tr('Businesses pop up as $ bubbles on the map. Open Deals and sign your first customer.'),sel:'[data-act="leftTab"][data-args*=\'"deals"\']',ok:()=>S.biz.length>0},
];
function tutorialStart(){let done=false;try{done=!!localStorage.getItem('sot-tut');}catch(e){}if(done||window.__TUBES_TEST__&&!window.__TUBES_TUT__)return;S.tut=0;renderCoach();}
function renderCoach(){const el=$('coach');if(!el)return;document.querySelectorAll('.coach-glow').forEach(x=>x.classList.remove('coach-glow'));
  if(!S||S.tut===undefined||S.tut===null||S.lost){el.hidden=true;return;}
  while(S.tut<TUT.length){const st=TUT[S.tut];let ok=false;try{ok=st.ok()||(st.skip&&st.skip());}catch(e){}if(!ok)break;S.tut++;}
  if(S.tut>=TUT.length){S.tut=null;el.hidden=true;try{localStorage.setItem('sot-tut','1');}catch(e){}toast(tr('<b>You know the basics.</b><br>The goals on the left take it from here. Things will break. That is the fun part.'),'goal');return;}
  const st=TUT[S.tut];el.innerHTML=`<div class="ct"><span class="cs">${tr('Step {n} of {total}',{n:S.tut+1,total:TUT.length})}</span>${esc(st.t)}</div>${btn(tr('Skip tutorial'),'tutSkip',{},'ghost sm')}`;el.hidden=false;
  if(st.sel){const t=document.querySelector(st.sel);if(t)t.classList.add('coach-glow');}}
