'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

type AlertLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

interface Snapshot {
  createdAt:          string
  totalRiskScore:     number
  portfolioAlertLevel: AlertLevel
}

interface RiskChartProps {
  snapshots: Snapshot[]
}

const ALERT_LABEL: Record<AlertLevel, string> = {
  VERY_LOW:  'Muy bajo',
  LOW:       'Bajo',
  MEDIUM:    'Medio',
  HIGH:      'Alto',
  VERY_HIGH: 'Muy alto',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const snap = payload[0]?.payload as Snapshot & { dateLabel: string }
  return (
    <div style={{
      background: '#1E2138', border: '1px solid rgba(255,255,255,0.13)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '12px',
    }}>
      <p style={{ color: 'var(--text-3)', marginBottom: '4px' }}>{snap.dateLabel}</p>
      <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '15px' }}>
        {(snap.totalRiskScore * 100).toFixed(0)}
        <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '11px', marginLeft: '4px' }}>/ 100</span>
      </p>
      <p style={{ color: 'var(--text-3)', marginTop: '2px' }}>
        Riesgo {ALERT_LABEL[snap.portfolioAlertLevel]}
      </p>
    </div>
  )
}

export default function RiskChart({ snapshots }: RiskChartProps) {
  if (snapshots.length < 2) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '200px', gap: '10px',
      }}>
        <i className="fa-solid fa-chart-line" style={{ fontSize: '28px', color: 'var(--text-3)' }} />
        <p className="t-body" style={{ color: 'var(--text-3)', textAlign: 'center', maxWidth: '280px' }}>
          No hay historial de riesgo aún. Corré el análisis para empezar a registrar la evolución.
        </p>
      </div>
    )
  }

  const data = [...snapshots]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(s => ({
      ...s,
      score:     Math.round(s.totalRiskScore * 100),
      dateLabel: new Date(s.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateShort: new Date(s.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="dateShort"
          tick={{ fill: 'var(--text-3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={{ fill: 'var(--text-3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
        <ReferenceLine y={50} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 4" />
        <ReferenceLine y={75} stroke="rgba(239,68,68,0.3)"  strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--green-core)"
          strokeWidth={2}
          dot={{ fill: 'var(--green-core)', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--green-core)', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
