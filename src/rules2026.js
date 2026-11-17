/**
 * Rekenregels Nederland 2026 — openbare kengetallen.
 * Zie sources.js voor documentatie/links.
 */

export const YEAR = 2026

/** Box 1 + heffingskortingen (nog geen AOW). */
export const IB = {
  schijf1Tot: 38883,
  schijf2Tot: 78426,
  tarief1: 0.3575,
  tarief2: 0.3756,
  tarief3: 0.495,
  ahkMax: 3115,
  ahkAfbouwVanaf: 29736,
  ahkAfbouwPct: 0.06398,
  ak: [
    { tot: 11965, pct: 0.08324, basis: 0 },
    { tot: 25845, pct: 0.31009, basis: 996, vanaf: 11965 },
    { tot: 45592, pct: 0.0195, basis: 5300, vanaf: 25845 },
    { tot: 132920, pct: -0.0651, basis: 5685, vanaf: 45592 },
  ],
}

/** Zorgtoeslag 2026. */
export const ZORGTOESLAG = {
  maxMaandAlleen: 129,
  maxMaandPartner: 246,
  drempelInkomen: 29500,
  grensAlleen: 40857,
  grensPartner: 51142,
  vermogenAlleen: 146011,
  vermogenPartner: 184633,
}

/** Huurtoeslag 2026 (vereenvoudigde Wht). */
export const HUURTOESLAG = {
  ijkpuntEen: 23425,
  ijkpuntMeer: 31500,
  basishuurEen: 202.52,
  basishuurMeer: 200.71,
  kwaliteitskortingsgrens: 498.2,
  aftopLaag: 713.02, // 1–2 personen
  aftopHoog: 764.14, // 3+
  maxRekenhuur: 932.93,
  pctMidden: 0.65,
  pctBoven: 0.4,
  afbouwEen: 0.27,
  afbouwMeer: 0.22,
  maxToetsingsinkomen: 60525,
  vermogenEen: 69500, // orienteerend; exacte vermogensgrens huurtoeslag wijkt af
}

/** Kindregelingen 2026. */
export const KIND = {
  // Kinderbijslag per kwartaal (gemiddelde H1/H2 2026)
  kbPerKwartaal: [
    { maxAge: 5, bedrag: (295.07 + 298.4) / 2 },
    { maxAge: 11, bedrag: (358.3 + 362.35) / 2 },
    { maxAge: 17, bedrag: (421.53 + 426.29) / 2 },
  ],
  kgbPerKind: 2580,
  kgbAlleenstaandeOuder: 3416,
  kgb12tot15: 724,
  kgb16tot17: 964,
  kgbDrempelAlleen: 29736,
  kgbDrempelPartner: 39141,
  kgbAfbouwPct: 0.076,
}

/** Student HO 2026. */
export const STUDENT = {
  beursUitwonendMaand: 324.52,
  beursThuisMaand: 130.21,
  collegegeld: 2601,
  ovIndicatieJaar: 1200, // geen officiële “waarde”; zie bronvermelding
}

