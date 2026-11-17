/**
 * Bron totalen: Miljoenennota 2026 — Tabel 5 & 6
 * Persoonlijke bedragen: rules2026.js o.b.v. openbare kengetallen.
 */

import {
  calcCollegegeld,
  calcDividendBelasting,
  calcHuurtoeslagJaar,
  calcKinderbijslagJaar,
  calcKindgebondenBudgetJaar,
  calcLoonPremies,
  calcStudentBeursJaar,
  calcVpb,
  calcZorgtoeslagJaar,
  estimateIndirectTaxes,
  STUDENT,
  toetsingsinkomen,
} from './rules2026'

export { sources, modelDisclaimer } from './sources'
export { YEAR as RULES_YEAR } from './rules2026'

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
      'MN 2026. Jouw bedrag volgt box 1-tarieven 2026 minus AHK/AK (Belastingdienst-tabellen).',
  },
  {
    id: 'btw',
    label: 'BTW (omzetbelasting)',
    mld: 76,
    color: '#2F6B9A',
    hint: 'Belasting op consumptie',
    detail:
      'Landelijk MN-totaal. Jouw deel is een consumptieschatting — geen persoonlijke BTW-aangifte.',
  },
  {
    id: 'vpb',
    label: 'Vennootschapsbelasting',
    mld: 42,
    color: '#C47A2C',
    hint: 'Winstbelasting bedrijven',
    detail: 'Relevant bij een BV. Model: 19% tot €200.000 winst, daarna 25,8%.',
  },
  {
    id: 'accijns_invoer',
    label: 'Accijnzen & invoer',
    mld: 19,
    color: '#8A5A3A',
    hint: 'Brandstof, tabak, alcohol, douane/heffingen',
    detail:
      'MN-totaal. Jouw deel is een grove schatting gekoppeld aan inkomen/verbruik.',
  },
  {
    id: 'dividend',
    label: 'Dividendbelasting / box 2',
    mld: 7,
    color: '#6B3A4A',
    hint: 'Op uitgekeerde winst / aanmerkelijk belang',
    detail:
      'Vereenvoudigd: ~24,6% over ingevuld dividend (box 2 laag tarief-indicatie).',
  },
  {
    id: 'overig_ink',
    label: 'Overige belastingen',
    mld: 39.6,
    color: '#6B7280',
    hint: 'O.a. overdracht, motorrijtuigen, rest',
    detail:
      'Restcategorie binnen de MN-belastingontvangsten. Jouw deel is indicatief.',
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
      'MN 2026: ±€115 mld. “Jouw bijdrage” hier = jouw belasting × (115÷462) — wat je meebetaalt aan de zorgpot, niet wat je aan zorg “krijgt”.',
  },
  {
    id: 'sociale',
    label: 'SZW · Sociale zekerheid',
    mld: 116,
    color: '#2F6B9A',
    hint: 'AOW, WW, bijstand, toeslagen, kinderopvang',
    detail:
      'MN 2026: ±€116 mld. Chip = meebetalen naar rato; wat jij ontvangt staat onder “Jij profiteert”.',
  },
  {
    id: 'ocw',
    label: 'OCW · Onderwijs',
    mld: 55,
    color: '#C47A2C',
    hint: 'Onderwijs, cultuur en wetenschap',
    detail:
      'MN 2026: ±€55 mld. Chip = meebetalen naar rato; student/kind-voordelen staan in het midden.',
  },
  {
    id: 'bzk_gemeenten',
    label: 'Gemeenten & provincies',
    mld: 51,
    color: '#4A7C59',
    hint: 'Gemeente- en Provinciefonds',
    detail: 'MN 2026: ±€51 mld. Chip = jouw belasting naar rato van dit potje.',
  },
  {
    id: 'defensie',
    label: 'Defensie',
    mld: 24,
    color: '#5C4A3A',
    hint: 'Incl. Defensiematerieelbegrotingsfonds',
    detail: 'MN 2026: ±€24 mld (incl. DMF). Chip = meebetalen naar rato.',
  },
  {
    id: 'overig_uit',
    label: 'Overige ministeries',
    mld: 101,
    color: '#6B7280',
    hint: 'JenV, IenW, BZ, klimaat, asiel, financiën, …',
    detail:
      'Rest tot €462 mld. Chip = meebetalen naar rato — geen persoonlijk “ontvangstbedrag”.',
  },
]

export function allocatePaidToSpend(paidTotal) {
  const out = {}
  for (const s of spendStreams) {
    out[s.id] = Math.round((paidTotal * s.mld) / officialExpenditureTotalMld)
  }
  return out
}

