/**
 * Bron totalen: Miljoenennota 2026 — Tabel 5 & 6
 * https://www.rijksfinancien.nl/miljoenennota/2026
 *
 * Top-inkomsten: samengevoegd tot ~6 leesbare bronnen (som ≈ 451,4 mld).
 * Uitgaven: top-potten o.b.v. Tabel 5 / ministeries (som = 462 mld).
 */

export const BUDGET_YEAR = 2026

export const budgetSource = {
  title: 'Miljoenennota 2026',
  publisher: 'Ministerie van Financiën',
  url: 'https://www.rijksfinancien.nl/miljoenennota/2026',
}

export const officialExpenditureTotalMld = 462
export const officialRevenueTotalMld = 451.4

/** Top inkomstenbronnen (mld €). */
export const revenueStreams = [
  {
    id: 'loon_premies',
    label: 'Loonheffing & premies',
    mld: 267.8,
    color: '#1F7A6C',
    hint: 'Loon-/inkomstenheffing + volks- & werknemerspremies (incl. Zvw)',
    detail:
      'Grootste inkomstenbron van het Rijk (MN 2026). Jouw bedrag is een modelschatting o.b.v. bruto inkomen (schijven + premies).',
  },
  {
    id: 'btw',
    label: 'BTW (omzetbelasting)',
    mld: 76,
    color: '#2F6B9A',
    hint: 'Belasting op consumptie',
    detail:
      'Officieel onderdeel van de belastingontvangsten. Jouw BTW is geschat o.b.v. consumptie/huur — niet je aanslag.',
  },
  {
    id: 'vpb',
    label: 'Vennootschapsbelasting',
    mld: 42,
    color: '#C47A2C',
    hint: 'Winstbelasting bedrijven',
    detail:
      'Relevant bij een BV. Modelschatting: ~19% over ingevulde winst (vereenvoudigd).',
  },
  {
    id: 'accijns_invoer',
    label: 'Accijnzen & invoer',
    mld: 19,
    color: '#8A5A3A',
    hint: 'Brandstof, tabak, alcohol, douane/heffingen',
    detail:
      'Accijnzen + invoer-/grensheffingen in de MN-totalen. Jouw deel is een grove schatting gekoppeld aan inkomen/verbruik.',
  },
  {
    id: 'dividend',
    label: 'Dividendbelasting',
    mld: 7,
    color: '#6B3A4A',
    hint: 'Op uitgekeerde winst',
    detail:
      'Vooral bij DGA/aandeelhouders. Model: ~15% over ingevuld dividend.',
  },
  {
    id: 'overig_ink',
    label: 'Overige belastingen',
    mld: 39.6,
    color: '#6B7280',
    hint: 'O.a. overdracht, motorrijtuigen, rest',
    detail:
      'Restcategorie binnen de MN-belastingontvangsten (o.a. overdracht, MRB). Jouw deel is indicatief.',
  },
]

/** Top uitgaven / ministerie-achtige potten (mld €). */
export const spendStreams = [
  {
    id: 'zorg',
    label: 'VWS · Zorg',
    mld: 115,
    color: '#1F7A6C',
    hint: 'Zorguitgaven (Zvw, Wlz e.d.)',
    detail:
      'MN 2026: circa €115 mld. Jouw deel = jouw totale belasting × (115 ÷ 462). Dat is wat jij meebetaalt aan de zorgpot — niet wat je aan zorg terugkrijgt.',
  },
  {
    id: 'sociale',
    label: 'SZW · Sociale zekerheid',
    mld: 116,
    color: '#2F6B9A',
    hint: 'AOW, WW, bijstand, toeslagen, kinderopvang',
    detail:
      'MN 2026: circa €116 mld. Inclusief AOW en toeslagen. Jouw bijdrage is een evenredig stukje van wat jij aan belasting/premies afdroeg.',
  },
  {
    id: 'ocw',
    label: 'OCW · Onderwijs',
    mld: 55,
    color: '#C47A2C',
    hint: 'Onderwijs, cultuur en wetenschap',
    detail:
      'MN 2026: circa €55 mld voor OCW. Jouw meebetalen aan scholen/hogescholen/universiteiten volgt uit het aandeel van jouw belasting in dit potje.',
  },
  {
    id: 'bzk_gemeenten',
    label: 'Gemeenten & provincies',
    mld: 51,
    color: '#4A7C59',
    hint: 'Gemeente- en Provinciefonds',
    detail:
      'MN 2026: circa €51 mld via Gemeente- en Provinciefonds. Lokale voorzieningen (o.a. jeugd, Wmo-deel, infra lokaal) — jouw evenredige bijdrage.',
  },
  {
    id: 'defensie',
    label: 'Defensie',
    mld: 24,
    color: '#5C4A3A',
    hint: 'Incl. Defensiematerieelbegrotingsfonds',
    detail:
      'MN 2026: circa €24 mld (incl. DMF). Jouw bijdrage aan defensie = jouw belasting × (24 ÷ 462).',
  },
  {
    id: 'overig_uit',
    label: 'Overige ministeries',
    mld: 101,
    color: '#6B7280',
    hint: 'JenV, IenW, BZ, klimaat, asiel, financiën, …',
    detail:
      'Rest tot €462 mld: o.a. Justitie & Veiligheid, Infrastructuur, Buitenlandse Zaken, klimaat, asiel. Jouw aandeel is evenredig verdeeld.',
  },
]

