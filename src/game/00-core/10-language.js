/* ================= LANGUAGE =================
   English is the source text: tr(text,vars) looks it up in the dictionary that
   site/i18n/<lang>.js registered and falls back to the English. trn() picks the singular or plural
   form first; N_() only marks text that doubles as an id, so it can be translated where it is shown. */
// English when the dictionary did not load (offline, or a copy without the i18n folder).
const LANGS=window.SOT_LANGS,LANG=window.I18N?.[window.SOT_LANG]?window.SOT_LANG:'en';
document.documentElement.lang=LANG;
const DICT=Object.assign(Object.create(null),window.I18N?.[LANG]);
function tr(s,v){const o=DICT[s]||s;return v?o.replace(/\{(\w+)\}/g,(m,k)=>k in v?v[k]:m):o;}
function trn(one,other,n,v){return tr(n===1?one:other,{n,...v});}
function N_(s){return s;}
