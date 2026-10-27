function showTitle(){
  const sv=loadSave();
  if(UI.nm==null)UI.nm=randomNetworkName();
  const starts=[['fra',tr('Crossroads of Europe. DE-KICKS IX, cheap transit.')],['nyc',tr('Huge eyeball market. Pricey neighbours.')],['sin',tr('Asia hub. Great peering, far from home.')],['sao',tr('Big hungry market, few providers.')],['syd',tr('Hard mode. Everything overseas costs a fortune, locals pay top dollar, mostly to the Nearly Broadband Network, and everything else is trying to kill you.')]];
  openModal(`<div class="title-art"><svg width="74" height="74" viewBox="0 0 74 74" aria-hidden="true"><path d="M10 60V40c0-14 10-24 24-24h18" fill="none" stroke="#1E2640" stroke-width="16" stroke-linecap="round"/><path d="M10 60V40c0-14 10-24 24-24h18" fill="none" stroke="#FFD23F" stroke-width="9" stroke-linecap="round"/><circle cx="58" cy="16" r="11" fill="#FF4F9A" stroke="#1E2640" stroke-width="4"/><circle cx="21" cy="44" r="3" fill="#fff"/><circle cx="30" cy="27" r="3" fill="#fff"/></svg>
  <h1>Series<br>of <span>Tubes</span></h1></div>
  <p class="tagline">${tr('Build an internet. Lay fiber between cities, buy transit, peer at exchanges, sign up businesses, and keep the eyeballs happy while backhoes, sharks and route leaks do their best to stop you.')}</p>${plugHtml(false)}${isPhone()?installRow():''}
  ${sv?`<div class="btns" style="margin-bottom:6px">${btn(tr('Continue {name} · {date}',{name:esc(sv.name),date:dateStr(sv.day)}),'cont',{},'pink big')}</div>`:''}
  <label class="f" for="nmIn">${tr('Name your network')}</label><div class="network-name"><input class="t" id="nmIn" maxlength="24" value="${esc(UI.nm)}" autocomplete="off">${btn(tr('Another one'),'randomName',{},'ghost sm')}</div>
  <label class="f">${tr('Pick your home city')}</label><div class="starts">${starts.map(([c,d])=>`<button class="start ${UI.startCity===c?'on':''}" data-city="${c}" data-act="pickStart" data-args='{"city":"${c}"}'><b>${CITY[c].name}</b><span>${d}</span></button>`).join('')}</div>
  <label class="f">${tr('Mode')}</label><div class="btns">${[['normal',tr('Normal')],['sandbox',tr('Sandbox')]].map(([m,l])=>`<button class="b sm modeb ${(UI.mode||'normal')===m?'pink':'ghost'}" data-m="${m}" data-act="modeSet" data-args='{"m":"${m}"}'>${l}</button>`).join('')}${btn(tr('Scenarios &amp; weekly challenge →'),'scenarios',{},'sm')}</div>
  <label class="f">${tr('Language')}</label><div class="btns">${segBtns('langSet',LANG,Object.entries(LANGS))}</div>
  <div class="btns cta" style="margin-top:16px;justify-content:space-between;align-items:center">${btn(sv?tr('Start a new network'):tr('Start building'),'start',{},'big')}${btn(tr('How to play'),'help',{},'ghost')}${btn(tr('Import a save'),'importPick',{},'ghost sm')}${btn(tr('Settings'),'settings',{},'ghost sm')}</div><p class="ver">v${APP_VERSION} · <a href="https://github.com/fjaeckel/seriesoftubes" target="_blank" rel="noopener">${tr('Source on GitHub')}</a> · <a href="${SIGNAL}" target="_blank" rel="noopener">${tr('Chat on Signal')}</a> · ${tr('Cookieless stats, no tracking')}</p>`);
  $('nmIn').addEventListener('input',e=>{UI.nm=e.target.value;});
  if(sv){S=migrate(sv);compute();}
}
// "What's new": shown once to returning players after an update, or on demand.
function whatsNew(returning,force){
  if(IS_DEV||!RELEASE_NOTES.length)return false;let seen=null;
  try{seen=localStorage.getItem('sot-seen-version');localStorage.setItem('sot-seen-version',APP_VERSION);}catch(e){}
  if(!force&&(!returning||seen===APP_VERSION))return false;
  openModal(`<div style="display:flex;align-items:center"><div><div class="eyebrow">${tr('Release notes')}</div><h2 style="font-size:28px">${tr('New in Series of Tubes {v}',{v:esc(APP_VERSION)})}</h2></div><button class="x" data-act="${UI.started?'closeModal':'helpClose'}" aria-label="${tr('Close')}">×</button></div>
  ${notesHtml(RELEASE_NOTES,APP_VERSION)}
  ${returning&&S?`<p class="note">${tr('Your network {name} was saved and is waiting for you.',{name:esc(S.name)})}</p>`:''}
  <div class="btns" style="margin-top:12px">${btn(UI.started?tr('Back to my network'):tr('Got it'),UI.started?'closeModal':'helpClose',{},'pink big')}${notesLong(RELEASE_NOTES)?'':`<a class="b ghost" href="https://github.com/fjaeckel/seriesoftubes/blob/main/CHANGELOG.md" target="_blank" rel="noopener">${tr('Full changelog')}</a>`}</div>`);
  return true;}
