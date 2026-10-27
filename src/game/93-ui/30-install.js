/* ================= INSTALL (PWA) ================= */
let installEvt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;});
addEventListener('appinstalled',()=>{installEvt=null;track('pwa_installed',true);if(UI.pendGame){const p=UI.pendGame;UI.pendGame=null;UI.pitched=true;beginGame(...p);}toast(tr('<b>Installed!</b><br>Open Series of Tubes from your home screen. Your saves come along.'),'good');});
const isStandalone=()=>{try{return navigator.standalone===true||!!(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);}catch(e){return false;}};
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function installRow(){if(isStandalone())return '';
  return `<div class="row icard"><div class="grow"><div class="nm">📲 ${tr('Best played as an app')}</div><div class="meta">${tr('Full screen, works offline, one tap from your home screen.')}${isIOS()?' '+tr('Install it before you start: a game begun in Safari stays in Safari.'):''}</div></div>${btn(tr('Install'),'install',{},'pink sm')}</div>`;}
/* Phones get a real pitch before a new game: an installed app is full screen, works offline, and on iPhone
   keeps its save away from Safari's clean-ups. Storage is separate on iOS, so installing first matters. */
const SHARE_SVG='<svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path d="M8 1v10M4.5 4.5 8 1l3.5 3.5M5 7H2.5v9.5h11V7H11" fill="none" stroke="#1E2640" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const needPitch=()=>isPhone()&&!isStandalone();
function installSteps(){
  if(isIOS())return `<ol class="isteps"><li>${tr('Tap <b>Share</b> {icon} in the browser toolbar.',{icon:SHARE_SVG})}</li><li>${tr('Tap <b>Add to Home Screen</b>. You may need to scroll down, or tap <b>More</b> first.')}</li><li>${tr('Open <b>Series of Tubes</b> from your home screen and start your network there.')}</li></ol>`;
  if(installEvt)return '';
  return `<ol class="isteps"><li>${tr('Open your browser menu (⋮).')}</li><li>${tr('Tap <b>Install app</b> or <b>Add to Home screen</b>.')}</li><li>${tr('Open <b>Series of Tubes</b> from your home screen.')}</li></ol>`;}
function pitchHtml(starting){const ios=isIOS();
  return `<div style="display:flex;align-items:center"><div>${starting?`<div class="eyebrow">${tr('Before you start')}</div>`:''}<h2 style="font-size:26px">📲 ${tr('Play it as an app')}</h2></div><button class="x" data-act="${starting?'pitchSkip':'closeModal'}" aria-label="${tr('Close')}">×</button></div>
  <p class="lead" style="margin-top:6px">${tr('Series of Tubes is made for your home screen. It takes ten seconds, costs nothing, and it is a much better game there:')}</p>
  <ul class="pitch"><li>🗺️ <b>${tr('Full screen.')}</b> ${tr('No browser bars, a lot more map.')}</li><li>📶 <b>${tr('Works offline.')}</b> ${tr('Build your backbone on the train or on a plane.')}</li>${ios?`<li>💾 <b>${tr('Your save stays safe.')}</b> ${tr('Safari can clear the data of websites you have not opened for a week. A home-screen app keeps its own.')}</li><li class="warn">⚠️ <b>${tr('Install first.')}</b> ${tr('On iPhone, a game started in Safari does not carry over to the home-screen app.')}</li>`:`<li>⚡ <b>${tr('One tap away.')}</b> ${tr('It opens straight into your network, like any other app.')}</li>`}</ul>
  ${installSteps()}
  <div class="btns cta" style="margin-top:12px">${installEvt?btn(tr('Install the app'),'install',{},'pink big'):''}${starting?btn(tr('Play in the browser anyway'),'pitchSkip',{},installEvt?'ghost':'ghost big'):btn(tr('Got it'),'closeModal',{},installEvt?'ghost':'pink')}</div>`;}
if('serviceWorker' in navigator&&location.protocol==='https:'&&!IS_DEV)addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