/** Verdeel betaalde belasting naar uitgavenpotjes (MN-verhoudingen). */
export function allocatePaidToSpend(paidTotal) {
  const out = {}
  for (const s of spendStreams) {
    out[s.id] = Math.round((paidTotal * s.mld) / officialExpenditureTotalMld)
  }
  return out
}

/**
 * Persona-inputs: de rekenbasis die je ziet én kunt aanpassen.
 * paid/received worden hieruit afgeleid (simpel model).
 */
export const personas = [
  {
    id: 'student',
    name: 'Student',
    short: 'Uitwonend, bijbaan',
    rank: 18,
    tagline: 'Lage belastingdruk, wél beurs, OV en vaak huurtoeslag.',
    inputs: {
      brutoJaar: 9200,
      huurMaand: 550,
      uitwonendeBeurs: 439.20 * 12,
      ovStudenten: 1200,
      zorgtoeslagJaar: 1480,
      huurtoeslagJaar: 2400,
      collegegeld: 2530,
      isOndernemer: false,
      winstBv: 0,
      dividend: 0,
    },
  },
  {
    id: 'moeder',
    name: 'Alleenstaande ouder',
    short: 'Parttime + kind',
    rank: 34,
    tagline: 'Betaalt mee — en kan netto méér terugkrijgen via toeslagen.',
    inputs: {
      brutoJaar: 28600,
      huurMaand: 780,
      uitwonendeBeurs: 0,
      ovStudenten: 0,
      zorgtoeslagJaar: 1200,
      huurtoeslagJaar: 2600,
      collegegeld: 0,
      kindBudget: 3400,
      kinderopvang: 4200,
      isOndernemer: false,
      winstBv: 0,
      dividend: 0,
    },
  },
  {
    id: 'modaal',
    name: 'Modaal huishouden',
    short: 'Twee verdieners',
    rank: 58,
    tagline: 'Stevige loonheffing; weinig toeslagen.',
    inputs: {
      brutoJaar: 78000,
      huurMaand: 1100,
      uitwonendeBeurs: 0,
      ovStudenten: 0,
      zorgtoeslagJaar: 0,
      huurtoeslagJaar: 0,
      collegegeld: 0,
      kindBudget: 2400,
      kinderopvang: 0,
      isOndernemer: false,
      winstBv: 0,
      dividend: 0,
    },
  },
  {
    id: 'ondernemer',
    name: 'Ondernemer (BV)',
    short: 'DGA + dividend',
    rank: 72,
    tagline: 'Ook VPB en dividendbelasting, niet alleen loonheffing.',
    inputs: {
      brutoJaar: 52000,
      huurMaand: 1400,
      uitwonendeBeurs: 0,
      ovStudenten: 0,
      zorgtoeslagJaar: 0,
      huurtoeslagJaar: 0,
      collegegeld: 0,
      kindBudget: 0,
      kinderopvang: 0,
      isOndernemer: true,
      winstBv: 45000,
      dividend: 20000,
    },
  },
  {
    id: 'bovenmodaal',
    name: 'Bovenmodaal duo',
    short: 'Hoog inkomen',
    rank: 89,
    tagline: 'Hoge inleg, nauwelijks toeslagen.',
    inputs: {
      brutoJaar: 148000,
      huurMaand: 1600,
      uitwonendeBeurs: 0,
      ovStudenten: 0,
      zorgtoeslagJaar: 0,
      huurtoeslagJaar: 0,
      collegegeld: 0,
      kindBudget: 0,
      kinderopvang: 0,
      isOndernemer: false,
      winstBv: 0,
      dividend: 2000,
    },
  },
]

