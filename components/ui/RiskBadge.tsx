import { RiskTolerance, RISK_TOLERANCE_LABEL } from '@/components/portfolio/PortfolioCard'

const TOLERANCE_COLOR: Record<RiskTolerance, string> = {
  PRESERVE: 'var(--green-core)',
  BALANCED: '#F59E0B',
  GROWTH:   '#EF4444',
}

interface RiskBadgeProps {
  riskTolerance: RiskTolerance | null | undefined
}

export default function RiskBadge({ riskTolerance }: RiskBadgeProps) {
  const color = riskTolerance ? TOLERANCE_COLOR[riskTolerance] : 'var(--text-3)'
  const label = riskTolerance ? RISK_TOLERANCE_LABEL[riskTolerance] : '—'

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      padding:      '3px 10px',
      borderRadius: '999px',
      fontSize:     '11px',
      fontWeight:   600,
      lineHeight:   1.4,
      flexShrink:   0,
      background:   riskTolerance ? `${color}20` : 'var(--bg-glass)',
      color,
      border:       `1px solid ${riskTolerance ? `${color}40` : 'var(--border-subtle)'}`,
    }}>
      {label}
    </span>
  )
}
