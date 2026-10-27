// Static markup: data-i18n text and every aria-label/title go through the dictionary once at boot.
function i18nDom(){if(LANG==='en')return;for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=tr(el.textContent);
  for(const a of ['aria-label','title'])for(const el of document.querySelectorAll('['+a+']'))el.setAttribute(a,tr(el.getAttribute(a)));}
// One button per [value,label] option; the current one is highlighted.
function segBtns(act,cur,opts){return opts.map(([v,l])=>btn(l,act,{v},cur===v?'pink sm':'ghost sm')).join('');}
/* Animation setting: auto follows the system's reduced-motion preference, or force it on or off. */
/* Settings are per device (localStorage), not part of the save: they are about how you like to play. */
const PREF_DEF={pauseFurious:true,warnUnhappy:true,pauseIncident:false};
let PREFS=(()=>{try{const j=JSON.parse(localStorage.getItem('sot-prefs')||'{}');return j&&typeof j==='object'?j:{};}catch(e){return {};}})();
const pref=k=>typeof PREFS[k]==='boolean'?PREFS[k]:PREF_DEF[k];
function setPref(k,v){if(!own(PREF_DEF,k))return;PREFS[k]=!!v;try{localStorage.setItem('sot-prefs',JSON.stringify(PREFS));}catch(e){}}
// Stop the clock for something the player must see. Nothing happens if the game is already paused.
function autoPause(){if(!S||!UI.speed)return false;UI.resumeSpeed=UI.speed;UI.speed=0;renderHUD();return true;}
const resumeAct=()=>({l:tr('Resume'),act:'speed',args:{v:UI.resumeSpeed||1}});
function settingsHtml(){const seg=(lab,act,cur,opts,note)=>`<div class="setline"><span>${lab}</span><div class="seg">${segBtns(act,cur,opts)}</div></div>${note?`<p class="meta" style="margin:0 0 6px">${note}</p>`:''}`;
  const onoff=k=>[[k+':1',tr('On')],[k+':0',tr('Off')]],cur=k=>k+':'+(pref(k)?1:0);
  return `<div style="display:flex;align-items:center"><h2 style="font-size:26px">⚙️ ${tr('Settings')}</h2><button class="x" data-act="settingsClose" aria-label="${tr('Close')}">×</button></div><p class="tagline">${tr('Saved on this device.')}</p>
  <h3 class="sub4">${tr('Customers and alerts')}</h3>
  ${seg(tr('Pause when a customer is furious'),'prefSet',cur('pauseFurious'),onoff('pauseFurious'),tr('The game stops so you can fix their service before they cancel. Most useful at high speed.'))}
  ${seg(tr('Warn when a customer gets unhappy'),'prefSet',cur('warnUnhappy'),onoff('warnUnhappy'),tr('An early heads-up below 60% happiness, long before they are furious.'))}
  ${seg(tr('Pause on outages that hurt'),'prefSet',cur('pauseIncident'),onoff('pauseIncident'),tr('Stops the game when a failure costs you real traffic, not when it reroutes by itself.'))}
  <h3 class="sub4">${tr('Display and sound')}</h3>
  ${seg(tr('Animations'),'animSet',UI.anim||'auto',[['auto',tr('Auto')],['on',tr('On')],['off',tr('Off')]],tr('Auto follows your device’s reduce-motion setting. Off freezes the map: no moving packets, pulses or floating text.'))}
  ${seg(tr('Sound'),'soundSet',UI.muted?'off':'on',[['on',tr('On')],['off',tr('Off')]])}
  ${seg(tr('Language'),'langSet',LANG,Object.entries(LANGS))}
  ${seg(tr('Viewport info'),'vpSet',VP_T?'on':'off',[['on',tr('On')],['off',tr('Off')]],tr('For reporting layout bugs: shows what your screen tells the game.'))}
  ${installRow()}<div class="btns" style="margin-top:12px">${btn(tr('Done'),'settingsClose',{},'pink')}</div>`;}
const refreshSettings=()=>{if(UI.setOpen)openModal(settingsHtml());};
function animOn(){const m=UI.anim||'auto';if(m==='on')return true;if(m==='off')return false;try{return !matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return true;}}
function applyAnim(){const r=document.documentElement;r.classList.toggle('no-anim',UI.anim==='off');r.classList.toggle('anim-force',UI.anim==='on');if(!animOn())FLOATS.length=0;}
const toS=(wx,wy,k=0)=>[(wx+k*W-cam.x)*cam.z+CW/2,(wy-cam.y)*cam.z+CH/2];
const iconScale=()=>clamp(Math.sqrt(cam.z),0.7,1.35);