/** Simpel, uitlegbaar model — geen Belastingdienst-engine. */
export function computeFromInputs(inputs) {
  const bruto = Number(inputs.brutoJaar) || 0
  const huurJaar = (Number(inputs.huurMaand) || 0) * 12

  // Ruwe progressieve schets loonheffing + premies
  let loonPremies = 0
  if (bruto > 0) {
    const schijf1 = Math.min(bruto, 38000) * 0.18
    const schijf2 = Math.min(Math.max(bruto - 38000, 0), 37000) * 0.32
    const schijf3 = Math.max(bruto - 75000, 0) * 0.42
    loonPremies = Math.max(0, schijf1 + schijf2 + schijf3 - 2200)
  }

  const btw = Math.round(huurJaar * 0.05 + Math.max(bruto, 8000) * 0.08)
  const accijnsInvoer = Math.round(180 + bruto * 0.004)
  const overigInk = Math.round(120 + bruto * 0.003)

  const vpb = inputs.isOndernemer
    ? Math.round(Math.max(0, (Number(inputs.winstBv) || 0) * 0.19))
    : 0
  const dividendBel =
    Math.round(Math.max(0, (Number(inputs.dividend) || 0) * 0.15)) +
    (inputs.isOndernemer ? Math.round(Math.max(0, (Number(inputs.dividend) || 0) * 0.0)) : 0)

  const paid = {
    loon_premies: Math.round(loonPremies),
    btw,
    vpb,
    accijns_invoer: accijnsInvoer,
    dividend: dividendBel,
    overig_ink: overigInk,
  }

  const beurs = Number(inputs.uitwonendeBeurs) || 0
  const ov = Number(inputs.ovStudenten) || 0
  const zorgtoeslag = Number(inputs.zorgtoeslagJaar) || 0
  const huurtoeslag = Number(inputs.huurtoeslagJaar) || 0
  const kind = Number(inputs.kindBudget) || 0
  const kop = Number(inputs.kinderopvang) || 0
  const college = Number(inputs.collegegeld) || 0

  /**
   * Wat je “terugkrijgt”: toeslagen + waarde van publieke voorzieningen.
   * Onderwijs: niet alleen collegegeld — PO/VO/HO kosten de samenleving veel
   * meer (indicatieve jaarkosten o.b.v. publieke bekostiging).
   */
  const benefits = []

  if (huurtoeslag > 0) {
    benefits.push({
      id: 'huurtoeslag',
      label: 'Huurtoeslag',
      amount: huurtoeslag,
      color: '#2F6B9A',
      tip: 'Directe toeslag via de Belastingdienst / Toeslagen.',
    })
  }
  if (zorgtoeslag > 0) {
    benefits.push({
      id: 'zorgtoeslag',
      label: 'Zorgtoeslag',
      amount: zorgtoeslag,
      color: '#1F7A6C',
      tip: 'Bijdrage in de zorgpremie bij lager inkomen.',
    })
  }
  if (beurs > 0) {
    benefits.push({
      id: 'beurs',
      label: 'Uitwonende basisbeurs',
      amount: Math.round(beurs),
      color: '#C47A2C',
      tip: 'Studiefinanciering (DUO) — cash-inkomen uit de collectieve pot.',
    })
  }
  if (ov > 0) {
    benefits.push({
      id: 'ov',
      label: 'OV-studentenreisproduct',
      amount: ov,
      color: '#4A7C59',
      tip: 'Waarde van het studenten-OV, bekostigd via OCW/mobiliteit.',
    })
  }
  if (kind > 0) {
    benefits.push({
      id: 'kind',
      label: 'Kinderbijslag / kindgebonden budget',
      amount: kind,
      color: '#2F6B9A',
      tip: 'Gezinsondersteuning via SZW.',
    })
  }
  if (kop > 0) {
    benefits.push({
      id: 'kop',
      label: 'Kinderopvangtoeslag',
      amount: kop,
      color: '#6B3A4A',
      tip: 'Vergoeding kinderopvang — vaak een groot deel van de kosten.',
    })
  }

  // Publiek onderwijs (imputed): student in HO / kind in PO-VO
  if (college > 0) {
    const hoPubliek = 9800 // ruwe publieke bekostiging per student per jaar
    benefits.push({
      id: 'ho',
      label: 'Publiek bekostigd hoger onderwijs',
      amount: hoPubliek,
      color: '#C47A2C',
      tip: `Indicatie: de samenleving steekt ±€${hoPubliek.toLocaleString('nl-NL')} per student/jaar in HO — naast jouw collegegeld van ${euro(college)}.`,
    })
  }
  if (kind > 0 || kop > 0) {
    const poVo = 8600 // ruwe bekostiging basisschool/VO per kind/jaar
    benefits.push({
      id: 'povo',
      label: 'Basisschool / VO (publiek, per kind)',
      amount: poVo,
      color: '#C47A2C',
      tip: `Onderwijs is “gratis”, maar kost de overheid ±€${poVo.toLocaleString('nl-NL')} per kind per jaar (indicatie bekostiging).`,
    })
  }

  // Iedereen: impliciet aandeel zorg (lager bij hoge inkomens iets genormaliseerd)
  const zorgImputed = Math.round(
    2200 + Math.min(bruto, 60000) * 0.008 - (bruto > 100000 ? 400 : 0),
  )
  if (zorgImputed > 0) {
    benefits.push({
      id: 'zorg_imputed',
      label: 'Zorg via collectieve middelen',
      amount: zorgImputed,
      color: '#1F7A6C',
      tip: 'Indicatie van zorg die via premies/belastingen collectief wordt gefinancierd — niet je zorgtoeslag.',
    })
  }

  const receivedTotal = benefits.reduce((a, b) => a + b.amount, 0)

  // Voor ladder / oude mapping: aggregate naar potjes
  const received = {
    zorg: benefits
      .filter((b) => b.id === 'zorgtoeslag' || b.id === 'zorg_imputed')
      .reduce((a, b) => a + b.amount, 0),
    sociale: benefits
      .filter((b) =>
        ['huurtoeslag', 'beurs', 'kind', 'kop'].includes(b.id),
      )
      .reduce((a, b) => a + b.amount, 0),
    ocw: benefits
      .filter((b) => ['ho', 'povo', 'ov'].includes(b.id))
      .reduce((a, b) => a + b.amount, 0),
    bzk_gemeenten: 0,
    defensie: 0,
    overig_uit: 0,
  }

  return {
    paid,
    received,
    benefits,
    paidTotal: Object.values(paid).reduce((a, b) => a + b, 0),
    receivedTotal,
  }
}

