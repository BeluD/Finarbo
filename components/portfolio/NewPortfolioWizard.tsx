'use client'

import { useState, useRef }     from 'react'
import { useRouter }            from 'next/navigation'
import { useSession }           from 'next-auth/react'
import { ParsedPosition, Horizon, Objective, RiskTolerance, Currency } from '@/types'

// ─── Step types ──────────────────────────────────────────────────────────────

type WizardState = {
  // Step 1
  name:          string
  file:          File | null
  positions:     ParsedPosition[]
  parseError:    string
  // Step 2 — KYC
  riskTolerance: RiskTolerance | ''
  horizon:       Horizon | ''
  objective:     Objective | ''
  objectiveText: string
  currency:      Currency | ''
}

const INITIAL: WizardState = {
  name: '', file: null, positions: [], parseError: '',
  riskTolerance: '', horizon: '', objective: '', objectiveText: '', currency: '',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600,
        background: done ? 'var(--green-core)' : active ? 'var(--blue-core)' : 'var(--surface-2)',
        color:      done ? '#0a0f0a'           : active ? '#fff'             : 'var(--text-3)',
        border:     active ? '2px solid var(--blue-core)' : '2px solid transparent',
        transition: 'all 0.2s',
      }}>
        {done ? <i className="fa-solid fa-check" style={{ fontSize: '11px' }} /> : n}
      </div>
    </div>
  )
}

