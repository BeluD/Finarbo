'use client'

import { useState, useEffect } from 'react'

type InsightType = 'ALERT' | 'INFO' | 'POSITIVE'

interface Insight {
  id:          string
  type:        InsightType
  title:       string
  body:        string
  isUseful:    boolean | null
  dismissedAt: string | null
}

interface InsightFeedProps {
  portfolioId: string
  insights:    Insight[]
}

const TYPE_META: Record<InsightType, { icon: string; color: string; bg: string }> = {
  ALERT:    { icon: 'fa-triangle-exclamation', color: '#EF4444', bg: 'rgba(239,68,68,0.10)'   },
  INFO:     { icon: 'fa-circle-info',          color: 'var(--blue-core)', bg: 'rgba(59,130,246,0.10)' },
  POSITIVE: { icon: 'fa-circle-check',         color: 'var(--green-core)', bg: 'rgba(46,232,138,0.10)' },
}

function InsightCard({
  insight, portfolioId, onFeedback,
}: {
  insight: Insight
  portfolioId: string
  onFeedback: (id: string) => void
}) {
  const meta    = TYPE_META[insight.type]
  const [loading, setLoading] = useState(false)

  async function handleFeedback(isUseful: boolean) {
    setLoading(true)
    try {
      await fetch(`/api/portfolios/${portfolioId}/insights/${insight.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isUseful }),
      })
      onFeedback(insight.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background:   'var(--grad-dark)',
      border:       '1px solid var(--border-md)',
      borderRadius: 'var(--r-2xl)',
      padding:      '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: meta.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <i className={`fa-solid ${meta.icon}`} style={{ fontSize: '12px', color: meta.color }} />
        </div>
        <p className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.3 }}>
          {insight.title}
        </p>
      </div>

      {/* Body */}
      <p className="t-small" style={{ color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '14px' }}>
        {insight.body}
      </p>

      {/* Feedback */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="t-small" style={{ color: 'var(--text-3)', marginRight: '2px' }}>¿Fue útil?</span>

        <button
          onClick={() => handleFeedback(true)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid',
            background: insight.isUseful === true  ? 'rgba(46,232,138,0.15)' : 'transparent',
            color:      insight.isUseful === true  ? 'var(--green-core)' : 'var(--text-3)',
            borderColor: insight.isUseful === true ? 'rgba(46,232,138,0.4)' : 'var(--border-md)',
            transition: 'all 0.15s',
          }}
        >
          <i className="fa-solid fa-thumbs-up" style={{ fontSize: '10px' }} /> Sí
        </button>

        <button
          onClick={() => handleFeedback(false)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid',
            background: insight.isUseful === false ? 'rgba(239,68,68,0.12)' : 'transparent',
            color:      insight.isUseful === false ? '#EF4444' : 'var(--text-3)',
            borderColor: insight.isUseful === false ? 'rgba(239,68,68,0.3)' : 'var(--border-md)',
            transition: 'all 0.15s',
          }}
        >
          <i className="fa-solid fa-thumbs-down" style={{ fontSize: '10px' }} /> No
        </button>
      </div>
    </div>
  )
}

export default function InsightFeed({ portfolioId, insights: initial }: InsightFeedProps) {
  const [insights, setInsights] = useState(initial)

  useEffect(() => {
    setInsights(initial)
  }, [initial])

  function handleFeedback(id: string) {
    setInsights(prev => prev.filter(i => i.id !== id))
  }

  const visible = insights.filter(i => !i.dismissedAt)

  if (visible.length === 0) {
    return (
      <div style={{
        background: 'var(--grad-dark)', border: '1px solid var(--border-md)',
        borderRadius: 'var(--r-2xl)', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      }}>
        <i className="fa-solid fa-lightbulb" style={{ fontSize: '24px', color: 'var(--text-3)' }} />
        <p className="t-body" style={{ color: 'var(--text-3)', textAlign: 'center', maxWidth: '240px' }}>
          Los insights aparecen al correr el análisis de la cartera.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {visible.map(i => (
        <InsightCard
          key={i.id}
          insight={i}
          portfolioId={portfolioId}
          onFeedback={handleFeedback}
        />
      ))}
    </div>
  )
}
