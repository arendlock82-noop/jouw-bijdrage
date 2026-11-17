import { useMemo, useState } from 'react'
import {
  allocatePaidToSpend,
  cloneInputs,
  computeFromInputs,
  euro,
  mld,
  modelDisclaimer,
  officialExpenditureTotalMld,
  officialRevenueTotalMld,
  ladderBenchmarks,
  personas,
  revenueStreams,
  sources,
  spendStreams,
  summarizeSituation,
} from './data'
import './App.css'

const CROWD_SIZE = 48
/** Speelse regel: ≥ €1 belasting betaald = graaier. */
const GRAAIER_FROM_EURO = 1
/** Tiny zone links: wie (bijna) niets betaalt. */
const PROFITEUR_SHARE = 0.04
const NATIONAL_MAX_MLD = Math.max(
  officialRevenueTotalMld,
  officialExpenditureTotalMld,
)

/** Ladder: weinig/geen belasting links, grotere betalers rechts = grotere “graaiers”. */
function taxLadderRank(paidTotal) {
  if (paidTotal < GRAAIER_FROM_EURO) return 1
  // €1 → plek ~5, €60k → ~100
  return Math.min(
    100,
    Math.max(5, Math.round(5 + (paidTotal / 60000) * 95)),
  )
}

function isGraaier(paidTotal) {
  return paidTotal >= GRAAIER_FROM_EURO
}

/** Duidelijk poppetje: hoofd + schouders/lijf. */
function PersonGlyph({ you }) {
  return (
    <svg viewBox="0 0 24 40" aria-hidden="true">
      <circle className="head" cx="12" cy="7" r="5.2" />
      <path
        className="body"
        d={
          you
            ? 'M4.5 16.5c2.2-2.8 5-4.2 7.5-4.2s5.3 1.4 7.5 4.2c1.2 1.5 1.8 3.2 1.8 5.2V36c0 1.1-.9 1.8-1.9 1.8h-3.4c-1 0-1.7-.8-1.7-1.7v-6.2h-2.6v6.2c0 .9-.7 1.7-1.7 1.7H6.6c-1 0-1.9-.7-1.9-1.8V21.7c0-2 .6-3.7 1.8-5.2z'
            : 'M6 17c1.8-2.2 3.9-3.3 6-3.3s4.2 1.1 6 3.3c.9 1.1 1.4 2.4 1.4 4V34.5c0 .8-.7 1.4-1.5 1.4h-2.6c-.7 0-1.3-.6-1.3-1.3v-5.2h-2v5.2c0 .7-.6 1.3-1.3 1.3H7.1c-.8 0-1.5-.6-1.5-1.4V21c0-1.6.5-2.9 1.4-4z'
        }
      />
    </svg>
  )
}

function rankToSlot(rank) {
  return Math.round(((rank - 1) / 99) * (CROWD_SIZE - 1))
}

/** Benchmarks: zelfde engine als personas → plek o.b.v. echte betaalde belasting. */
const JAN_MARKERS = ladderBenchmarks.map((b) => {
  const calc = computeFromInputs(b.inputs)
  const rank = taxLadderRank(calc.paidTotal)
  return {
    ...b,
    paidTotal: calc.paidTotal,
    rank,
    slot: rankToSlot(rank),
  }
})

