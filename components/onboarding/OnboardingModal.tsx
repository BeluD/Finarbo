'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const STEPS = [
  {
    icon: 'fa-file-arrow-up',
    title: 'Subí tu cartera',
    body:  'Importá un CSV o Excel con tus posiciones actuales.',
  },
  {
    icon: 'fa-chart-line',
    title: 'Análisis automático',
    body:  'Calculamos riesgo, concentración y rendimiento de tus activos.',
  },
  {
    icon: 'fa-bolt',
    title: 'Informe en palabras',
    body:  'Recibís un análisis en lenguaje coloquial, sin términos complejos.',
  },
]

export default function OnboardingModal({ hasPortfolios }: { hasPortfolios: boolean }) {
  const { data: session, update } = useSession()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (session?.user?.showOnboarding || !hasPortfolios) setVisible(true)
  }, [session?.user?.showOnboarding, hasPortfolios])

  async function dismiss() {
    setVisible(false)
    if (session?.user?.showOnboarding) {
      await fetch('/api/user/onboarding', { method: 'PATCH' })
      await update({ showOnboarding: false })
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-title"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         50,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '24px',
        background:     'rgba(9,9,14,0.75)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="onb-card" style={{ maxWidth: '460px', width: '100%' }}>
        {/* Glow */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            bottom:     '-50px',
            right:      '-50px',
            width:      '200px',
            height:     '200px',
            background: 'radial-gradient(circle, rgba(46,232,138,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <p className="t-label" style={{ color: 'var(--green-core)', marginBottom: '10px' }}>
            <i className="fa-solid fa-bolt" aria-hidden="true" style={{ marginRight: '6px' }} />
            Bienvenido a Finarbo
          </p>
          <h1
            id="onb-title"
            style={{
              fontFamily:    'var(--serif)',
              fontSize:      '24px',
              fontWeight:    800,
              color:         'var(--text-1)',
              lineHeight:    1.2,
              marginBottom:  '10px',
            }}
          >
            Tu cartera, explicada<br />en palabras.
          </h1>
          <p className="t-body" style={{ color: 'var(--text-2)', maxWidth: '360px' }}>
            Finarbo analiza tus activos y te da una visión clara del riesgo
            y rendimiento real de tus inversiones, sin jerga financiera.
          </p>
        </div>

        {/* Steps */}
        <div className="col" style={{ gap: '12px', marginBottom: '24px', position: 'relative' }}>
          {STEPS.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                aria-hidden="true"
                style={{
                  width:          '26px',
                  height:         '26px',
                  borderRadius:   '50%',
                  background:     'var(--green-soft)',
                  border:         '1px solid rgba(46,232,138,0.22)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '11px',
                  fontWeight:     700,
                  color:          'var(--green-core)',
                  flexShrink:     0,
                }}
              >
                {idx + 1}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '2px' }}>
                  {step.title}
                </p>
                <p className="t-small" style={{ color: 'var(--text-2)' }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={dismiss}
            style={{ color: 'rgba(240,244,255,0.6)' }}
          >
            Omitir
          </button>
          <button
            className="btn btn-filled"
            onClick={dismiss}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Comenzar
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
