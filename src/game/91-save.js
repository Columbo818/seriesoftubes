/* ================= SAVE ================= */
function save(){if(!S||S.lost)return;S.uiSpeed=UI.speed;S.cam={x:cam.x,y:cam.y,z:cam.z};try{localStorage.setItem('sot-save-v1',JSON.stringify(S));}catch(e){}UI.lastSave=performance.now();}
// Save whenever the player might be leaving: tab hidden, page closing or reloading.
addEventListener('pagehide',()=>save());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();else checkUpdate();});
/* Export / import: move a network to another device or keep a backup. The file is the same
   object the autosave writes, wrapped with a little metadata. */
function saveFileName(){const d=new Date().toISOString().slice(0,10),n=(S&&S.name||'network').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'network';return `series-of-tubes-${n}-${d}.json`;}
function exportSave(){if(!S)return;save();const blob=new Blob([JSON.stringify({app:'series-of-tubes',version:APP_VERSION,exported:new Date().toISOString(),S},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=saveFileName();document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
  toast(tr('<b>Save exported.</b><br>{file} is in your downloads. Open it on another device with “Import a save”.',{file:esc(saveFileName())}),'good');}
function parseSave(txt){if(typeof txt!=='string')return {err:tr('That file is not valid JSON.')};let j;try{j=JSON.parse(txt);}catch(e){return {err:tr('That file is not valid JSON.')};}
  const s=j&&j.app==='series-of-tubes'&&j.S?j.S:j;
  if(!s||typeof s!=='object'||s.v!==1||typeof s.day!=='number'||typeof s.cash!=='number'||!s.pops||typeof s.pops!=='object'||!Array.isArray(s.links))return {err:tr('That does not look like a Series of Tubes save.')};
  if(s.lost)return {err:tr('That network went bankrupt. It cannot be brought back, only mourned.')};
  for(const c of Object.keys(s.pops))if(!isCity(c))return {err:tr('That save has a POP in a city this version does not know ({city}).',{city:esc(String(c).slice(0,12))})};
  return {s,ver:j.version||'?',name:String(s.name||tr('Unnamed network'))};}
function importFile(file){if(!file)return;if(file.size>8e6){toast(tr('<b>That file is too big to be a save.</b>'),'bad');return;}
  const rd=new FileReader();rd.onload=()=>{const r=parseSave(String(rd.result));if(r.err){toast(tr('<b>Import failed.</b><br>{err}',{err:esc(r.err)}),'bad');sfx('err');return;}
    UI.importing=r.s;openModal(`<div class="eyebrow">${tr('Import a save')}</div><h2 style="font-size:26px">${tr('Load {name}?',{name:esc(r.name)})}</h2><p class="tagline">${esc(dateStr(r.s.day))} · ${tr('{cash} in the bank',{cash:fmt$(r.s.cash)})} · ${trn('{n} POP','{n} POPs',Object.keys(r.s.pops).length)} · ${tr('saved by v{ver}',{ver:esc(r.ver)})}</p>${S&&UI.started&&!S.lost?`<p class="note" style="color:var(--bad)">${tr('This replaces {name}. Export it first if you want to keep it.',{name:esc(S.name)})}</p>`:''}<div class="btns">${btn(tr('Load this network'),'importGo',{},'pink big')}${btn(tr('Cancel'),UI.started?'closeModal':'helpClose',{},'ghost big')}</div>`);};
  rd.readAsText(file);}
function loadSave(){try{const t=localStorage.getItem('sot-save-v1');if(t){const s=JSON.parse(t);if(s&&s.v===1&&!s.lost)return s;}}catch(e){}return null;}