function RankRow({ rank, personaId, graaier, label }) {
  const youSlot = rankToSlot(rank)
  const zoneSlots = Math.max(1, Math.round(CROWD_SIZE * PROFITEUR_SHARE))
  const zonePct = PROFITEUR_SHARE * 100
  const role = graaier ? 'graaier' : 'profiteur'
  const markersBySlot = new Map()
  for (const m of JAN_MARKERS) {
    const list = markersBySlot.get(m.slot) || []
    list.push(m)
    markersBySlot.set(m.slot, list)
  }

  return (
    <div className="rank-row-wrap">
      <div className="rank-ends">
        <span>Profiteur</span>
        <span>Graaier</span>
      </div>
      <div
        className="rank-row"
        role="img"
        aria-label={`Profiteur of graaier: ${label}, plek ${rank} van 100. Met (Jan)Modaal en (Jan)Mediaan.`}
      >
        <div
          className="profiteur-zone"
          style={{ width: `${zonePct}%` }}
          title="Wie (bijna) geen belasting betaalt"
        />
        <div className="zone-line" style={{ left: `${zonePct}%` }}>
          <span>≥ €1</span>
        </div>
        {Array.from({ length: CROWD_SIZE }, (_, i) => {
          const you = i === youSlot
          const jans = markersBySlot.get(i) || []
          const hasJan = jans.length > 0
          const inZone = i < zoneSlots
          return (
            <div
              key={`${personaId}-${i}`}
              className={`dot ${you ? 'you' : ''} ${hasJan ? 'jan-modaal' : ''} ${inZone ? 'profiteur' : 'betaler'} ${i < youSlot ? 'before' : ''}`}
              style={{ animationDelay: `${i * 12}ms` }}
              title={
                hasJan
                  ? jans
                      .map(
                        (j) =>
                          `${j.tagLabel}: ${euro(j.inputs.brutoJaar)} bruto → ${euro(j.paidTotal)} belasting (plek ${j.rank})`,
                      )
                      .join(' · ')
                  : undefined
              }
            >
              {you && <em className="you-tag">{label}</em>}
              {jans.map((j, ji) => (
                <em
                  key={j.id}
                  className={`you-tag jan-tag ${j.id === 'mediaan' ? 'mediaan' : 'modaal'}${you || ji > 0 ? ' stacked' : ''}${you && ji > 0 ? ' stacked-2' : ''}`}
                  style={
                    you || ji > 0
                      ? {
                          top: you
                            ? `${-1.15 - (ji + 1) * 1.2}rem`
                            : `${-1.15 - ji * 1.2}rem`,
                        }
                      : undefined
                  }
                >
                  {j.tagLabel}
                </em>
              ))}
              <PersonGlyph you={you || hasJan} />
            </div>
          )
        })}
      </div>
      <div
        className="rank-marker"
        style={{ left: `${(youSlot / (CROWD_SIZE - 1)) * 100}%` }}
      >
        <span>
          {label} · {role} · plek {rank}/100
        </span>
      </div>
      <p className="ladder-note">
        <strong>(Jan)Modaal</strong> = CPB €48.000 ·{' '}
        <strong>(Jan)Mediaan</strong> = CBS €46.200 (werkenden, 2024). Beide
        door dezelfde rekenmachine — plek volgt uit wat ze betalen. Speelse
        labels: vanaf <strong>€1</strong> ben je hier een graaier.
      </p>
    </div>
  )
}