function emptyPersonaInputs() {
  return {
    brutoJaar: 0,
    partnerBrutoJaar: 0,
    hasPartner: false,
    woningType: 'huur',
    huurMaand: 0,
    vermogen: 5000,
    children: [],
    isStudent: false,
    studentWonen: 'uitwonend',
    isOndernemer: false,
    winstBv: 0,
    dividend: 0,
    /** Optioneel handmatig; leeg = auto */
    kinderopvangJaarOverride: null,
  }
}

/**
 * Persona-inputs: huishoudsituatie. Toeslagen/belasting volgen automatisch.
 */
export const personas = [
  {
    id: 'student',
    name: 'Student',
    short: 'Uitwonend, bijbaan',
    rank: 18,
    tagline: 'Lage belastingdruk, wél beurs, OV en vaak huurtoeslag.',
    inputs: {
      ...emptyPersonaInputs(),
      brutoJaar: 9200,
      hasPartner: false,
      woningType: 'huur',
      huurMaand: 550,
      vermogen: 2000,
      isStudent: true,
      studentWonen: 'uitwonend',
    },
  },
  {
    id: 'moeder',
    name: 'Alleenstaande ouder',
    short: 'Parttime + kind',
    rank: 34,
    tagline: 'Betaalt mee — en kan netto méér terugkrijgen via toeslagen.',
    inputs: {
      ...emptyPersonaInputs(),
      brutoJaar: 28600,
      hasPartner: false,
      woningType: 'huur',
      huurMaand: 780,
      vermogen: 8000,
      children: [{ age: 6 }],
      kinderopvangJaarOverride: 4200,
    },
  },
  {
    id: 'modaal',
    name: 'Modaal huishouden',
    short: 'Twee verdieners',
    rank: 58,
    tagline: 'Stevige loonheffing; weinig toeslagen.',
    inputs: {
      ...emptyPersonaInputs(),
      brutoJaar: 42000,
      partnerBrutoJaar: 36000,
      hasPartner: true,
      woningType: 'koop',
      huurMaand: 0,
      vermogen: 25000,
      children: [{ age: 8 }, { age: 11 }],
    },
  },
  {
    id: 'ondernemer',
    name: 'Ondernemer (BV)',
    short: 'DGA + dividend',
    rank: 72,
    tagline: 'Ook VPB en dividendbelasting, niet alleen loonheffing.',
    inputs: {
      ...emptyPersonaInputs(),
      brutoJaar: 52000,
      hasPartner: false,
      woningType: 'koop',
      vermogen: 80000,
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
      ...emptyPersonaInputs(),
      brutoJaar: 82000,
      partnerBrutoJaar: 66000,
      hasPartner: true,
      woningType: 'koop',
      vermogen: 120000,
      children: [{ age: 14 }],
      dividend: 2000,
    },
  },
]

/** Afgeleide toeslagen/belastingen o.b.v. situatie. */
export function deriveAmounts(inputs) {
  const loonPremies =
    calcLoonPremies(Number(inputs.brutoJaar) || 0) +
    (inputs.hasPartner
      ? calcLoonPremies(Number(inputs.partnerBrutoJaar) || 0)
      : 0)

  const indirect = estimateIndirectTaxes(inputs)
  const vpb = inputs.isOndernemer ? calcVpb(inputs.winstBv) : 0
  const dividendBel = calcDividendBelasting(inputs.dividend)

  const zorgtoeslag = calcZorgtoeslagJaar(inputs)
  const huurtoeslag = calcHuurtoeslagJaar(inputs)
  const kinderbijslag = calcKinderbijslagJaar(inputs.children)
  const kindgebonden = calcKindgebondenBudgetJaar(inputs)
  const beurs = calcStudentBeursJaar(inputs)
  const collegegeld = calcCollegegeld(inputs)
  const ov = inputs.isStudent ? STUDENT.ovIndicatieJaar : 0
  const kop =
    inputs.kinderopvangJaarOverride != null
      ? Number(inputs.kinderopvangJaarOverride) || 0
      : 0

  return {
    loonPremies,
    btw: indirect.btw,
    vpb,
    accijns: indirect.accijns,
    overig: indirect.overig,
    dividendBel,
    zorgtoeslag,
    huurtoeslag,
    kinderbijslag,
    kindgebonden,
    beurs,
    collegegeld,
    ov,
    kop,
    toetsingsinkomen: toetsingsinkomen(inputs),
  }
}