/** VPB / dividend (vereenvoudigd). */
export const VPB = {
  laagTot: 200000,
  tariefLaag: 0.19,
  tariefHoog: 0.258,
  dividendTarief: 0.246, // box 2 laag (indicatief; werkelijk afhankelijk van aanmerkelijk belang)
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export function toetsingsinkomen(inputs) {
  const eigen = Number(inputs.brutoJaar) || 0
  const partner = inputs.hasPartner ? Number(inputs.partnerBrutoJaar) || 0 : 0
  // Box 2-dividend telt mee in verzamelinkomen (vereenvoudigd)
  const div = Number(inputs.dividend) || 0
  return eigen + partner + div
}

export function calcArbeidskorting(arbeidsinkomen) {
  const y = Math.max(0, Number(arbeidsinkomen) || 0)
  if (y <= 0) return 0
  if (y > 132920) return 0
  for (const band of IB.ak) {
    if (y <= band.tot) {
      if (!band.vanaf) return y * band.pct
      return band.basis + (y - band.vanaf) * band.pct
    }
  }
  return 0
}

export function calcAlgemeneHeffingskorting(verzamel) {
  const y = Math.max(0, Number(verzamel) || 0)
  if (y <= IB.ahkAfbouwVanaf) return IB.ahkMax
  if (y >= IB.schijf2Tot) return 0
  return Math.max(0, IB.ahkMax - IB.ahkAfbouwPct * (y - IB.ahkAfbouwVanaf))
}

/** Geschatte loon-/inkomstenheffing + premies volksverz. na AHK/AK. */
export function calcLoonPremies(bruto) {
  const y = Math.max(0, Number(bruto) || 0)
  if (y <= 0) return 0
  const s1 = Math.min(y, IB.schijf1Tot) * IB.tarief1
  const s2 = Math.min(Math.max(y - IB.schijf1Tot, 0), IB.schijf2Tot - IB.schijf1Tot) * IB.tarief2
  const s3 = Math.max(y - IB.schijf2Tot, 0) * IB.tarief3
  const brutoBelasting = s1 + s2 + s3
  const korting =
    calcAlgemeneHeffingskorting(y) + calcArbeidskorting(y)
  return Math.max(0, Math.round(brutoBelasting - korting))
}

export function calcZorgtoeslagJaar(inputs) {
  const inkomen = toetsingsinkomen(inputs)
  const vermogen = Number(inputs.vermogen) || 0
  const partner = !!inputs.hasPartner
  const grens = partner ? ZORGTOESLAG.grensPartner : ZORGTOESLAG.grensAlleen
  const vermGrens = partner
    ? ZORGTOESLAG.vermogenPartner
    : ZORGTOESLAG.vermogenAlleen
  if (inkomen > grens || vermogen > vermGrens) return 0

  const maxM = partner
    ? ZORGTOESLAG.maxMaandPartner
    : ZORGTOESLAG.maxMaandAlleen
  if (inkomen <= ZORGTOESLAG.drempelInkomen) return Math.round(maxM * 12)

  const span = grens - ZORGTOESLAG.drempelInkomen
  const maand = maxM * (1 - (inkomen - ZORGTOESLAG.drempelInkomen) / span)
  return Math.round(Math.max(0, maand) * 12)
}

/**
 * Huurtoeslag 2026 (art. 21 Wht): toeslag o.b.v. huurbanden,
 * daarna lineaire afbouw boven ijkpunt.
 */
export function calcHuurtoeslagJaar(inputs) {
  if (inputs.woningType !== 'huur') return 0
  const huur = Number(inputs.huurMaand) || 0
  if (huur <= 0) return 0

  const inkomen = toetsingsinkomen(inputs)
  if (inkomen > HUURTOESLAG.maxToetsingsinkomen) return 0

  const personen =
    1 + (inputs.hasPartner ? 1 : 0) + (inputs.children?.length || 0)
  const meerpersoons = personen >= 2
  const ijkpunt = meerpersoons ? HUURTOESLAG.ijkpuntMeer : HUURTOESLAG.ijkpuntEen
  const basishuur = meerpersoons
    ? HUURTOESLAG.basishuurMeer
    : HUURTOESLAG.basishuurEen
  const aftop =
    personen >= 3 ? HUURTOESLAG.aftopHoog : HUURTOESLAG.aftopLaag

  const rekenhuur = Math.min(huur, HUURTOESLAG.maxRekenhuur)
  if (rekenhuur <= basishuur) return 0

  const kg = HUURTOESLAG.kwaliteitskortingsgrens
  let toeslag = 0
  // 100% tot kwaliteitskortingsgrens
  const band1 = Math.min(rekenhuur, kg) - basishuur
  if (band1 > 0) toeslag += band1
  // 65% tot aftoppingsgrens
  const band2 = Math.min(rekenhuur, aftop) - kg
  if (band2 > 0) toeslag += band2 * HUURTOESLAG.pctMidden
  // 40% tot max rekenhuur
  const band3 = rekenhuur - aftop
  if (band3 > 0) toeslag += band3 * HUURTOESLAG.pctBoven

  if (inkomen > ijkpunt) {
    const afbouw = meerpersoons
      ? HUURTOESLAG.afbouwMeer
      : HUURTOESLAG.afbouwEen
    const Y = inkomen - ijkpunt
    toeslag -= (Y * afbouw) / 12
  }

  return Math.round(Math.max(0, toeslag) * 12)
}

export function calcKinderbijslagJaar(children = []) {
  let total = 0
  for (const c of children) {
    const age = Number(c.age)
    if (Number.isNaN(age) || age < 0 || age > 17) continue
    const band = KIND.kbPerKwartaal.find((b) => age <= b.maxAge)
    if (band) total += band.bedrag * 4
  }
  return Math.round(total)
}

export function calcKindgebondenBudgetJaar(inputs) {
  const children = (inputs.children || []).filter((c) => {
    const age = Number(c.age)
    return !Number.isNaN(age) && age >= 0 && age <= 17
  })
  if (!children.length) return 0

  let max = children.length * KIND.kgbPerKind
  if (!inputs.hasPartner) max += KIND.kgbAlleenstaandeOuder
  for (const c of children) {
    const age = Number(c.age)
    if (age >= 16) max += KIND.kgb16tot17
    else if (age >= 12) max += KIND.kgb12tot15
  }

  const inkomen = toetsingsinkomen(inputs)
  const drempel = inputs.hasPartner
    ? KIND.kgbDrempelPartner
    : KIND.kgbDrempelAlleen
  if (inkomen <= drempel) return Math.round(max)
  const vermindering = KIND.kgbAfbouwPct * (inkomen - drempel)
  return Math.round(Math.max(0, max - vermindering))
}

export function calcStudentBeursJaar(inputs) {
  if (!inputs.isStudent) return 0
  const m =
    inputs.studentWonen === 'thuiswonend'
      ? STUDENT.beursThuisMaand
      : STUDENT.beursUitwonendMaand
  return Math.round(m * 12)
}

export function calcCollegegeld(inputs) {
  return inputs.isStudent ? STUDENT.collegegeld : 0
}

export function calcVpb(winst) {
  const w = Math.max(0, Number(winst) || 0)
  if (w <= VPB.laagTot) return Math.round(w * VPB.tariefLaag)
  return Math.round(
    VPB.laagTot * VPB.tariefLaag + (w - VPB.laagTot) * VPB.tariefHoog,
  )
}

export function calcDividendBelasting(dividend) {
  return Math.round(Math.max(0, Number(dividend) || 0) * VPB.dividendTarief)
}

/** Indicatieve BTW/accijns (geen officiële persoonlijke aanslag). */
export function estimateIndirectTaxes(inputs) {
  const bruto = toetsingsinkomen(inputs)
  const huurJaar =
    inputs.woningType === 'huur' ? (Number(inputs.huurMaand) || 0) * 12 : 0
  // Grove consumptieschatting: deel inkomen × aandeel btw-plichtig
  const btw = Math.round(huurJaar * 0.02 + Math.max(bruto, 6000) * 0.07)
  const accijns = Math.round(150 + bruto * 0.0035)
  const overig = Math.round(100 + bruto * 0.0025)
  return { btw, accijns, overig }
}
