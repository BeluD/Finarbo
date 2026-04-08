import TooltipIcon from '@/components/ui/TooltipIcon'

interface PnL {
  value:    number  // absoluto en moneda
  percent:  number  // porcentaje (ej: 1.24 para +1.24%)
  currency: string
}

interface MetricCardProps {
  title:       string
  tooltip:     string
  /** Valor simple como string formateado. Null → mostrar placeholder. */
  value?:      string | null
  suffix?:     string
  /** Solo para la card de P&L: objeto con datos de ganancia/pérdida. */
  pnl?:        PnL | null
  placeholder?: string
  accent?:     'green' | 'blue' | 'neutral'
}

export default function MetricCard({
  title, tooltip, value, suffix, pnl, placeholder, accent = 'neutral',
}: MetricCardProps) {
  const accentColor = {
    green:   'var(--green-core)',
    blue:    'var(--blue-core)',
    neutral: 'var(--text-1)',
  }[accent]

  // P&L card
  const isPnlMode = pnl !== undefined

  const pnlColor   = pnl ? (pnl.value >= 0 ? 'var(--green-core)' : '#EF4444') : 'var(--text-3)'
  const pnlPrefix  = pnl ? (pnl.value >= 0 ? '+' : '')                          : ''

  return (
    <div style={{
      background:   'var(--grad-dark)',
      border:       '1px solid var(--border-md)',
      borderRadius: 'var(--r-2xl)',
      padding:      '20px 22px',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <p className="t-label" style={{ color: 'var(--text-3)' }}>{title.toUpperCase()}</p>
        <TooltipIcon text={tooltip} />
      </div>

      {/* P&L variant */}
      {isPnlMode && (
        pnl ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: 700, color: pnlColor, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {pnlPrefix}{pnl.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="t-small" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{pnl.currency}</span>
            </div>
            <p className="t-small" style={{ color: pnlColor, fontWeight: 600, marginTop: '4px' }}>
              {pnlPrefix}{pnl.percent.toFixed(2)}%
            </p>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-3)', lineHeight: 1 }}>—</span>
            {placeholder && (
              <p className="t-small" style={{ color: 'var(--text-3)', marginTop: '6px' }}>{placeholder}</p>
            )}
          </div>
        )
      )}

      {/* Simple value variant */}
      {!isPnlMode && (
        value != null ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '26px', fontWeight: 700, color: accentColor, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {value}
            </span>
            {suffix && (
              <span className="t-small" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{suffix}</span>
            )}
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-3)', lineHeight: 1 }}>—</span>
            {placeholder && (
              <p className="t-small" style={{ color: 'var(--text-3)', marginTop: '6px' }}>{placeholder}</p>
            )}
          </div>
        )
      )}
    </div>
  )
}
