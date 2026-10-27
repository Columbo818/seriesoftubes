function renderHint(){
  const hn=$('hint');if(!S||UI.hintOff||(S.tut!==undefined&&S.tut!==null)||(innerWidth<760&&(UI.sel||UI.leftOpen)&&!(UI.drag&&UI.drag.mode==='link'))){hn.hidden=true;return;}
  let t='';
  if(UI.drag&&UI.drag.mode==='link')t=UI.snap?tr('Release to plan a link'):tr('Drag onto another city');
  else if(!S.links.length&&S.done.tr)t=tr('Tip: drag from your pink router to another city to lay fiber');
  else if(!S.done.bb)t=tr('Tap your city, then Launch broadband');
  hn.textContent=t;hn.hidden=!t;
}

