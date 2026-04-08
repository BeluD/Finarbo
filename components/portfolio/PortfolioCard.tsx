import Link       from 'next/link'
import RiskBadge  from '@/components/ui/RiskBadge'

type RiskProfile = 'VERY_CONSERVATIVE' | 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'VERY_AGGRESSIVE'
type AlertLevel  = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

export type RiskTolerance = 'PRESERVE' | 'BALANCED' | 'GROWTH'

export const RISK_TOLERANCE_LABEL: Record<RiskTolerance, string> = {
  PRESERVE: 'Conservador',
  BALANCED: 'Moderado',
  GROWTH:   'Arriesgado',
}

// Verde / Amarillo / Rojo
const TOLERANCE_COLOR: Record<RiskTolerance, string> = {
  PRESERVE: 'var(--green-core)',
  BALANCED: '#F59E0B',
  GROWTH:   '#EF4444',
}

export interface PortfolioCardData {
  id:                    string
  name:                  string
  positionCount:         number
  currency:              string
  costBasis:             number
  riskTolerance:         RiskTolerance | null
  calculatedRiskProfile: RiskProfile | null
  totalRiskScore:        number | null
  portfolioAlertLevel:   AlertLevel | null
  lastAnalysis:          string | null
  updatedAt:             string
}

export default function PortfolioCard({
  id, name, currency, costBasis, riskTolerance, updatedAt,
}: PortfolioCardData) {
  const formattedDate = new Date(updatedAt).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="port-card" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Top row: name + risk badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h3 className="t-h3" style={{ color: 'var(--text-1)', flex: 1, paddingRight: '10px' }}>{name}</h3>
        <RiskBadge riskTolerance={riskTolerance} />
      </div>

      {/* Date */}
      <p className="t-small" style={{ color: 'var(--text-3)', marginBottom: '20px' }}>
        Actualizado {formattedDate}
      </p>

      {/* Total value */}
      <div style={{ marginBottom: '24px' }}>
        <p className="t-label" style={{ color: 'var(--text-3)', marginBottom: '4px' }}>VALOR TOTAL</p>
        <p style={{ color: 'var(--text-1)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          {costBasis.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="t-small" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{currency}</span>
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <Link
          href={`/portfolio/${id}/edit`}
          className="btn btn-outline btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <i className="fa-solid fa-pen" /> Editar
        </Link>
        <Link
          href={`/portfolio/${id}`}
          className="btn btn-filled btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <i className="fa-solid fa-chart-line" /> Ver análisis
        </Link>
      </div>
    </div>
  )
}
