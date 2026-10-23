# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org/). Each release is deployed to
[seriesoftub.es](https://seriesoftub.es).

## [Unreleased]

- Auto-TE: from customer level 3 you can install a traffic-engineering
  controller in the NOC tab. When the shortest path is full, the overflow
  spills onto up to two alternate paths with free capacity instead of being
  dropped. Without it, traffic still reroutes around failures, but a full
  link stays full, just like a real IGP.

## [1.6.0] — 2026-10-23

- South America is on the map properly: Fortaleza, Rio de Janeiro, Buenos
  Aires, Santiago, Lima, Bogotá and Panama City, with new cables including a
  ring round Cape Horn, a direct São Paulo–New York cable and the first
  cable from Chile to Sydney. Nothing crosses the Darién Gap by land, transit
  is pricier because so much traffic hairpins through Miami, and fiber over
  the Andes costs double and breaks often. IX.brrr is run by a nonprofit
  with cheap public prices, and small Brazilian provedores now buy transit
  from you.
- More India: Delhi, Chennai, Bengaluru and Hyderabad, with east-coast cables
  to Singapore and a lot of road widening.
- Taiwan: Taipei, with cables to Tokyo, Hong Kong, Los Angeles, Seattle and
  Shanghai, and ships that keep dragging their anchors over them.
- The UAE: Abu Dhabi and Fujairah join Dubai. Only the licensed duopoly may
  run fiber inside the country, so there is no dark fiber, waves cost 3×, and
  POPs need a free-zone license. Most cables land in Fujairah.
- Cape Town, with Atlantic cables up the west coast of Africa and load
  shedding: bring a generator.
- New local networks: Clarovision, Vivo-ish, Mercado Livre-ly, Jio-graphy,
  Airtel-tale, Chunghwa Tele-calm and do-ish.
- Metro diversity: add a second data center in any POP's metro from the
  Infra tab, joined by your own metro ring. A power cut, cleaner or A/C
  failure then only takes out half the city. You choose which site each
  transit, PNI and IX port plugs into, and metro ring cuts can cut site B
  off. Some hyperscaler and AI customers now insist on two sites.
- More Asia-Pacific: Melbourne, Brisbane, Darwin, Osaka, Kuala Lumpur,
  Bangkok, Ho Chi Minh City, Karachi, Dhaka and Colombo, with cables to match.
  Vietnam's cables break a lot, and Darwin has crocodiles.
- Central and Eastern Europe: Warsaw, Prague, Vienna, Budapest, Bucharest,
  Tallinn and Istanbul. Baltic cables meet a lot of anchors.
- The giants: at customer levels 3 and 4, hyperscalers and AI clouds bring
  deals only they would ask for. Terabit AI WANs between gigawatt campuses,
  training runs spread over three or four sites, week-long dataset ingests,
  and hundreds of fiber pairs in a trench you dug yourself. Their campuses,
  from Star-Gait Abilene to the Johor-ish Overflow, show up in each city's
  "Who's here".
- Dark fiber pairs you lease out now earn even before you light your own
  channels on that fiber.
- More local networks: KD-DIY, Opt-Out-Us, Mostly-True Move, Viet-tell,
  PTC-hell, Telekom Ma-lazy-sia, Türk Tele-komik, Digi-tally Cheap and
  UPC-You-Later.
- Badges: 30 achievements from common to legendary, shown under your goals.
  Some take luck (Shark Bait), some take years (Five Nines, Speedrun), and a
  couple are secret. Badges from earlier games stay on this device in a hall
  of fame.
- Five new goals between Tier 2 and Tier 1: light your own dark fiber, be in
  two buildings at once, five continents, sign a giant, and serve 10 Tbps.
- Tap your network's name in the top left for a menu to export or import a
  save, or start a new network.

## [1.5.0] — 2026-10-23

- Several transits in the same city now share the load instead of filling one
  after the other. The same goes for any exits that are equally close: traffic
  is spread by free capacity, and local exits still win over far ones (#4).
- Export your save to a file and import it on another device, from the help
  screen or the title screen (#5).
- Full transit ports, IX ports, PNIs, caches and routers are now easy to spot.
  They get red badges on the map (T, P, C, R), the IX hexagon blinks red when
  its port is full, and the NOC lists everything running hot with a hint on
  what to do (#6).
- Some routers take forever to boot. The Infra tab shows each chassis's boot
  time and its forwarding chip, including the Junipurr PacketOinker™ in the
  Chonk 800 and two of them in the Absolute Unit. On a slow booter, crashes
  last a few days longer, a rush repair still needs a day of booting, and
  swapping the only router takes three days. Bigger chassis are slow more
  often. A second router hides all of it.

## [1.4.0] — 2026-10-23

- Big peers have moods now. In some cities, large selective networks refuse
  new peering for a few months, or only take PNIs there, each with a reason
  ("the peering coordinator is on sabbatical", "a new VP wants to monetise
  interconnection"). Now and then they also tear down a session you already
  had, and traffic falls back to your next best path. Try another city or a
  PNI, and ask again later.
- Remote peering is still on offer, but it is now a last resort. Ports come
  through a reseller at 1.5× the price and only 80% of the port is really
  yours. Goggle, Faceplant, Comecast and several other selective networks
  refuse remote members outright. The route server still gets you every open
  network, and building a real POP removes all of this.
- DE-KICKS Group (Frankfurt, Madrid, Marseille, Dubai, Mumbai and New York)
  really hates open pricing. There is no price list, only a personalised
  quote that grows with how big you look. Haggling can get you a discount,
  raise the price "after consulting with management", or stall for a week
  behind an NDA. Prices are "harmonised" upwards once a year. Add-ons like
  Route Server Gold and Premium Port LEDs appear on your invoice until you opt
  out, which takes two clicks. Trying to leave gets you a retention discount
  that ends with a loyalty fee.

## [1.3.0] — 2026-10-23

- Event networks: festivals, trade fairs and big games book a fat temporary
  pipe in a city weeks ahead. Nothing is paid up front; deliver the bandwidth
  for the whole event and you get the full fee, fall short and the organisers
  pay less, fail badly and you pay them.
- SD-WAN for chains: kebab empires, coffee franchises and furniture giants
  want every shop wired back to their head office. Each site needs a path to
  the hub, and one dead spoke takes the whole contract down until it is fixed.
- Wholesale waves: once you light your own dark fiber, other carriers ask to
  rent spare spectrum on it as alien waves. Every slot you sell is one fewer
  channel for you.
- Dark fiber pair leases: fiber you built yourself can be leased out pair by
  pair to others for steady monthly money.

## [1.2.0] — 2026-10-23

- A bank: tap your cash to open it. Lenders (Goldman Sacks, Deutsche Bankrupt,
  Spätzle-Sparkasse, the Ministry of Tubes, Crypto Bros Capital, Venture
  Vultures, the Loan Shark and more) make offers with odd conditions. Offers
  come faster when you are in the red, so a bad hour no longer has to end in
  bankruptcy. Credit ratings, penalties for broken conditions, early repayment.
- Your game now saves every few seconds and whenever you leave the page, and a
  reload drops you straight back into your network.
- Release announcements: a "What's new" card after an update, and a banner with
  a one-click reload when a new version comes out while you are playing.
- Start a new network any time from the help screen.

## [1.1.0] — 2026-10-23

- Stuttgart, home of the Spätzle-IX.

## [1.0.0] — 2026-10-23

First public release.

- Cartoon world map with real-ish geography, magnified Europe and East Asia,
  about 50 cities and around 40 named subsea cable systems.
- POPs, home broadband, business customers with escalating customer levels
  (up to AI training interconnects and hyperscaler DCI) and quirky requirements.
- IP transit on 95th-percentile billing, IXs with route servers, peering
  policies, PNIs, embedded caches, NNI fabrics and remote peering.
- Leased waves, parallel links in shared or diverse trenches, dark fiber
  (lease or build) with DWDM line systems, amplifiers and ZR+/transponder optics.
- Router generations from 100G to 1.6T ports, extra routers and generators for
  redundancy.
- LAGs: bundle up to 8 identical ports to the same transit provider, IX or PNI.
- Traffic engineering: per-link traffic breakdown, link metrics, egress
  preferences, latency-aware and scenic routing.
- Mainland China (licenses, the Great Firewall, premium routes via Hong Kong),
  Russia (government boxes, throttling, sovereign internet drills) and an
  underserved Asian market.
- Dozens of failure types and geopolitical events, a NOC with an event log, and
  a NOC dashboard with traffic, money and per-ASN graphs.
- Cookieless Ridiculytics analytics on the live site only.