export const inputFields = [
  { key: 'brutoJaar', label: 'Bruto inkomen / jaar', step: 100 },
  { key: 'huurMaand', label: 'Huur / maand', step: 10 },
  { key: 'uitwonendeBeurs', label: 'Uitwonende beurs / jaar', step: 50 },
  { key: 'ovStudenten', label: 'OV-student / jaar', step: 50 },
  { key: 'zorgtoeslagJaar', label: 'Zorgtoeslag / jaar', step: 50 },
  { key: 'huurtoeslagJaar', label: 'Huurtoeslag / jaar', step: 50 },
  { key: 'kindBudget', label: 'Kindregelingen / jaar', step: 50 },
  { key: 'kinderopvang', label: 'Kinderopvangtoeslag / jaar', step: 50 },
  { key: 'collegegeld', label: 'Collegegeld / jaar', step: 50 },
  { key: 'winstBv', label: 'Winst BV / jaar', step: 100 },
  { key: 'dividend', label: 'Dividend / jaar', step: 100 },
]

export function euro(n) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function mld(n) {
  return (
    new Intl.NumberFormat('nl-NL', {
      maximumFractionDigits: n % 1 === 0 ? 0 : 1,
    }).format(n) + ' mld'
  )
}

export function cloneInputs(inputs) {
  return { ...inputs }
}
