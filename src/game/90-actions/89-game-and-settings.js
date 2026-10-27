Object.assign(ACT,{
 randomName:()=>{const input=$('nmIn');if(input)input.value=UI.nm=randomNetworkName(input.value);},
 start:()=>{const nm=(($('nmIn')&&$('nmIn').value)||randomNetworkName()).slice(0,24);beginGame(nm,UI.startCity,{mode:UI.mode==='sandbox'?'sandbox':'normal'});},
 modeSet:({m})=>{UI.mode=m;document.querySelectorAll('.modeb').forEach(b=>b.classList.toggle('pink',b.dataset.m===m));document.querySelectorAll('.modeb').forEach(b=>b.classList.toggle('ghost',b.dataset.m!==m));},
 scenarios:()=>{UI.nm=(($('nmIn')&&$('nmIn').value)||UI.nm||(S&&S.name)||randomNetworkName()).slice(0,24);scenarioModal();},
 startScn:({id,sure})=>{const sc=SCN.find(x=>x.id===id);if(!sc)return;if(!sure&&S&&UI.started&&!S.lost&&!(S.scn&&(S.scn.done||S.scn.failed))){openModal(`<h2 style="font-size:26px">${tr('Start {name}?',{name:esc(sc.n)})}</h2><p class="tagline">${tr('{name} will be replaced. Export it from the menu first if you want to keep it.',{name:esc(S.name)})}</p><div class="btns">${btn(tr('Start the scenario'),'startScn',{id,sure:1},'pink big')}${btn(tr('Keep playing'),'closeModal',{},'ghost big')}</div>`);return;}beginGame(UI.nm||(S&&S.name)||randomNetworkName(),sc.city,{scn:sc});},
 startWeekly:({sure}={})=>{if(!sure&&S&&UI.started&&!S.lost&&!(S.scn&&(S.scn.done||S.scn.failed))){openModal(`<h2 style="font-size:26px">${tr('Start the weekly challenge?')}</h2><p class="tagline">${tr('{name} will be replaced. Export it from the menu first if you want to keep it.',{name:esc(S.name)})}</p><div class="btns">${btn(tr('Start the challenge'),'startWeekly',{sure:1},'pink big')}${btn(tr('Keep playing'),'closeModal',{},'ghost big')}</div>`);return;}const wk=weekly();beginGame(UI.nm||(S&&S.name)||randomNetworkName(),wk.city,{scn:wk,seed:wk.seed});},
 pickStart:({city})=>{UI.startCity=city;document.querySelectorAll('.start').forEach(b=>b.classList.toggle('on',b.dataset.city===city));},
 cont:()=>{migrate(S);track('game_continue',true);UI.started=true;closeModal();renderAll();},
 newgame:()=>{try{localStorage.removeItem('sot-save-v1');}catch(e){}S=null;UI.started=false;UI.sel=null;UI.nm=null;$('dash').hidden=true;$('bankBox').hidden=true;renderAll();showTitle();},
 keepPlaying:()=>{closeModal();},
 exportSave:()=>exportSave(),
 importPick:()=>{let f=$('importIn');if(!f){f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.id='importIn';f.hidden=true;document.body.appendChild(f);f.addEventListener('change',()=>{importFile(f.files[0]);f.value='';});}f.click();},
 importGo:()=>{const s0=UI.importing;if(!s0)return;UI.importing=null;const prev=S;try{S=migrate(JSON.parse(JSON.stringify(s0)));compute();checkGoals();renderAll();}catch(e){S=prev;if(S)compute();renderAll();toast(tr('<b>Import failed.</b><br>That save is damaged and could not be loaded. Your current game is untouched.'),'bad');sfx('err');return;}UI.confirm=null;$('bankBox').hidden=true;$('dash').hidden=true;UI.started=true;UI.sel=null;UI.speed=S.uiSpeed===undefined?1:S.uiSpeed;if(S.cam&&isFinite(S.cam.x))Object.assign(cam,S.cam);else{const h=CITY[S.home];if(h){cam.x=h.x;cam.y=h.y;}}closeModal();$('modal').hidden=true;compute();renderAll();save();toast(tr('<b>Welcome back, {name}.</b><br>Imported and saved on this device.',{name:esc(S.name)}),'good');sfx('coin');track('game_import');},
 menu:()=>{if(!S||!UI.started){showTitle();return;}openModal(`<div style="display:flex;align-items:center"><div><div class="eyebrow">AS${S.asn} · ${esc(dateStr(S.day))} · ${tierLabel()}</div><h2 style="font-size:28px">${esc(S.name)}</h2></div><button class="x" data-act="closeModal" aria-label="${tr('Close')}">×</button></div>
  <p class="tagline">${tr('Your game saves itself every few seconds on this device.')}</p>${isPhone()?installRow():''}
  <div class="menu-list">
   ${btn(tr('Back to the map'),'closeModal',{},'pink big')}
   ${btn(tr('Export save <small>download a file</small>'),'exportSave',{},'')}
   ${btn(tr('Import a save <small>from a file</small>'),'importPick',{},'')}
   ${btn(tr('Share your network <small>image card</small>'),'share',{},'')}
   ${btn(tr('Scenarios &amp; weekly challenge'),'scenarios',{},'ghost')}
   ${btn(tr('How to play'),'help',{},'ghost')}
   ${RELEASE_NOTES.length?btn(tr('What’s new in {v}',{v:esc(APP_VERSION)}),'whatsNewShow',{},'ghost'):''}
   ${btn(tr('Settings'),'settings',{},'ghost')}
   ${btn(tr('Start a new network'),'resetAsk',{},'red')}
  </div>${chatHtml()}`);},
 settings:()=>{UI.setOpen=true;openModal(settingsHtml());},
 settingsClose:()=>{UI.setOpen=false;if(!S||!UI.started)showTitle();else closeModal();},
 prefSet:({v})=>{const [k,b]=String(v).split(':');if(!own(PREF_DEF,k))return;setPref(k,b==='1');sfx('click');refreshSettings();},
 vpSet:({v})=>{vpOn(v==='on');refreshSettings();},
 resetAsk:()=>openModal(`<h2 style="font-size:26px">${tr('Start a new network?')}</h2><p class="tagline">${tr('{name} and everything it owns will be deleted. This cannot be undone.',{name:esc(S?S.name:tr('Your network'))})}</p><div class="btns">${btn(tr('Delete and start over'),'newgame',{},'red big')}${btn(tr('Keep playing'),'closeModal',{},'ghost big')}</div>`),
 whatsNewShow:()=>whatsNew(true,true),
 updateNow:()=>{save();location.reload();},
 updateLater:()=>{$('update').hidden=true;UI.updLater=Date.now();},
 helpClose:()=>{if(UI.started)closeModal();else showTitle();},
});
