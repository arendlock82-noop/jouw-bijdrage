import { useMemo, useState } from 'react'
import {
  BUDGET_YEAR,
  allocatePaidToSpend,
  budgetSource,
  cloneInputs,
  computeFromInputs,
  euro,
  inputFields,
  mld,
  officialExpenditureTotalMld,
  officialRevenueTotalMld,
  personas,
  revenueStreams,
  spendStreams,
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

function RankRow({ rank, personaId, graaier, label }) {
  const youSlot = Math.round(((rank - 1) / 99) * (CROWD_SIZE - 1))
  const zoneSlots = Math.max(1, Math.round(CROWD_SIZE * PROFITEUR_SHARE))
  const zonePct = PROFITEUR_SHARE * 100
  const medianPct = 50
  const role = graaier ? 'graaier' : 'profiteur'

  return (
    <div className="rank-row-wrap">
      <div className="rank-ends">
        <span>Profiteur</span>
        <span>Graaier</span>
      </div>
      <div
        className="rank-row"
        role="img"
        aria-label={`Profiteur of graaier: ${label}, plek ${rank} van 100`}
      >
        <div
          className="profiteur-zone"
          style={{ width: `${zonePct}%` }}
          title="Wie (bijna) geen belasting betaalt"
        />
        <div className="zone-line" style={{ left: `${zonePct}%` }}>
          <span>≥ €1</span>
        </div>
        <div className="median-line" style={{ left: `${medianPct}%` }}>
          <span>Mediaan</span>
        </div>
        {Array.from({ length: CROWD_SIZE }, (_, i) => {
          const you = i === youSlot
          const inZone = i < zoneSlots
          return (
            <div
              key={`${personaId}-${i}`}
              className={`dot ${you ? 'you' : ''} ${inZone ? 'profiteur' : 'betaler'} ${i < youSlot ? 'before' : ''}`}
              style={{ animationDelay: `${i * 12}ms` }}
            >
              {you && <em className="you-tag">{label}</em>}
              <PersonGlyph you={you} />
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
        Speelse regel: betaal je <strong>minstens €1</strong> belasting, dan ben
        je al een <strong>graaier</strong>. Alleen wie (vrijwel) niets afdraagt
        blijft <strong>profiteur</strong>.
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
function AlignedStack({ streams, total, side, youMap, maxTotal }) {
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
                  <b className="you-chip">Jouw bijdrage {euro(you)}</b>
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
 * Links: hoe jij bijdraagt aan de inkomsten (soorten belasting).
 * Rechts: waar jouw betaalde belasting naartoe gaat (MN-verhouding) —
 * dus “ik betaal ±X aan zorg”, niet “ik ontvang X zorg”.
 */
function PersonalTaxBars({ paid, paidTotal, allocated, allocatedTotal }) {
  const max = Math.max(paidTotal, allocatedTotal, 1)

  const paySegs = revenueStreams
    .map((s) => ({
      ...s,
      amount: paid[s.id] ?? 0,
      tip:
        s.detail ||
        `${s.hint}. Jouw modelschatting: ${euro(paid[s.id] ?? 0)}.`,
    }))
    .filter((s) => s.amount > 0)

  const outSegs = spendStreams.map((s) => {
    const amount = allocated[s.id] ?? 0
    const pct = ((s.mld / officialExpenditureTotalMld) * 100).toFixed(0)
    return {
      ...s,
      amount,
      tip:
        s.detail ||
        `${s.hint}. Van jouw ${euro(paidTotal)} gaat ±${pct}% (= ${euro(amount)}) naar dit potje.`,
    }
  })

  return (
    <div className="tax-bars">
      <p className="tax-bars-title">Jouw meebetalen</p>
      <p className="tax-bars-sub">
        Links wat je afdraagt. Rechts waar dat — naar rato van de begroting —
        naartoe gaat.
      </p>
      <div className="tax-bars-row">
        <TaxBar
          side="pay"
          title="Jij betaalt"
          total={paidTotal}
          max={max}
          segments={paySegs}
          compact
        />
        <TaxBar
          side="out"
          title="Daarvan naar potjes"
          total={allocatedTotal}
          max={max}
          segments={outSegs}
          compact
        />
      </div>
    </div>
  )
}

/** Wat je terugkrijgt: toeslagen + publieke voorzieningen (o.a. onderwijs). */
function BenefitsPanel({ benefits, receivedTotal, paidTotal }) {
  const max = Math.max(receivedTotal, paidTotal, 1)
  const empty = Math.max(0, max - receivedTotal)

  return (
    <div className="benefits-panel">
      <div className="benefits-head">
        <div>
          <p className="tax-bars-title">Wat krijg je terug?</p>
          <p className="tax-bars-sub">
            Toeslagen én de waarde van “gratis” voorzieningen (zoals onderwijs)
            — dat is profiteren van de collectieve pot.
          </p>
        </div>
        <strong className="benefits-total">{euro(receivedTotal)}</strong>
      </div>

      <div className="benefits-visual">
        <div className="benefits-track">
          <div
            className="tax-bar-empty"
            style={{ flexGrow: empty || 0.0001 }}
          />
          <div
            className="benefits-fill"
            style={{ flexGrow: Math.max(receivedTotal, 1) }}
          >
            {benefits.map((b) => (
              <div
                key={b.id}
                className="tax-bar-seg"
                style={{
                  flexGrow: Math.max(b.amount, 0.01),
                  background: b.color,
                }}
                title={`${b.label}: ${euro(b.amount)}`}
              />
            ))}
          </div>
        </div>
        <ul className="benefits-list">
          {benefits.map((b) => (
            <li key={b.id}>
              <i style={{ background: b.color }} />
              <span className="leg-label">
                {b.label}
                <InfoTip text={b.tip} />
              </span>
              <b>{euro(b.amount)}</b>
            </li>
          ))}
        </ul>
      </div>
      <p className="benefits-compare">
        Teruggekregen {euro(receivedTotal)} vs. betaald {euro(paidTotal)}
        {receivedTotal >= paidTotal
          ? ' — je krijgt meer terug dan je inlegt.'
          : ' — je legt meer in dan je persoonlijk terugziet.'}
      </p>
    </div>
  )
}

function TaxBar({ side, title, total, max, segments, compact }) {
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
      <ul className="tax-bar-legend">
        {segments.map((s) => (
          <li key={s.id}>
            <i style={{ background: s.color }} />
            <span>
              <span className="leg-label">
                {s.label.replace(/^[^·]+·\s*/, '')}
                <InfoTip text={s.tip} />
              </span>
              <b>{euro(s.amount)}</b>
            </span>
          </li>
        ))}
      </ul>
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
  const allocated = allocatePaidToSpend(calc.paidTotal)
  const allocatedTotal = Object.values(allocated).reduce((a, b) => a + b, 0)
  const visibleFields = inputFields.filter((f) => {
    if (['winstBv', 'dividend'].includes(f.key)) {
      return inputs.isOndernemer || Number(inputs[f.key]) > 0 || customMode
    }
    if (['uitwonendeBeurs', 'ovStudenten', 'collegegeld'].includes(f.key)) {
      return Number(inputs[f.key]) > 0 || customMode
    }
    if (['kindBudget', 'kinderopvang'].includes(f.key)) {
      return Number(inputs[f.key]) > 0 || customMode
    }
    return true
  })

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

      <div className={`calc-fields ${customMode ? 'editable' : 'readonly'}`}>
        {visibleFields.map((f) => (
          <label key={f.key}>
            <span>{f.label}</span>
            {customMode ? (
              <input
                type="number"
                step={f.step}
                value={inputs[f.key] ?? 0}
                onChange={(e) => onChange(f.key, Number(e.target.value) || 0)}
              />
            ) : (
              <strong>{euro(Number(inputs[f.key]) || 0)}</strong>
            )}
          </label>
        ))}
        {customMode && (
          <label className="check">
            <input
              type="checkbox"
              checked={!!inputs.isOndernemer}
              onChange={(e) => onChange('isOndernemer', e.target.checked)}
            />
            <span>Ik heb een BV / onderneming</span>
          </label>
        )}
      </div>

      <div className="calc-result">
        <div>
          <span>Belasting &amp; premies betaald</span>
          <strong className="pay">{euro(calc.paidTotal)}</strong>
        </div>
        <div>
          <span>Toeslagen e.d. terug</span>
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

      <BenefitsPanel
        benefits={calc.benefits}
        receivedTotal={calc.receivedTotal}
        paidTotal={calc.paidTotal}
      />

      <PersonalTaxBars
        paid={calc.paid}
        paidTotal={calc.paidTotal}
        allocated={allocated}
        allocatedTotal={allocatedTotal}
      />
    </div>
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
    ? 'Pas de bedragen aan — belasting betaald/ontvangen beweegt mee.'
    : persona.tagline

  return (
    <div className="shell">
      <header className="top">
        <h1 className="logo">
          Profiteur <span>of graaien?</span>
        </h1>
        <p className="lede">
          Betaal je €1 belasting, dan ben je al een graaier. Ontdek waar jij
          staat — en wat je bijdraagt én terugkrijgt.
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
          <span>Pas bedragen aan</span>
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
            <span>Zelfde kader — iets voller dan de inkomstenstaaf</span>
          </header>
          <AlignedStack
            side="out"
            streams={spendStreams}
            total={officialExpenditureTotalMld}
            maxTotal={NATIONAL_MAX_MLD}
            youMap={allocated}
          />
        </div>
      </section>

      <footer className="foot">
        Landelijke totalen:{' '}
        <a href={budgetSource.url} target="_blank" rel="noreferrer">
          {budgetSource.title}
        </a>
        . Staven links/rechts zijn onderling op schaal. In het midden alleen
        jouw belasting betaald vs. ontvangen.
      </footer>
    </div>
  )
}