function InfoTip({ text }) {
  return (
    <span className="info-tip" tabIndex={0} aria-label={text}>
      <span className="info-tip-i" aria-hidden="true">
        i
      </span>
      <span className="info-tip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  )
}

/**
 * Compacte landelijke staaf (gelijke kaders) + losse legenda —
 * voorkomt overlappende tekst bij kleine segmenten.
 */
function AlignedStack({
  streams,
  total,
  side,
  youMap,
  maxTotal,
  youLabel = 'Jouw bijdrage',
}) {
  const empty = Math.max(0, maxTotal - total)

  return (
    <div className={`aligned-stack ${side}`}>
      <div className="aligned-frame" aria-hidden="true">
        <div className="aligned-empty" style={{ flexGrow: empty || 0.0001 }} />
        <div className="aligned-shaft" style={{ flexGrow: total }}>
          {streams.map((s) => (
            <div
              key={s.id}
              className="aligned-seg"
              style={{ flexGrow: s.mld, background: s.color }}
              title={s.label}
            />
          ))}
        </div>
      </div>
      <ul className="stack-legend">
        {streams.map((s) => {
          const pct = (s.mld / total) * 100
          const you = youMap?.[s.id] ?? 0
          return (
            <li key={s.id}>
              <i style={{ background: s.color }} />
              <div>
                <strong>
                  {s.label}
                  <InfoTip text={s.detail || s.hint} />
                </strong>
                <span>
                  {mld(s.mld)} · {pct.toFixed(0)}%
                </span>
                {you > 0 && (
                  <b className="you-chip">
                    {youLabel} {euro(you)}
                  </b>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Jouw bijdrage: links wat je afdraagt, rechts wat jij — in deze
 * persona/situatie — concreet terugkrijgt (geen begrotingsverdeling).
 */
function ContributionPanel({ paid, paidTotal, benefits, receivedTotal }) {
  const max = Math.max(paidTotal, receivedTotal, 1)
  const net = receivedTotal - paidTotal

  const paySegs = revenueStreams
    .map((s) => ({
      ...s,
      amount: paid[s.id] ?? 0,
      tip:
        s.detail ||
        `${s.hint}. Jouw modelschatting: ${euro(paid[s.id] ?? 0)}.`,
    }))
    .filter((s) => s.amount > 0)

  const profitSegs = benefits.map((b) => ({
    id: b.id,
    label: b.label,
    color: b.color,
    amount: b.amount,
    tip: b.tip,
    auto: b.auto,
  }))

  return (
    <div className="tax-bars contribution-panel">
      <p className="tax-bars-title">Jouw bijdrage</p>
      <p className="tax-bars-sub">
        Links wat jij afdraagt. Rechts wat jij in <em>jouw</em> situatie
        terugkrijgt — toeslagen en voorzieningen die bij deze gegevens horen,
        geen standaard “zorgpakket”.
      </p>
      <div className="tax-bars-row">
        <TaxBar
          side="pay"
          title="Jij draagt bij"
          total={paidTotal}
          max={max}
          segments={paySegs}
          compact
        />
        <TaxBar
          side="get"
          title="Jij profiteert"
          total={receivedTotal}
          max={max}
          segments={profitSegs}
          compact
          emptyLabel="Nog geen berekende voordelen voor deze situatie"
        />
      </div>
      <p className={`benefits-compare ${net >= 0 ? 'plus' : 'minus'}`}>
        {net >= 0
          ? `Je profiteert ${euro(Math.abs(net))} meer dan je bijdraagt.`
          : `Je draagt ${euro(Math.abs(net))} meer bij dan je persoonlijk terugziet.`}
      </p>
    </div>
  )
}

function TaxBar({
  side,
  title,
  total,
  max,
  segments,
  compact,
  emptyLabel,
}) {
  const empty = Math.max(0, max - total)

  return (
    <div className={`tax-bar ${side} ${compact ? 'compact' : ''}`}>
      <div className="tax-bar-head">
        <span>{title}</span>
        <strong>{euro(total)}</strong>
      </div>
      <div className="tax-bar-track">
        <div className="tax-bar-empty" style={{ flexGrow: empty || 0.0001 }} />
        <div className="tax-bar-fill" style={{ flexGrow: Math.max(total, 1) }}>
          {segments.map((s) => (
            <div
              key={s.id}
              className="tax-bar-seg"
              style={{ flexGrow: Math.max(s.amount, 0.01), background: s.color }}
              title={`${s.label}: ${euro(s.amount)}`}
            />
          ))}
        </div>
      </div>
      {segments.length === 0 && emptyLabel ? (
        <p className="tax-bar-empty-note">{emptyLabel}</p>
      ) : (
        <ul className="tax-bar-legend">
          {segments.map((s) => (
            <li key={s.id}>
              <i style={{ background: s.color }} />
              <span>
                <span className="leg-label">
                  {s.label.replace(/^[^·]+·\s*/, '')}
                  {s.auto === false && (
                    <em className="auto-tag hand">handmatig</em>
                  )}
                  <InfoTip text={s.tip} />
                </span>
                <b>{euro(s.amount)}</b>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PersonaSummary({ inputs }) {
  const parts = summarizeSituation(inputs)
  return (
    <div className="persona-summary">
      <p className="situation-hint">Deze berekening gaat uit van:</p>
      <ul>
        {parts.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="situation-hint soft">
        Wil je andere aannames? Klik op <strong>Pas aan</strong>.
      </p>
    </div>
  )
}

function SituationForm({ inputs, onChange, derived }) {
  const children = inputs.children || []
  const setChildAge = (index, age) => {
    const next = children.map((c, i) =>
      i === index ? { age: Math.max(0, Math.min(17, age)) } : c,
    )
    onChange('children', next)
  }
  const addChild = () => {
    if (children.length >= 6) return
    onChange('children', [...children, { age: 5 }])
  }
  const removeChild = (index) => {
    onChange(
      'children',
      children.filter((_, i) => i !== index),
    )
  }

  const d = derived

  return (
    <div className="calc-fields situation editable">
      <p className="situation-hint">
        Pas de situatie aan — toeslagen en box&nbsp;1 volgen automatisch (2026).
        We rekenen zonder vermogensgrens (aanname: onder de toeslagdrempel).
      </p>

      <label>
        <span>Bruto inkomen / jaar</span>
        <input
          type="number"
          step={100}
          value={inputs.brutoJaar ?? 0}
          onChange={(e) => onChange('brutoJaar', Number(e.target.value) || 0)}
        />
      </label>

      <label className="check">
        <input
          type="checkbox"
          checked={!!inputs.hasPartner}
          onChange={(e) => onChange('hasPartner', e.target.checked)}
        />
        <span>Toeslagpartner</span>
      </label>

      {inputs.hasPartner && (
        <label>
          <span>Bruto inkomen partner / jaar</span>
          <input
            type="number"
            step={100}
            value={inputs.partnerBrutoJaar ?? 0}
            onChange={(e) =>
              onChange('partnerBrutoJaar', Number(e.target.value) || 0)
            }
          />
        </label>
      )}

      <fieldset className="woning-fieldset">
        <legend>Woning</legend>
        <div className="seg-toggle">
          <button
            type="button"
            className={inputs.woningType === 'huur' ? 'active' : ''}
            onClick={() => onChange('woningType', 'huur')}
          >
            Huur
          </button>
          <button
            type="button"
            className={inputs.woningType === 'koop' ? 'active' : ''}
            onClick={() => onChange('woningType', 'koop')}
          >
            Koop
          </button>
        </div>
        {inputs.woningType === 'huur' && (
          <label>
            <span>Rekenhuur / maand</span>
            <input
              type="number"
              step={10}
              value={inputs.huurMaand ?? 0}
              onChange={(e) =>
                onChange('huurMaand', Number(e.target.value) || 0)
              }
            />
          </label>
        )}
      </fieldset>

      <fieldset className="kids-fieldset">
        <legend>Kinderen (&lt; 18)</legend>
        {children.length === 0 && (
          <p className="empty-kids">Geen kinderen.</p>
        )}
        {children.map((c, i) => (
          <div className="child-row" key={`child-${i}`}>
            <label>
              <span>Leeftijd kind {i + 1}</span>
              <input
                type="number"
                min={0}
                max={17}
                value={c.age}
                onChange={(e) => setChildAge(i, Number(e.target.value) || 0)}
              />
            </label>
            <button
              type="button"
              className="linkish"
              onClick={() => removeChild(i)}
            >
              Verwijder
            </button>
          </div>
        ))}
        {children.length < 6 && (
          <button type="button" className="add-child" onClick={addChild}>
            + Kind toevoegen
          </button>
        )}
        {children.length > 0 && (
          <label>
            <span>Kinderopvangtoeslag / jaar (handmatig)</span>
            <input
              type="number"
              step={50}
              value={inputs.kinderopvangJaarOverride ?? 0}
              onChange={(e) =>
                onChange(
                  'kinderopvangJaarOverride',
                  Number(e.target.value) || 0,
                )
              }
            />
          </label>
        )}
      </fieldset>

      <label className="check">
        <input
          type="checkbox"
          checked={!!inputs.isStudent}
          onChange={(e) => onChange('isStudent', e.target.checked)}
        />
        <span>Student (hbo/wo)</span>
      </label>
      {inputs.isStudent && (
        <div className="seg-toggle">
          <button
            type="button"
            className={inputs.studentWonen !== 'thuiswonend' ? 'active' : ''}
            onClick={() => onChange('studentWonen', 'uitwonend')}
          >
            Uitwonend
          </button>
          <button
            type="button"
            className={inputs.studentWonen === 'thuiswonend' ? 'active' : ''}
            onClick={() => onChange('studentWonen', 'thuiswonend')}
          >
            Thuiswonend
          </button>
        </div>
      )}

      <label className="check">
        <input
          type="checkbox"
          checked={!!inputs.isOndernemer}
          onChange={(e) => onChange('isOndernemer', e.target.checked)}
        />
        <span>BV / DGA</span>
      </label>
      {inputs.isOndernemer && (
        <>
          <label>
            <span>Winst BV / jaar</span>
            <input
              type="number"
              step={100}
              value={inputs.winstBv ?? 0}
              onChange={(e) =>
                onChange('winstBv', Number(e.target.value) || 0)
              }
            />
          </label>
          <label>
            <span>Dividend / jaar</span>
            <input
              type="number"
              step={100}
              value={inputs.dividend ?? 0}
              onChange={(e) =>
                onChange('dividend', Number(e.target.value) || 0)
              }
            />
          </label>
        </>
      )}

      <div className="auto-box">
        <p className="auto-box-title">Automatisch berekend (2026)</p>
        <ul>
          <li>
            <span>Toetsingsinkomen</span>
            <b>{euro(d.toetsingsinkomen)}</b>
          </li>
          <li>
            <span>Loonheffing &amp; premies</span>
            <b>{euro(d.loonPremies)}</b>
          </li>
          <li>
            <span>Zorgtoeslag</span>
            <b>{euro(d.zorgtoeslag)}</b>
          </li>
          <li>
            <span>Huurtoeslag</span>
            <b>{euro(d.huurtoeslag)}</b>
          </li>
          <li>
            <span>Kinderbijslag</span>
            <b>{euro(d.kinderbijslag)}</b>
          </li>
          <li>
            <span>Kindgebonden budget</span>
            <b>{euro(d.kindgebonden)}</b>
          </li>
          {inputs.isStudent && (
            <li>
              <span>Basisbeurs</span>
              <b>{euro(d.beurs)}</b>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

function CalcPanel({
  title,
  tagline,
  calc,
  inputs,
  onChange,
  customMode,
  onToggleCustom,
}) {
  const net = calc.receivedTotal - calc.paidTotal

  return (
    <div className="calc-panel">
      <p className="you-kicker">Berekening</p>
      <h3>{title}</h3>
      <p className="you-lead">{tagline}</p>

      <div className="calc-toggle">
        <button
          type="button"
          className={!customMode ? 'active' : ''}
          onClick={() => onToggleCustom(false)}
        >
          Persona
        </button>
        <button
          type="button"
          className={customMode ? 'active' : ''}
          onClick={() => onToggleCustom(true)}
        >
          Pas aan
        </button>
      </div>

      {customMode ? (
        <SituationForm
          inputs={inputs}
          onChange={onChange}
          derived={calc.derived}
        />
      ) : (
        <PersonaSummary inputs={inputs} />
      )}

      <div className="calc-result">
        <div>
          <span>Jij draagt bij</span>
          <strong className="pay">{euro(calc.paidTotal)}</strong>
        </div>
        <div>
          <span>Jij profiteert</span>
          <strong className="get">{euro(calc.receivedTotal)}</strong>
        </div>
        <div className={`net ${net >= 0 ? 'plus' : 'minus'}`}>
          <span>{net >= 0 ? 'Netto ontvanger' : 'Netto betaler'}</span>
          <strong>
            {net >= 0 ? '+' : '−'}
            {euro(Math.abs(net))}
          </strong>
        </div>
      </div>

      <ContributionPanel
        paid={calc.paid}
        paidTotal={calc.paidTotal}
        benefits={calc.benefits}
        receivedTotal={calc.receivedTotal}
      />
    </div>
  )
}

function SourcesPanel() {
  return (
    <section className="sources" id="bronvermelding">
      <h2>Bronvermelding</h2>
      <p>{modelDisclaimer}</p>
      <ul>
        {sources.map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
            <span className="src-pub">{s.publisher}</span>
            <span className="src-use">{s.usedFor}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function App() {
  const [personaId, setPersonaId] = useState('student')
  const [customMode, setCustomMode] = useState(false)
  const [inputs, setInputs] = useState(() =>
    cloneInputs(personas.find((p) => p.id === 'student').inputs),
  )

  const persona = personas.find((p) => p.id === personaId) ?? personas[0]

  const selectPersona = (id) => {
    const p = personas.find((x) => x.id === id)
    if (!p) return
    setPersonaId(id)
    setInputs(cloneInputs(p.inputs))
    setCustomMode(false)
  }

  const onChange = (key, value) => {
    setCustomMode(true)
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const calc = useMemo(() => computeFromInputs(inputs), [inputs])

  const rank = taxLadderRank(calc.paidTotal)
  const graaier = isGraaier(calc.paidTotal)
  const allocated = useMemo(
    () => allocatePaidToSpend(calc.paidTotal),
    [calc.paidTotal],
  )

  const title = customMode ? 'Jouw situatie' : persona.name
  const tagline = customMode
    ? 'Pas je situatie aan — toeslagen en box 1 volgen automatisch (regels 2026).'
    : persona.tagline

  return (
    <div className="shell">
      <header className="top">
        <h1 className="logo">
          Jouw bijdrage aan <span>BV Nederland</span>
        </h1>
        <p className="lede">
          Profiteur of graaier? Ontdek het snel — speels bedoeld, met echte
          cijfers uit de Miljoenennota en toeslagenregels van 2026. Zie wat jij
          bijdraagt én wat jij terugkrijgt.
        </p>
      </header>

      <div className="persona-bar">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === personaId && !customMode ? 'active' : ''}
            onClick={() => selectPersona(p.id)}
          >
            <strong>{p.name}</strong>
            <span>{p.short}</span>
          </button>
        ))}
        <button
          type="button"
          className={customMode ? 'active custom' : 'custom'}
          onClick={() => setCustomMode(true)}
        >
          <strong>Eigen situatie</strong>
          <span>Inkomen, woning, kids</span>
        </button>
      </div>

      <section className="spectrum">
        <div className="spectrum-copy">
          <p className="kicker">De ladder</p>
          <h2>
            {title}
            <span className={`role-pill ${graaier ? 'graaier' : 'profiteur'}`}>
              {graaier ? 'Graaier' : 'Profiteur'}
            </span>
          </h2>
          <p>{tagline}</p>
        </div>
        <RankRow
          rank={rank}
          personaId={customMode ? 'custom' : personaId}
          graaier={graaier}
          label={title}
        />
      </section>

      <section className="society">
        <div className="society-col">
          <header className="col-head in">
            <p>Inkomsten Nederland</p>
            <h2>{mld(officialRevenueTotalMld)}</h2>
            <span>
              Zelfde kader als rechts — vulling toont {mld(officialRevenueTotalMld)}{' '}
              t.o.v. {mld(officialExpenditureTotalMld)}
            </span>
          </header>
          <AlignedStack
            side="in"
            streams={revenueStreams}
            total={officialRevenueTotalMld}
            maxTotal={NATIONAL_MAX_MLD}
            youMap={calc.paid}
            youLabel="Jouw bijdrage"
          />
        </div>

        <CalcPanel
          title={title}
          tagline={tagline}
          calc={calc}
          inputs={inputs}
          onChange={onChange}
          customMode={customMode}
          onToggleCustom={(v) => {
            if (!v) selectPersona(personaId)
            else setCustomMode(true)
          }}
        />

        <div className="society-col">
          <header className="col-head out">
            <p>Uitgaven Nederland</p>
            <h2>{mld(officialExpenditureTotalMld)}</h2>
            <span>
              Landelijke potjes — “jouw bijdrage” = jouw belasting naar rato
            </span>
          </header>
          <AlignedStack
            side="out"
            streams={spendStreams}
            total={officialExpenditureTotalMld}
            maxTotal={NATIONAL_MAX_MLD}
            youMap={allocated}
            youLabel="Jouw bijdrage"
          />
        </div>
      </section>

      <SourcesPanel />

      <footer className="foot">
        Landelijke totalen uit de Miljoenennota 2026. Persoonlijke bedragen
        volgen openbare kengetallen 2026 — zie{' '}
        <a href="#bronvermelding">bronvermelding</a>.
      </footer>
    </div>
  )
}
