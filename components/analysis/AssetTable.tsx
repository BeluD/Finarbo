'use client'

import { useState } from 'react'

export interface EnrichedPosition {
  id:          string
  ticker:      string
  name:        string
  quantity:    number
  avgBuyPrice: number
  sector:      string
  country:     string
}

interface AssetTableProps {
  positions: EnrichedPosition[]
  currency:  string
}

type Tab = 'principales' | 'sector' | 'paises'

const TABS: { id: Tab; label: string }[] = [
  { id: 'principales', label: 'Principales' },
  { id: 'sector',      label: 'Por sector'  },
  { id: 'paises',      label: 'Por países'  },
]

// ─── Helpers ─────────────────────────────────────────────────

function TickerAvatar({ ticker }: { ticker: string }) {
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      background: 'var(--green-soft)', border: '1px solid var(--green-glow)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontWeight: 700, fontSize: '13px', color: 'var(--green-core)',
    }}>
      {ticker[0]}
    </div>
  )
}

function colHeader(label: string, right = false) {
  return (
    <span className="t-label" style={{ color: 'var(--text-3)', textAlign: right ? 'right' : 'left' }}>
      {label}
    </span>
  )
}

// ─── Accordion group (sector / country) ──────────────────────

function AccordionGroup({
  label, positions, totalBasis, currency,
}: {
  label:      string
  positions:  EnrichedPosition[]
  totalBasis: number
  currency:   string
}) {
  const [open, setOpen] = useState(false)

  const groupValue = positions.reduce((s, p) => s + p.quantity * p.avgBuyPrice, 0)
  const groupPeso  = totalBasis > 0 ? (groupValue / totalBasis) * 100 : 0

  return (
    <div style={{ borderBottom: '1px solid var(--border-md)' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'grid', gridTemplateColumns: '1fr auto 20px',
          gap: '16px', width: '100%', padding: '13px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          alignItems: 'center', textAlign: 'left',
        }}
      >
        <span className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>{label}</span>
        <span className="t-body" style={{ color: 'var(--text-2)', fontWeight: 500, textAlign: 'right' }}>
          {groupPeso.toFixed(1)}%
        </span>
        <i
          className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`}
          style={{ fontSize: '11px', color: 'var(--text-3)', textAlign: 'right' }}
        />
      </button>

      {/* Expanded rows */}
      {open && (
        <div style={{ background: 'rgba(255,255,255,0.02)' }}>
          {positions
            .map(p => ({ ...p, value: p.quantity * p.avgBuyPrice }))
            .sort((a, b) => b.value - a.value)
            .map(p => {
              const peso = totalBasis > 0 ? (p.value / totalBasis) * 100 : 0
              return (
                <div key={p.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  gap: '16px', padding: '10px 20px 10px 28px',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TickerAvatar ticker={p.ticker} />
                    <div>
                      <p className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.2 }}>
                        {p.ticker}
                      </p>
                      <p className="t-small" style={{ color: 'var(--text-3)', marginTop: '1px' }}>
                        {p.name !== p.ticker ? p.name : `${p.quantity.toLocaleString('es-AR')} unidades`}
                      </p>
                    </div>
                  </div>
                  <span className="t-body" style={{ color: 'var(--text-2)', fontWeight: 500, textAlign: 'right', minWidth: '60px' }}>
                    {peso.toFixed(1)}%
                  </span>
                  <div style={{ textAlign: 'right', minWidth: '110px' }}>
                    <span className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                      {p.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="t-small" style={{ color: 'var(--text-3)', marginLeft: '4px' }}>{currency}</span>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

// ─── Grouped view ─────────────────────────────────────────────

function GroupedView({
  positions, groupKey, currency,
}: {
  positions: EnrichedPosition[]
  groupKey:  'sector' | 'country'
  currency:  string
}) {
  const totalBasis = positions.reduce((s, p) => s + p.quantity * p.avgBuyPrice, 0)

  const groups: Record<string, EnrichedPosition[]> = {}
  for (const p of positions) {
    const key = p[groupKey] || 'Sin clasificar'
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }

  const sorted = Object.entries(groups).sort((a, b) => {
    const sumA = a[1].reduce((s, p) => s + p.quantity * p.avgBuyPrice, 0)
    const sumB = b[1].reduce((s, p) => s + p.quantity * p.avgBuyPrice, 0)
    return sumB - sumA
  })

  return (
    <div>
      {sorted.map(([label, items]) => (
        <AccordionGroup
          key={label}
          label={label}
          positions={items}
          totalBasis={totalBasis}
          currency={currency}
        />
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AssetTable({ positions, currency }: AssetTableProps) {
  const [tab, setTab] = useState<Tab>('principales')

  const totalBasis = positions.reduce((s, p) => s + p.quantity * p.avgBuyPrice, 0)
  const sorted     = [...positions]
    .map(p => ({ ...p, value: p.quantity * p.avgBuyPrice }))
    .sort((a, b) => b.value - a.value)

  return (
    <div>
      {/* ── Tabs ── */}
      <div className="tabs" style={{ marginBottom: 0, borderBottom: '1px solid var(--border-md)', padding: '0 4px' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Principales ── */}
      {tab === 'principales' && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 70px 130px',
            gap: '16px', padding: '10px 20px',
            borderBottom: '1px solid var(--border-md)',
          }}>
            {colHeader('ACTIVO')}
            {colHeader('PESO', true)}
            {colHeader('VALOR', true)}
          </div>

          {sorted.map(p => {
            const peso = totalBasis > 0 ? (p.value / totalBasis) * 100 : 0
            return (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 70px 130px',
                gap: '16px', padding: '12px 20px', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TickerAvatar ticker={p.ticker} />
                  <div>
                    <p className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.2 }}>
                      {p.ticker}
                    </p>
                    <p className="t-small" style={{ color: 'var(--text-3)', marginTop: '1px' }}>
                      {p.name !== p.ticker ? p.name : `${p.quantity.toLocaleString('es-AR')} unidades`}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="t-body" style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                    {peso.toFixed(1)}%
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                    {p.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="t-small" style={{ color: 'var(--text-3)', marginLeft: '4px' }}>{currency}</span>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* ── Por sector ── */}
      {tab === 'sector' && (
        <GroupedView positions={positions} groupKey="sector" currency={currency} />
      )}

      {/* ── Por países ── */}
      {tab === 'paises' && (
        <GroupedView positions={positions} groupKey="country" currency={currency} />
      )}
    </div>
  )
}
