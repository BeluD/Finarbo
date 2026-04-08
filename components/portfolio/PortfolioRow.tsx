import Link from 'next/link'
import { PortfolioCardData, RiskTolerance, RISK_TOLERANCE_LABEL } from './PortfolioCard'

const TOLERANCE_COLOR: Record<RiskTolerance, string> = {
  PRESERVE: 'var(--green-core)',
  BALANCED: '#F59E0B',
  GROWTH:   '#EF4444',
}

const COL_L = 'var(--text-3)'  // header color
const COLS  = '2fr 1fr 1fr 1.2fr 72px'  // grid template

export function PortfolioTableHeader() {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: COLS,
      gap:                 '12px',
      padding:             '10px 20px',
      borderBottom:        '1px solid var(--border-md)',
    }}>
      <span className="t-label" style={{ color: COL_L }}>NOMBRE</span>
      <span className="t-label" style={{ color: COL_L, textAlign: 'right' }}>RIESGO</span>
      <span className="t-label" style={{ color: COL_L, textAlign: 'right' }}>VALOR TOTAL</span>
      <span className="t-label" style={{ color: COL_L, textAlign: 'right' }}>ÚLTIMA ACT.</span>
      <span className="t-label" style={{ color: COL_L, textAlign: 'right' }}>ACCIONES</span>
    </div>
  )
}

export default function PortfolioRow({
  id, name, currency, costBasis, riskTolerance, updatedAt,
}: PortfolioCardData) {
  const badgeColor = riskTolerance ? TOLERANCE_COLOR[riskTolerance] : null

  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: COLS,
      gap:                 '12px',
      padding:             '13px 20px',
      borderBottom:        '1px solid var(--border-md)',
      alignItems:          'center',
    }}>
      {/* NOMBRE */}
      <span className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>{name}</span>

      {/* RIESGO */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {riskTolerance && badgeColor ? (
          <span style={{
            display:      'inline-flex',
            alignItems:   'center',
            padding:      '3px 10px',
            borderRadius: '999px',
            fontSize:     '11px',
            fontWeight:   600,
            lineHeight:   1.4,
            background:   `${badgeColor}20`,
            color:        badgeColor,
            border:       `1px solid ${badgeColor}40`,
          }}>
            {RISK_TOLERANCE_LABEL[riskTolerance]}
          </span>
        ) : (
          <span className="t-small" style={{ color: 'var(--text-3)' }}>—</span>
        )}
      </div>

      {/* VALOR TOTAL */}
      <div style={{ textAlign: 'right' }}>
        <span className="t-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>
          {costBasis.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="t-small" style={{ color: 'var(--text-3)', marginLeft: '4px' }}>{currency}</span>
      </div>

      {/* ÚLTIMA ACTUALIZACIÓN */}
      <span className="t-small" style={{ color: 'var(--text-3)', textAlign: 'right' }}>
        {new Date(updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>

      {/* ACCIONES — icon buttons circulares */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        {/* Editar — outline */}
        <Link
          href={`/portfolio/${id}/edit`}
          title="Editar"
          style={{
            width:          '32px',
            height:         '32px',
            borderRadius:   '50%',
            border:         '1px solid var(--border-md)',
            background:     'transparent',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            color:          'var(--text-2)',
            textDecoration: 'none',
            flexShrink:     0,
          }}
        >
          <i className="fa-solid fa-pen" style={{ fontSize: '11px' }} />
        </Link>

        {/* Ver análisis — gradiente brand */}
        <Link
          href={`/portfolio/${id}`}
          title="Ver análisis"
          style={{
            width:          '32px',
            height:         '32px',
            borderRadius:   '50%',
            border:         'none',
            background:     'var(--grad-brand)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            color:          '#09090E',
            textDecoration: 'none',
            flexShrink:     0,
          }}
        >
          <i className="fa-solid fa-chart-line" style={{ fontSize: '11px' }} />
        </Link>
      </div>
    </div>
  )
}
