/* ================= GOALS ================= */
const GOALS=[
 {id:'bb',t:tr('Light up your first customers'),d:tr('Open your home city and press “Launch broadband”. Eyeballs are people at home watching cat videos. They pay you every month.'),r:5000,ok:()=>Object.values(S.pops).some(p=>p.bb)},
 {id:'tr',t:tr('Reach the whole internet'),d:tr('Your eyeballs want everything. Buy IP transit from a Tier 1 or Tier 2 in your city. Transit gives you the full routing table.'),r:5000,ok:()=>S.transit.length>0},
 {id:'ix',t:tr('Join an Internet Exchange'),d:tr('Get a port at an IX: a big shared switch where networks swap traffic for free instead of paying transit.'),r:7500,ok:()=>Object.keys(S.ixp).length>0},
 {id:'p5',t:tr('Make 5 peering friends'),d:tr('On the Peering tab, request sessions, or join the route server to peer with every open network at once.'),r:10000,ok:()=>R.sessions>=5},
 {id:'ln',t:tr('Lay your first fiber'),d:tr('Drag from your pink router to another city. Short hops are cheap. Oceans are not.'),r:10000,ok:()=>S.links.length>0},
 {id:'bz',t:tr('Sign a business customer'),d:tr('Businesses show up with a $ bubble. You need a POP in their city. Check the Deals tab.'),r:12500,ok:()=>S.biz.some(b=>!b.scripted)},
 {id:'rd',t:tr('Survive a failure'),d:tr('Things break all the time. Build a second path or a second upstream so traffic reroutes when something dies.'),r:12500,ok:()=>S.stats.survived>0},
 {id:'ca',t:tr('Host an embedded cache'),d:tr('Big CDNs give you free cache boxes once you send them enough traffic. Free bandwidth, just add power.'),r:12500,ok:()=>S.caches.length>0},
 {id:'pn',t:tr('Set up a PNI'),d:tr('A private cross-connect to one network in the same data center, for when traffic outgrows the IX.'),r:15000,ok:()=>S.pni.some(pniOn)},
 {id:'scrub',t:tr('Stand up DDoS defences'),d:tr('Build a scrubbing center from a POP\'s Infra tab. It cleans attacks up to its capacity and lets you sell DDoS protection.'),r:20000,ok:()=>hasScrub()},
 {id:'c3',t:tr('Go global'),d:tr('Have POPs on 3 continents. Subsea cables cost a fortune, so plan the route.'),r:50000,ok:()=>regionsCount()>=3},
 {id:'t2',t:tr('Become a Tier 2'),d:tr('5+ POPs, ports on 3+ IXs and 15+ peering sessions.'),r:50000,ok:()=>isTier2()},
 {id:'tb',t:tr('Serve 1 Tbps'),d:tr('A terabit per second of happy traffic.'),r:75000,ok:()=>R.served>=1000},
 {id:'df',t:tr('Light your own dark fiber'),d:tr('Lease or dig dark fiber, put a DWDM system on it and light a channel. Cheaper per bit than waves, once it works.'),r:40000,ok:()=>S.links.some(l=>l.kind==='df'&&dfCap(l)>0)},
 {id:'m2',t:tr('Be in two buildings at once'),d:tr('Add a second site in a metro from the Infra tab, so one power cut no longer takes the whole city dark.'),r:30000,ok:()=>Object.values(S.pops).some(p=>p.site2)},
 {id:'c5',t:tr('Five continents'),d:tr('POPs in five of the six regions on the map.'),r:100000,ok:()=>regionsCount()>=5},
 {id:'gi',t:tr('Sign a giant'),d:tr('Land an AI WAN, a multi-site training run or a fiber-pairs deal with a hyperscaler. Customer level 4 and a POP near their campus required.'),r:150000,ok:()=>S.biz.some(b=>BIZ_T[b.type]&&BIZ_T[b.type].mega&&!BIZ_T[b.type].event)},
 {id:'t10',t:tr('Serve 10 Tbps'),d:tr('Ten terabits per second of happy traffic. The giants will notice.'),r:250000,ok:()=>R.served>=10000},
 {id:'t1',t:tr('Go transit-free: Tier 1!'),d:tr('Peer with every Tier 1 over PNIs and cancel every transit port. Then nobody charges you to reach the internet.'),r:0,win:true,ok:()=>isTier1()},
];

