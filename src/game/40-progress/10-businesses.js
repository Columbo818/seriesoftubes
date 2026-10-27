/* ================= BUSINESSES ================= */
const BIZ_T={
 dia:{l:tr('Enterprise DIA'),opts:[1,2,5,10],rate:600},
 game:{l:tr('Game servers'),opts:[5,10,20,40],rate:120},
 host:{l:tr('Hosting'),opts:[10,20,40,80],rate:60},
 isp:{l:tr('Downstream ISP (buys transit)'),opts:[100,200,400,800],rate:15,lv:2},
 l2vpn:{l:tr('L2VPN circuit'),opts:[1,10,40,100],rate:0,l2:true,km:1,lv:1},
 fabip:{l:tr('Customer on a fabric (transit over an NNI)'),opts:[1,5,10,25],rate:110,nni:true,lv:2},
 fabl2:{l:tr('Fabric circuit to one of your POPs'),opts:[1,5,10],rate:0,l2:true,nni:true,km:0.8,lv:2},
 stream:{l:tr('Streaming startup'),opts:[50,100,200],rate:80,lv:2},
 edu:{l:tr('University network'),opts:[20,50,100],rate:90,lv:2},
 gpu:{l:tr('AI GPU data center'),opts:[200,400,800],rate:70,lv:3,names:['Neural Noodles AI','GPUs R Us','Hallucination Labs','Transformers & Sons','Token Burners Inc.','Very Large Language Co.','Prompt Engineering Ltd','DeepThought Farms','Parameter Pastures','Gradient Descent Diner','Attention Is All We Need LLC','Overfit Analytics']},
 onramp:{l:tr('Cloud on-ramp'),opts:[100,200,400],rate:0,l2:true,km:0.7,lv:3,names:["Amazin' Web Services on-ramp","Microsnoft Azzure on-ramp",'Goggle Cloud on-ramp','AliBubble Cloud on-ramp','Miracle Cloud on-ramp']},
 ai:{l:tr('AI training interconnect'),opts:[400,800,1600],rate:0,l2:true,div:true,km:0.9,lv:4,names:['Skynot Compute','Galaxy Brain Training Run','Megawatt Minds','The Big Model Co.','Infinite Context Corp','Sentient Spreadsheet Inc.']},
 hyper:{l:tr('Hyperscaler DCI'),opts:[1600,3200,6400],rate:0,l2:true,div:true,km:0.5,lv:4,names:["Amazin' Web Services DCI","Microsnoft Azzure DCI",'Goggle Cloud DCI','Faceplant Infra DCI','AliBubble Cloud DCI']},
 hft:{l:tr('High-frequency trading link'),opts:[1,5,10],rate:0,l2:true,lat:true,km:6,lv:2,names:['Flash Boys Capital','Nanosecond Nancy Trading','Speed of Light Securities','Arbitrage & Sons','Front-Run Fund','Microwave Tower Capital','Tick-Tock Quant','Low Latency Larry LLC']},
 bulk:{l:tr('Bulk backup transfer (latency does not matter)'),opts:[100,200,400],rate:0,l2:true,scenic:true,km:0.1,lv:2,names:['Glacier Slow Storage','Tape Backup Tortoise','Scenic Route Archives','Cold Storage Cold Cuts','Sloth Sync','Eventually Consistent Inc.','Snail Mail Data Co.']},
 event:{l:tr('Event network'),opts:[100,200,400,800,1600,3200],rate:0,event:true,lv:2,names:['Carnaval Parade','Diwali Streaming Night','The Big Football Final','NANOG 99','Burning Router Festival','Euro-Pop Song Contest','Formula Ping Grand Prix','The Big Game','Olympic Pings','A Pop Megastar Stadium Tour','LAN Party of the Century','The Keynote (One More Thing)','Gamer-Con Expo','Oktoberfest Livestream']},
 sdwan:{l:tr('SD-WAN for a chain'),opts:[1,2,5,10],rate:0,l2:true,sdwan:true,km:0,lv:2,names:['Kebab Kingdom','Pretzel Palace','Burger Router Inc.','Café Latte-ncy','Hardware Hut Stores','Pharma-See Pharmacies','Bank of Tiny Branches','Supermarket Superhighway','Fitness Pings Gyms','Hotel Hops Group','Doughnut Data Diners']},
 wwave:{l:tr('Wholesale wave'),opts:[1],rate:0,fiber:true,lv:2,names:['Zay-No Fiber','Loomin’ Technologies','Clown Castle Fiber','G&T (Gin and Transit)','A Hyperscaler Who Shall Not Be Named','Megapork','youNetworks']},
 dfpair:{l:tr('Dark fiber pair lease'),opts:[1],rate:0,fiber:true,lv:3,names:['A Hyperscaler Who Shall Not Be Named','Goggle Fiber Division','Faceplant Infra','Amazin’ Backbone Team','A Very Secretive Trading Firm']},
 scrub:{l:tr('DDoS protection + DIA'),opts:[1,5,10,20],rate:900},
 aiwan:{l:tr('AI WAN between two AI factories'),opts:[3200,6400,12800],rate:0,l2:true,div:true,mega:true,km:0.45,lv:4,names:['Fairweather AI WAN','Planet-Scale Superfactory Link','Two Brains One Model Inc.','Distributed Godlike Compute','The Gigawatt Handshake']},
 mtrain:{l:tr('Multi-site training run'),opts:[1600,3200,6400],rate:0,l2:true,sdwan:true,mega:true,lv:4,names:['Gem-in-Eye Ultra Training Run','Frontier Model 9000','The Very Big Model','Checkpoint-Free Training Co.','Model Too Big For One Building']},
 ingest:{l:tr('Dataset ingest (elephant flow)'),opts:[1600,3200,6400],rate:0,event:true,mega:true,lv:3,names:['Scrape-the-Whole-Web Ingest','Checkpoint Sync Storm','Video Dataset Firehose','Every Book Ever (allegedly licensed)','Synthetic Data Tsunami']},
 pairs:{l:tr('Hundreds of fiber pairs'),opts:[1],rate:0,fiber:true,mega:true,lv:4,names:['A Hyperscaler Who Shall Not Be Named','Planet-Scale AI WAN Team','The Fiber-Hungry Giant','Project Very Long Glass']},
 esport:{l:tr('Esports world final'),opts:[400,800,1600,3200],rate:0,event:true,lv:5,names:['League of Lag Finals','Counter-Ping Major','Fortnightly World Cup','Dota Two Many Viewers','Rocket Leak Championship','Street Frighter Evo']},
 sov:{l:tr('Sovereign cloud region'),opts:[400,800,1600],rate:0,l2:true,div:true,km:0.6,lv:6,names:['Gaia-Ex Sovereign Cloud','Bundeswolke (Very Secure)','Le Cloud Souverain','Datenschutz Deluxe','Your Data Stays Here, Probably','A Cloud With a Flag on It','Data Residency Is a State of Mind']},
 cgame:{l:tr('Cloud gaming platform'),opts:[800,1600,3200],rate:45,lv:8,names:['Stadia-ium (Back Again)','GeForce Later','Ping Station Now','Luna-tick Gaming','Shadow of a Doubt Cloud PC','Input Lag Arcade','Bufferbloat Bros. Streaming']},
 metav:{l:tr('Metaverse platform'),opts:[1600,3200,6400],rate:35,lv:9,names:['Meh-taverse','Second Second Life','Horizon Worlds Apart','The Oasis (Ready Player Done)','Legs Finally Shipped Inc.','Decentra-landlocked']},
 agi:{l:tr('AGI lab (allegedly)'),opts:[12800,25600],rate:0,l2:true,div:true,mega:true,km:0.4,lv:11,names:['Almost General Intelligence Inc.','Superintelligence Pending','The Lab That Said Two More Years','Paperclip Maximizer Labs','Deep Thought Two','Benevolent Overlord Research']},
 mars:{l:tr('Mars mission ground station'),opts:[100,200,400],rate:0,l2:true,lat:true,km:4,lv:13,names:['Red Planet Relay','Ares Ground Segment','Olympus Mons Uplink','Mars or Bust Mission Control','Interplanetary Ping Society','Light-Minute Logistics','RFC 1149 Avian Carriers (Mars Division)']},
 provedor:{l:tr('Provedor (small regional ISP)'),opts:[5,10,20,40],rate:20,br:true,names:['Provedor Capivara Net','Fibra do Sertão','Rapidinho Telecom','Net Jabuticaba','Caipirinha Online','Wi-Fi do Zé','Pão de Queijo Fibra','Açaí Net','Tucano Telecom','Forró Fibra','Saci Net','Brigadeiro Banda Larga','Mandioca Online','Churrasco Connect']},
};
const LEVELS=[
 {n:tr('Local ISP'),q:tr('Your network diagram is a photo of a whiteboard.'),req:tr('Start here'),unlock:tr('Enterprises, game servers, hosting, L2VPNs and DDoS protection.')},
 {n:tr('Regional player'),q:tr('You now have a change freeze. Nobody remembers who declared it.'),req:tr('peak 200 Gbps and 3 POPs'),unlock:tr('Downstream ISPs, streaming startups and universities. Gear: Edge Lord 400 routers, dark fiber leases, Rainbow-in-a-Box DWDM, Ackackia 400ZR+ optics.')},
 {n:tr('Serious backbone'),q:tr("It's not DNS. There's no way it's DNS. It was DNS."),req:tr('peak 1 Tbps and 6 POPs'),unlock:tr('AI GPU data centers and cloud on-ramps. Gear: Chonk 800 routers, Sizzle 800ZR+ optics, ROADMaster 9000 line systems, building your own fiber.')},
 {n:tr('Big league'),q:tr('Your MTU is 9000 on every link except the one that matters.'),req:tr('peak 3 Tbps, 10 POPs, 3 continents'),unlock:tr('AI training interconnects and hyperscaler DCI deals in the terabits. Gear: Absolute Unit 1.6T routers, Sienna WaveMagic 1.6T transponders.')},
 {n:tr('Continental carrier'),q:tr('Your NOC has a chat channel called #its-always-the-fiber, and it is always the fiber.'),req:tr('peak 6 Tbps, 15 POPs, 4 continents'),era:1.15,unlock:tr('Esports world finals, and the 4K-everything era: eyeballs in every city want 15% more. Gear: Sonic the Whitebox 64 routers.')},
 {n:tr('Transcontinental'),q:tr('You joined the outages mailing list. Today you are the outage.'),req:tr('peak 9 Tbps and 20 POPs'),unlock:tr('Sovereign cloud regions, and a free PNI with Doitsche Telekomm. Gear: ROADMaster 9000 C+L (128 channels), Disco 8K Ultra routers.')},
 {n:tr('Global backbone'),q:tr("Your ASN now shows up in other people's traceroutes, and in their tickets."),req:tr('peak 12 Tbps, 25 POPs, 5 continents'),unlock:tr('A free PNI with Voda-Phony. Gear: Absolute Unit 3.2T routers, 3.2T ports and 12.8T waves.')},
 {n:tr('Packet empire'),q:tr('Your maintenance window is 2 a.m. in every time zone at once.'),req:tr('peak 16 Tbps and 32 POPs'),era:1.15,unlock:tr('Cloud gaming platforms, and the cloud gaming era: eyeballs want another 15%. A free PNI with Tel-Mess. Gear: Sienna WaveMagic 3.2T transponders.')},
 {n:tr('Six-continent carrier'),q:tr('Somewhere, on every continent, a backhoe is thinking about you.'),req:tr('peak 21 Tbps, 40 POPs, 6 continents'),unlock:tr('Metaverse platforms (it finally took off), and a free PNI with Etis-a-lot. Gear: Arrrhipster 7800R5 routers, 102.4T fabrics for your own exchange.')},
 {n:tr('Backbone of backbones'),q:tr('Your routing table needs its own routing table.'),req:tr('peak 26 Tbps and 50 POPs'),era:1.2,unlock:tr('The VR era: eyeballs want 20% more. A free PNI with China Moble. Gear: Knockia 7950 XRS routers, 100T scrubbing.')},
 {n:tr('Internet weather system'),q:tr('When your BGP sneezes, a small country catches a cold.'),req:tr('peak 33 Tbps and 60 POPs'),unlock:tr('AGI labs (allegedly) wanting AI WANs of 12.8 to 25.6 Tbps, and free PNIs with Du-opoly and Ooh-redoo. Gear: Mikrowtik CCR 3.2T routers.')},
 {n:tr('Too big to route'),q:tr('Your last fat-fingered route leak has its own Wikipedia page.'),req:tr('peak 40 Tbps and 70 POPs'),era:1.25,unlock:tr('The AI agent era: eyeballs want 25% more, because bots now browse the web for people and they never sleep. Gear: eight fiber pairs in your own land trenches.')},
 {n:tr('The Internet'),q:tr('People phone you to ask if the internet is down. You are the internet. Have you tried turning yourself off and on again?'),req:tr('peak 50 Tbps and 80 POPs'),unlock:tr('Mars mission ground stations. Gear: The Router at the End of the Universe.')},
];
// What each level asks for (peak Gbps, POPs, continents). Continents carry over to the levels above.
const LV_REQ=[null,{pk:200,pops:3},{pk:1000,pops:6},{pk:3000,pops:10,reg:3},{pk:6000,pops:15,reg:4},{pk:9000,pops:20},{pk:12000,pops:25,reg:5},{pk:16000,pops:32},{pk:21000,pops:40,reg:6},{pk:26000,pops:50},{pk:33000,pops:60},{pk:40000,pops:70},{pk:50000,pops:80}];
const lvReg=i=>Math.max(0,...LV_REQ.slice(1,i+1).map(q=>q.reg||0));
const lvl=()=>(S&&S.lvl)||1;
// Lower-case just the first word for mid-sentence use, so names like Tel-Mess or AGI keep their capitals.
const lc1=t=>/^[A-Z][a-z]/.test(t)?t[0].toLowerCase()+t.slice(1):t;
function custLevel(){const pops=Object.keys(S.pops).length,pk=S.stats.peak,rc=regionsCount();let lv=1;for(let i=1;i<LV_REQ.length;i++){const q=LV_REQ[i];if(pk>=q.pk&&pops>=q.pops&&rc>=lvReg(i))lv=i+1;else break;}return lv;}
// Traffic eras: some levels bring a new reason to watch more video, and every city's eyeballs grow toward more.
const eraMul=()=>LEVELS.slice(0,lvl()).reduce((a,L)=>a*(L.era||1),1);
const eyeP=c=>CITY[c].P*eraMul();
// New broadband starts small, but never above what the town can grow to (St Helena has 4,500 people).
const bbStart=c=>Math.min(eyeP(c),Math.max(8,CITY[c].P*0.03));
const BIZ_N=['Byte-Size Bakery','Hamster Wheel Power Co.','Llama Logistics','Cloud Nine Hosting','Rural Rabbit Broadband','Tiny Telco','Pixel Pirates Games','Moo-Moo Dairy Corp','Snack Overflow','Git Happens Ltd','Kernel Sanders Fried Code','Lag-Free Llamas','404 Bistro','Ping Pong Sports','Null Pointer Pets','Buffer Bloat Boats','Packet Pizza','Latency Lattes','Ctrl-Alt-Deli','Sudo Sandwiches','Cache Me Outside','Hertz So Good Radio','Jitterbug Dance Hall','Bit Barn Hosting','Fiber Optimists','The Daily Ping','Squirrel Mesh Wireless','Spam & Eggs Diner','Router Rooter Plumbing','Kilobyte Kebab','Gigglebit Studios','Uptime Funk Records','Ohm Sweet Ohm','Dial-Up Nostalgia Club','Two-Factor Tacos'];

