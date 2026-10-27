Object.assign(ACT,{
 teEdit:()=>{if(!S.te)return;UI.teDraft=undefined;teModal();},
 teClose:()=>{const t=$('teSrc');if(t)UI.teDraft=t.value;closeModal();},
 teOpt:()=>{UI.teDraft=teOptimize();teModal();},
 teExample:()=>{UI.teDraft=TE_EXAMPLE;teModal();},
 teSlop:()=>{const t0=performance.now(),a=aiSlop(Math.random()<0.02),secs=Math.max(0.1,(performance.now()-t0)/1000);UI.teDraft=UI.slop=a.src;teModal(`<p class="note aisay">🤖 <b>${esc(a.ai)}</b> <small>${tr('thought for {s} seconds',{s:secs.toFixed(1)})}</small><br>${tr(a.say)}</p>`);sfx('build');},
 teHelp:()=>{const t=$('teSrc');if(t)UI.teDraft=t.value;teHelpModal();},
 teBack:()=>teModal(),
 teRecipe:({id})=>{const r=TE_RECIPES.find(x=>x.id===id);if(!r)return;UI.teDraft=r.src().join('\n');teModal(`<p class="note">${tr('Loaded {name}. Check it, then deploy.',{name:tr(r.n)})}</p>`);},
 teClear:()=>{S.te.script='';UI.teDraft=undefined;TE_CACHE={src:null,p:null};after();teModal(`<p class="note">${tr('Script removed. Plain Auto-TE is back in charge.')}</p>`);},
 teCheck:()=>{const t=$('teSrc');const src=t?t.value:'';UI.teDraft=src;const p=teParse(src);if(p.errors.length){teModal(`<pre class="term err">${esc(p.errors.join('\n'))}</pre>`);return;}const r=teTrial(src);teModal(`<pre class="term">${esc(trn('✓ {n} rule OK','✓ {n} rules OK',p.n)+'\n'+tr('served     {a} → {b}',{a:fmtG(r.before.served),b:fmtG(r.after.served)})+'\n'+tr('transit    {a}/mo → {b}/mo',{a:fmt$(r.before.tc),b:fmt$(r.after.tc)})+'\n'+tr('spilled    {g} onto alternate paths',{g:fmtG(r.after.moved)})+(r.after.bh?'\n'+tr('blackholed {g}',{g:fmtG(r.after.bh)}):''))}</pre>`);},
 teDeploy:()=>{const t=$('teSrc');const src=(t?t.value:'').slice(0,4000);UI.teDraft=src;const p=teParse(src);if(p.errors.length){teModal(`<pre class="term err">${esc(tr('commit failed')+'\n'+p.errors.join('\n'))}</pre>`);sfx('err');return;}const r=teTrial(src);S.te.script=src;S.te.on=true;TE_CACHE={src:null,p:null};UI.teDraft=undefined;after();
   const drop=r.before.served>1?1-r.after.served/r.before.served:0,saved=r.before.tc>0?1-r.after.tc/r.before.tc:0;
   if(drop>0.1&&UI.slop===src){if(drop>0.3)S.stats.fat=1;toast(tr('<b>Commit complete. Traffic down {p}.</b><br>The AI apologises for the confusion, and remains completely sure the script was right. Fix it from the NOC tab.',{p:pct(drop)}),'bad');sfx('alert');}
   else if(drop>0.3){S.stats.fat=1;toast(tr('<b>Commit complete. Traffic down {p}.</b><br>You just fat-fingered your own network. Classic. Fix the script from the NOC tab.',{p:pct(drop)}),'bad');sfx('alert');}
   else{if(saved>0.1&&drop<0.01)S.stats.kiddie=1;toast(`<b>${tr('Commit complete.')}</b><br>${saved>0.01?trn('{n} rule live, transit bill down {p}.','{n} rules live, transit bill down {p}.',p.n,{p:pct(saved)}):trn('{n} rule live.','{n} rules live.',p.n)}`,'good');sfx('build');}closeModal();UI.slop=undefined;checkGoals();},
 buyTE:()=>{if(S.te)return;if(lvl()<3){toast(tr('<b>Auto-TE unlocks at customer level 3.</b>'),'bad');sfx('err');return;}if(!spend(TE_COST))return;S.te={on:true,day:S.day};toast(tr('<b>Auto-TE is live.</b><br>The controller now pushes overflow onto alternate paths whenever the shortest one is full.'),'good');after();},
 teToggle:()=>{if(!S.te)return;S.te.on=!S.te.on;after();},
 trace:({city})=>traceModal(city),
 traceRun:()=>{const f=$('trFrom'),t=$('trTo');traceModal(f&&f.value,t&&t.value);},
 traceCopy:()=>{try{navigator.clipboard.writeText(UI.trText||'');toast(tr('<b>Copied.</b> Paste it into your favourite NOC chat.'),'good');}catch(e){}},
 share:()=>shareModal(),
 shareDl:()=>shareFile(f=>{if(!f)return;const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);track('share_download');}),
 shareGo:()=>shareFile(f=>{const d={title:'Series of Tubes',text:tr('{name} (AS{asn}): {tier}, {peak} peak. Build your own internet at',{name:S.name,asn:S.asn,tier:tierLabel(),peak:fmtG(S.stats.peak||0)}),url:'https://seriesoftub.es/'};try{if(f&&navigator.canShare&&navigator.canShare({files:[f]}))d.files=[f];navigator.share(d).then(()=>track('share_done')).catch(()=>{});}catch(e){}}),
 confGo:({key})=>{S.confReg=S.confReg||{};if(S.confReg[key])return;const cf=upcomingConfs(75).find(x=>x.key===key);if(!cf||cf.day<=S.day)return;if(!spend(CONF_COST))return;S.confReg[key]=true;toast(tr('<b>Registered.</b><br>Flights booked, badge printed, business cards ordered in the wrong font.'),'good');after();},
 tutSkip:()=>{S.tut=null;try{localStorage.setItem('sot-tut','1');}catch(e){}renderCoach();},
});
