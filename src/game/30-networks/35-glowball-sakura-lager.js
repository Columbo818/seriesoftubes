/* Glowball Sakura Lager: a Tier 2 with a PoP in every city the big content networks reach, except Pitcairn, where no
   provider may sell transit so that you must land your own cable (#124). Not a Tier 1, so it buys transit from three of
   them and resells it, in Australia too (see AU_SELLERS). Open peering and a port on nearly every exchange (the real
   thing lists an open policy and route servers at dozens of IXs). Sits before 40-traffic-shares.js, which indexes NETS. */
NETS.push(
 {id:'gsl',name:'Glowball Sakura Lager',asn:137409,type:'t2',pol:'open',up:['lvl','cog','ntt'],share:.02,price:5,col:'#C94F7C',auIx:['syd','mel','bne','per'],pops:ALLC.filter(c=>c!=='pcn'),ix:'ALL',blurb:tr('glowball_sakura_lager.on_tap_in_every_city_resells')});
/* Its downstreams: networks that buy their transit from it, so a PNI with it reaches them too. Small and mid-size
   networks on every continent, one per line, sorted within each. Kept here rather than in their own entries so the
   whole carrier lives in one file. */
const GSL_DOWN=[
 // Africa
 'art', // Air-Tell Africa
 'mtc', // Dodo Telecom
 'sfc', // Safari-Comic
 'zeo', // Zealot
 // Asia
 'dhr', // Dhiraa-goo
 'ptc', // PTC-hell
 'tru', // Mostly-True Move
 'vtl', // Viet-tell
 // Europe
 'cms', // CityMess
 'dgi', // Digi-tally Cheap
 'fwb', // Fast-Webby
 'nos', // NOS-y Neighbour
 // North America
 'dgc', // Digi-Sell Caribbean
 'pes', // Pessimum
 'snc', // Sonic Boomer
 'wnt', // Whirled Net
 // Oceania
 'abb', // Aussie Boyband
 'lpt', // Frogtel
 'npt', // Neptoon Internet
 'spk', // Spark-le
 // South America
 'ant', // Antelope
 'bsn', // Brisanada
 'mvs', // Moviestar
 'tgo', // Tiger Mobile
];
for(const id of GSL_DOWN){const n=NETS.find(x=>x.id===id);n.up=(n.up||[]).concat('gsl');}