export function computeFromInputs(inputs) {
  const d = deriveAmounts(inputs)

  const paid = {
    loon_premies: d.loonPremies,
    btw: d.btw,
    vpb: d.vpb,
    accijns_invoer: d.accijns,
    dividend: d.dividendBel,
    overig_ink: d.overig,
  }

  const benefits = []

  if (d.huurtoeslag > 0) {
    benefits.push({
      id: 'huurtoeslag',
      label: 'Huurtoeslag',
      amount: d.huurtoeslag,
      color: '#2F6B9A',
      tip: 'Berekend met Wet op de huurtoeslag 2026 (huur, inkomen, huishoudgrootte).',
      auto: true,
    })
  }
  if (d.zorgtoeslag > 0) {
    benefits.push({
      id: 'zorgtoeslag',
      label: 'Zorgtoeslag',
      amount: d.zorgtoeslag,
      color: '#1F7A6C',
      tip: 'Berekend met grenzen/maxima 2026 (Dienst Toeslagen).',
      auto: true,
    })
  }
  if (d.beurs > 0) {
    benefits.push({
      id: 'beurs',
      label: 'Basisbeurs (DUO)',
      amount: d.beurs,
      color: '#C47A2C',
      tip: 'Officieel DUO-bedrag 2026 × 12 maanden.',
      auto: true,
    })
  }
  if (d.ov > 0) {
    benefits.push({
      id: 'ov',
      label: 'OV-studentenreisproduct (indicatie)',
      amount: d.ov,
      color: '#4A7C59',
      tip: 'Indicatie van de jaarwaarde — geen officiële DUO-prijslijst.',
      auto: true,
    })
  }
  if (d.kinderbijslag > 0) {
    benefits.push({
      id: 'kinderbijslag',
      label: 'Kinderbijslag (SVB)',
      amount: d.kinderbijslag,
      color: '#2F6B9A',
      tip: 'SVB-bedragen 2026 naar leeftijd van elk kind.',
      auto: true,
    })
  }
  if (d.kindgebonden > 0) {
    benefits.push({
      id: 'kgb',
      label: 'Kindgebonden budget',
      amount: d.kindgebonden,
      color: '#5C6BC0',
      tip: 'Wet kindgebonden budget 2026 (basis + leeftijd + alleenstaande ouder, afbouw 7,6%).',
      auto: true,
    })
  }
  if (d.kop > 0) {
    benefits.push({
      id: 'kop',
      label: 'Kinderopvangtoeslag (handmatig)',
      amount: d.kop,
      color: '#6B3A4A',
      tip: 'Nog niet automatisch: hangt af van uren, tarief en ouderbijdragetabel. Handmatig ingevuld.',
      auto: false,
    })
  }

  if (d.collegegeld > 0) {
    const hoPubliek = 9800
    benefits.push({
      id: 'ho',
      label: 'Publiek bekostigd hoger onderwijs',
      amount: hoPubliek,
      color: '#C47A2C',
      tip: `Indicatie publieke bekostiging per HO-student/jaar — naast wettelijk collegegeld ${euro(d.collegegeld)}.`,
      auto: true,
    })
  }

  const schoolKids = (inputs.children || []).filter((c) => {
    const a = Number(c.age)
    return !Number.isNaN(a) && a >= 4 && a <= 17
  }).length
  if (schoolKids > 0) {
    const poVo = 8600
    benefits.push({
      id: 'povo',
      label: `Basisschool / VO (publiek, ${schoolKids} kind${schoolKids > 1 ? 'eren' : ''})`,
      amount: poVo * schoolKids,
      color: '#C47A2C',
      tip: `Indicatie ±€${poVo.toLocaleString('nl-NL')} publieke bekostiging per kind/jaar — alleen als er schoolgaande kinderen in jouw situatie staan.`,
      auto: true,
    })
  }

  // Geen standaard “zorgpakket”: zorgtoeslag zit hierboven; zorgconsumptie
  // hangt af van gebruik en is geen vast bedrag per persoon.

  const receivedTotal = benefits.reduce((a, b) => a + b.amount, 0)

  const received = {
    zorg: benefits
      .filter((b) => b.id === 'zorgtoeslag')
      .reduce((a, b) => a + b.amount, 0),
    sociale: benefits
      .filter((b) =>
        ['huurtoeslag', 'beurs', 'kinderbijslag', 'kgb', 'kop'].includes(b.id),
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
    derived: d,
    paidTotal: Object.values(paid).reduce((a, b) => a + b, 0),
    receivedTotal,
  }
}

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
  return {
    ...inputs,
    children: (inputs.children || []).map((c) => ({ ...c })),
  }
}
