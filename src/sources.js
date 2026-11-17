/** Alle bronnen die in het model worden gebruikt (jaar 2026). */
export const sources = [
  {
    id: 'mn2026',
    title: 'Miljoenennota 2026 — Tabel 5 & 6 (inkomsten/uitgaven)',
    publisher: 'Ministerie van Financiën / Rijksfinanciën',
    url: 'https://www.rijksfinancien.nl/miljoenennota/2026',
    usedFor: 'Landelijke totalen inkomsten (€451,4 mld) en uitgaven (€462 mld) en verdeling potjes.',
  },
  {
    id: 'box1',
    title: 'Box 1-tarieven 2026',
    publisher: 'Belastingdienst',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/',
    usedFor: 'Schijven 35,75% / 37,56% / 49,50% en schijfgrenzen €38.883 / €78.426.',
  },
  {
    id: 'ahk',
    title: 'Tabel algemene heffingskorting 2026',
    publisher: 'Belastingdienst',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/algemene_heffingskorting/tabel-algemene-heffingskorting-2026',
    usedFor: 'Max. €3.115; afbouw 6,398% vanaf €29.736.',
  },
  {
    id: 'ak',
    title: 'Tabel arbeidskorting 2026',
    publisher: 'Belastingdienst',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/arbeidskorting/tabel-arbeidskorting-2026',
    usedFor: 'Arbeidskorting o.b.v. arbeidsinkomen (max. €5.685).',
  },
  {
    id: 'sleutel',
    title: 'Fiscale sleuteltabel 2026',
    publisher: 'Rijksoverheid',
    url: 'https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2025/09/16/fiscale-sleuteltabel-2026/Fiscale-sleuteltabel-2026.pdf',
    usedFor: 'Controle kengetallen IB/VPB (o.a. VPB 19% / 25,8%).',
  },
  {
    id: 'zorgtoeslag',
    title: 'Voorwaarden en bedragen zorgtoeslag 2026',
    publisher: 'Dienst Toeslagen / Belastingdienst',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/kan-ik-zorgtoeslag-krijgen',
    usedFor: 'Inkomensgrenzen €40.857 / €51.142 en vermogensgrenzen.',
  },
  {
    id: 'zorgtoeslag-bedragen',
    title: 'Zorgtoeslaghoogte 2026 (max. €129 / €246 p.m.)',
    publisher: 'Zorgwijzer / Consumentenbond (o.b.v. Toeslagen)',
    url: 'https://www.zorgwijzer.nl/faq/zorgtoeslag',
    usedFor: 'Maximale maandbedragen en afbouw vanaf toetsingsinkomen €29.500.',
  },
  {
    id: 'huurtoeslag-wet',
    title: 'Wet op de huurtoeslag (geldend 1 jan 2026)',
    publisher: 'wetten.nl',
    url: 'https://wetten.overheid.nl/BWBR0008659/2026-01-01',
    usedFor: 'Rekenregels basishuur, kwaliteitskortings-/aftoppingsgrenzen en afbouw 27%/22%.',
  },
  {
    id: 'huurtoeslag-regeling',
    title: 'Regeling huurtoeslaggrenzen 2026',
    publisher: 'Staatscourant / VRO',
    url: 'https://zoek.officielebekendmakingen.nl/stcrt-2025-39783.html',
    usedFor: 'IJkpunten €23.425 / €31.500, huurgrens €932,93, aftoppingsgrenzen.',
  },
  {
    id: 'huurtoeslag-params',
    title: 'Huurtoeslagparameters',
    publisher: 'Volkshuisvesting Nederland',
    url: 'https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/inkomensgrenzen-huurprijsgrenzen-en-huurtoeslagparameters/huurtoeslagparameters',
    usedFor: 'Percentages 100% / 65% / 40% en minimum basishuur.',
  },
  {
    id: 'kgb',
    title: 'Wet op het kindgebonden budget (2026)',
    publisher: 'wetten.nl',
    url: 'https://wetten.overheid.nl/BWBR0022751/2026-01-01',
    usedFor: 'Basis €2.580/kind, alleenstaande-ouderverhoging €3.416, afbouw 7,6%.',
  },
  {
    id: 'kinderbijslag',
    title: 'Bedragen kinderbijslag 2026',
    publisher: 'SVB',
    url: 'https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag',
    usedFor: 'Kwartaalbedragen naar leeftijdsklasse (0–5 / 6–11 / 12–17).',
  },
  {
    id: 'duo',
    title: 'Studiefinanciering bedragen hbo/wo 2026',
    publisher: 'DUO',
    url: 'https://www.duo.nl/particulier/studiefinanciering/bedragen.jsp',
    usedFor: 'Basisbeurs uitwonend €324,52 p.m.; wettelijk collegegeld.',
  },
  {
    id: 'vpb',
    title: 'Vennootschapsbelasting — tarieven',
    publisher: 'Belastingdienst',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/vennootschapsbelasting/',
    usedFor: 'VPB 19% tot €200.000 winst; 25,8% daarboven (vereenvoudigd in model).',
  },
]

export const modelDisclaimer =
  'Dit is een openbaar educatief model voor 2026. Het volgt gepubliceerde kengetallen, maar is geen Belastingdienst-/Toeslagen-engine: vermogen, aftrekposten, toeslagpartner-details en kinderopvangtoeslag zijn vereenvoudigd of weggelaten. Definitieve rechten stelt de overheid vast.'