function KycOption({
  label, sublabel, selected, onClick,
}: { label: string; sublabel?: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`kyc-opt${selected ? ' selected' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--green-core)' : 'var(--border-subtle)'}`,
          background: selected ? 'var(--green-core)' : 'transparent',
          flexShrink: 0, transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0a0f0a' }} />}
        </div>
        <div>
          <div className="t-body" style={{ color: 'var(--text-1)', fontWeight: 500 }}>{label}</div>
          {sublabel && <div className="t-small" style={{ color: 'var(--text-3)' }}>{sublabel}</div>}
        </div>
      </div>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewPortfolioWizard() {
  const router             = useRouter()
  const { update }         = useSession()
  const [step, setStep]    = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))

  // ── Step 1: parse file client-side via API ──
  async function handleFilePick(file: File) {
    set({ file, parseError: '', positions: [] })
    const fd = new FormData()
    fd.append('file', file)
    // We'll parse positions by uploading to a parse-only endpoint
    // For now: store file and parse on submission
    set({ file })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFilePick(file)
  }

  // ── Step 3: preview after parsing ──
  async function parseAndPreview() {
    if (!state.file) return
    set({ parseError: '' })
    const fd = new FormData()
    fd.append('file', state.file)
    const res = await fetch('/api/parse-positions', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) { set({ parseError: data.error ?? 'Error al leer el archivo.' }); return }
    set({ positions: data.positions })
    setStep(3)
  }

  // ── Submit ──
  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/portfolios', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:          state.name.trim(),
          riskTolerance: state.riskTolerance,
          horizon:       state.horizon,
          objective:     state.objective,
          objectiveText: state.objectiveText || null,
          currency:      state.currency,
          positions:     state.positions,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error ?? 'Error al crear la cartera.'); return }
      // Marcar onboarding como completado al crear la primera cartera
      await fetch('/api/user/onboarding', { method: 'PATCH' })
      await update({ showOnboarding: false })
      router.push(`/portfolio/${data.id}`)
    } catch {
      setSubmitError('Error de red. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const step1Valid = state.name.trim().length >= 2 && state.file !== null
  const step2Valid = state.riskTolerance && state.horizon && state.objective && state.currency &&
    (state.objective !== 'OTHER' || state.objectiveText.trim().length > 0)

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '580px', margin: '0 auto' }}>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '36px' }}>
        <StepDot n={1} active={step === 1} done={step > 1} />
        <div style={{ flex: 1, height: '2px', background: step > 1 ? 'var(--green-core)' : 'var(--border-subtle)', borderRadius: '2px', transition: 'background 0.3s' }} />
        <StepDot n={2} active={step === 2} done={step > 2} />
        <div style={{ flex: 1, height: '2px', background: step > 2 ? 'var(--green-core)' : 'var(--border-subtle)', borderRadius: '2px', transition: 'background 0.3s' }} />
        <StepDot n={3} active={step === 3} done={false} />
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div>
          <h1 className="t-h2" style={{ color: 'var(--text-1)', marginBottom: '6px' }}>Nueva cartera</h1>
          <p className="t-body" style={{ color: 'var(--text-2)', marginBottom: '32px' }}>
            Poné un nombre y subí tu archivo de posiciones.
          </p>

          {/* Name */}
          <div className="field" style={{ marginBottom: '24px' }}>
            <label className="t-label" style={{ color: 'var(--text-2)', display: 'block', marginBottom: '6px' }}>
              Nombre de la cartera
            </label>
            <input
              className="field-input"
              type="text"
              placeholder="Ej: Cartera Principal"
              value={state.name}
              onChange={e => set({ name: e.target.value })}
              maxLength={60}
            />
          </div>

          {/* File upload */}
          <div
            className={`upload${state.file ? ' has-file' : ''}`}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFilePick(f) }}
            />
            {state.file ? (
              <>
                <i className="fa-solid fa-file-check" style={{ fontSize: '28px', color: 'var(--green-core)', marginBottom: '8px' }} />
                <p className="t-body" style={{ color: 'var(--text-1)', fontWeight: 500 }}>{state.file.name}</p>
                <p className="t-small" style={{ color: 'var(--text-3)' }}>Clic para cambiar el archivo</p>
              </>
            ) : (
              <>
                <i className="fa-solid fa-file-arrow-up" style={{ fontSize: '28px', color: 'var(--green-core)', marginBottom: '8px' }} />
                <p className="t-body" style={{ color: 'var(--text-1)', fontWeight: 500 }}>Arrastrá o hacé clic para subir</p>
                <p className="t-small" style={{ color: 'var(--text-3)' }}>CSV o Excel (.xlsx, .xls) · Columnas: abrev, cant, pppCompra</p>
              </>
            )}
          </div>

          {state.parseError && (
            <p className="t-small" style={{ color: 'var(--red-core)', marginTop: '8px' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} />{state.parseError}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button className="btn btn-filled" disabled={!step1Valid} onClick={() => setStep(2)}>
              Continuar <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 — KYC ── */}
      {step === 2 && (
        <div>
          <h1 className="t-h2" style={{ color: 'var(--text-1)', marginBottom: '6px' }}>Tu perfil inversor</h1>
          <p className="t-body" style={{ color: 'var(--text-2)', marginBottom: '32px' }}>
            Estas respuestas nos ayudan a interpretar tu cartera en contexto.
          </p>

          {/* Risk tolerance */}
          <div style={{ marginBottom: '28px' }}>
            <p className="t-label" style={{ color: 'var(--text-2)', marginBottom: '10px' }}>¿Cómo te sentís con el riesgo?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <KycOption label="Prefiero no perder plata, aunque gane poco"      selected={state.riskTolerance === 'PRESERVE'} onClick={() => set({ riskTolerance: 'PRESERVE' })} />
              <KycOption label="Prefiero que crezca de forma equilibrada"         selected={state.riskTolerance === 'BALANCED'} onClick={() => set({ riskTolerance: 'BALANCED' })} />
              <KycOption label="Prefiero maximizar ganancias, aunque tenga bajadas" selected={state.riskTolerance === 'GROWTH'}  onClick={() => set({ riskTolerance: 'GROWTH'  })} />
            </div>
          </div>

          {/* Horizon */}
          <div style={{ marginBottom: '28px' }}>
            <p className="t-label" style={{ color: 'var(--text-2)', marginBottom: '10px' }}>¿A qué plazo invertís?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <KycOption label="Corto plazo"  sublabel="Menos de 1 año"  selected={state.horizon === 'SHORT'}  onClick={() => set({ horizon: 'SHORT'  })} />
              <KycOption label="Mediano plazo" sublabel="Entre 1 y 5 años" selected={state.horizon === 'MEDIUM'} onClick={() => set({ horizon: 'MEDIUM' })} />
              <KycOption label="Largo plazo"  sublabel="Más de 5 años"   selected={state.horizon === 'LONG'}   onClick={() => set({ horizon: 'LONG'   })} />
            </div>
          </div>

          {/* Objective */}
          <div style={{ marginBottom: '28px' }}>
            <p className="t-label" style={{ color: 'var(--text-2)', marginBottom: '10px' }}>¿Cuál es tu objetivo principal?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <KycOption label="Hacer crecer mis ahorros"                     selected={state.objective === 'GROW_SAVINGS'}          onClick={() => set({ objective: 'GROW_SAVINGS'         })} />
              <KycOption label="Ahorrar para algo específico"  sublabel="Vacaciones, auto, casa…" selected={state.objective === 'SPECIFIC_GOAL'} onClick={() => set({ objective: 'SPECIFIC_GOAL' })} />
              <KycOption label="Vivir de mis inversiones"                      selected={state.objective === 'LIVE_FROM_INVESTMENTS'} onClick={() => set({ objective: 'LIVE_FROM_INVESTMENTS'})} />
              <KycOption label="Otro"                                          selected={state.objective === 'OTHER'}                 onClick={() => set({ objective: 'OTHER'                })} />
            </div>
            {state.objective === 'OTHER' && (
              <input
                className="field-input"
                type="text"
                placeholder="Contanos tu objetivo…"
                value={state.objectiveText}
                onChange={e => set({ objectiveText: e.target.value })}
                style={{ marginTop: '10px' }}
                maxLength={120}
              />
            )}
          </div>

          {/* Currency */}
          <div style={{ marginBottom: '32px' }}>
            <p className="t-label" style={{ color: 'var(--text-2)', marginBottom: '10px' }}>¿En qué moneda querés ver los valores?</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <KycOption label="USD — Dólares" selected={state.currency === 'USD'} onClick={() => set({ currency: 'USD' })} />
              <KycOption label="ARS — Pesos"   selected={state.currency === 'ARS'} onClick={() => set({ currency: 'ARS' })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              <i className="fa-solid fa-arrow-left" /> Atrás
            </button>
            <button className="btn btn-filled" disabled={!step2Valid} onClick={parseAndPreview}>
              Ver resumen <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Preview ── */}
      {step === 3 && (
        <div>
          <h1 className="t-h2" style={{ color: 'var(--text-1)', marginBottom: '6px' }}>Confirmá tu cartera</h1>
          <p className="t-body" style={{ color: 'var(--text-2)', marginBottom: '32px' }}>
            Revisá los datos antes de guardar.
          </p>

          {/* Summary card */}
          <div style={{
            background: 'var(--surface-1)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px',
          }}>
            <p className="t-label" style={{ color: 'var(--text-3)', marginBottom: '4px' }}>NOMBRE</p>
            <p className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600, marginBottom: '16px' }}>{state.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <p className="t-label" style={{ color: 'var(--text-3)', marginBottom: '2px' }}>TOLERANCIA AL RIESGO</p>
                <p className="t-small" style={{ color: 'var(--text-1)' }}>
                  {{ PRESERVE: 'Conservadora', BALANCED: 'Moderada', GROWTH: 'Agresiva' }[state.riskTolerance as string]}
                </p>
              </div>
              <div>
                <p className="t-label" style={{ color: 'var(--text-3)', marginBottom: '2px' }}>HORIZONTE</p>
                <p className="t-small" style={{ color: 'var(--text-1)' }}>
                  {{ SHORT: 'Corto plazo', MEDIUM: 'Mediano plazo', LONG: 'Largo plazo' }[state.horizon as string]}
                </p>
              </div>
              <div>
                <p className="t-label" style={{ color: 'var(--text-3)', marginBottom: '2px' }}>MONEDA</p>
                <p className="t-small" style={{ color: 'var(--text-1)' }}>{state.currency}</p>
              </div>
              <div>
                <p className="t-label" style={{ color: 'var(--text-3)', marginBottom: '2px' }}>POSICIONES</p>
                <p className="t-small" style={{ color: 'var(--text-1)' }}>{state.positions.length} activos</p>
              </div>
            </div>
          </div>

          {/* Positions table */}
          <div style={{
            background: 'var(--surface-1)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '28px',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--surface-2)',
            }}>
              <span className="t-label" style={{ color: 'var(--text-3)' }}>TICKER</span>
              <span className="t-label" style={{ color: 'var(--text-3)', textAlign: 'right', minWidth: '80px' }}>CANTIDAD</span>
              <span className="t-label" style={{ color: 'var(--text-3)', textAlign: 'right', minWidth: '100px' }}>PPP COMPRA</span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {state.positions.map((p) => (
                <div key={p.ticker} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>{p.ticker}</span>
                  <span className="t-body" style={{ color: 'var(--text-2)', textAlign: 'right', minWidth: '80px' }}>{p.quantity}</span>
                  <span className="t-body" style={{ color: 'var(--text-2)', textAlign: 'right', minWidth: '100px' }}>{p.avgBuyPrice.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <p className="t-small" style={{ color: 'var(--red-core)', marginBottom: '16px' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} />{submitError}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)} disabled={submitting}>
              <i className="fa-solid fa-arrow-left" /> Atrás
            </button>
            <button className="btn btn-filled" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</>
                : <><i className="fa-solid fa-check" /> Crear cartera</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
