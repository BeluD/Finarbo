import { notFound }    from 'next/navigation'
import { auth }        from '@/auth'
import { prisma }      from '@/lib/prisma'
import Link            from 'next/link'
import RiskChart       from '@/components/analysis/RiskChart'
import AssetTable      from '@/components/analysis/AssetTable'
import MetricCard      from '@/components/analysis/MetricCard'
import InsightFeed     from '@/components/analysis/InsightFeed'
import { RiskTolerance }    from '@/components/portfolio/PortfolioCard'
import RiskBadge            from '@/components/ui/RiskBadge'
import TooltipIcon          from '@/components/ui/TooltipIcon'
import AnalyzeButton        from '@/components/analysis/AnalyzeButton'
import { getStockProfiles, getQuotes } from '@/lib/finnhub'

type Props = { params: Promise<{ id: string }> }

export default async function PortfolioPage({ params }: Props) {
  const { id }  = await params
  const session = await auth()

  const portfolio = await prisma.portfolio.findUnique({
    where:   { id },
    include: {
      kyc:       true,
      positions: true,
      snapshots: { orderBy: { createdAt: 'asc' } },
      insights:  { where: { dismissedAt: null }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!portfolio || portfolio.userId !== session?.user?.id) notFound()

  const currency  = portfolio.kyc?.currency ?? 'USD'
  const tolerance = portfolio.kyc?.riskTolerance as RiskTolerance | undefined

  // Enrich positions with Finnhub sector/country (cached 1h) + real-time quotes
  const tickers  = [...new Set(portfolio.positions.map(p => p.ticker))]
  const [profiles, quotes] = await Promise.all([
    getStockProfiles(tickers),
    getQuotes(tickers),
  ])

  const enrichedPositions = portfolio.positions.map(p => ({
    id:          p.id,
    ticker:      p.ticker,
    quantity:    p.quantity,
    avgBuyPrice: p.avgBuyPrice,
    name:        profiles[p.ticker]?.name    ?? p.ticker,
    sector:      profiles[p.ticker]?.sector  ?? 'Sin clasificar',
    country:     profiles[p.ticker]?.country ?? 'Sin clasificar',
  }))

  const costBasis = enrichedPositions.reduce((s, p) => s + p.quantity * p.avgBuyPrice, 0)

  // P&L diario: sum((current - prevClose) × quantity) para posiciones con quote
  const dailyPnlValue = portfolio.positions.reduce((sum, p) => {
    const q = quotes[p.ticker]
    if (!q) return sum
    return sum + (q.current - q.previousClose) * p.quantity
  }, 0)

  const prevClosePortfolioValue = portfolio.positions.reduce((sum, p) => {
    const q = quotes[p.ticker]
    if (!q) return sum
    return sum + q.previousClose * p.quantity
  }, 0)

  const dailyPnl = prevClosePortfolioValue > 0
    ? {
        value:    dailyPnlValue,
        percent:  (dailyPnlValue / prevClosePortfolioValue) * 100,
        currency: currency as string,
      }
    : null
  const snapshots  = portfolio.snapshots.map(s => ({
    createdAt:           s.createdAt.toISOString(),
    totalRiskScore:      s.totalRiskScore,
    portfolioAlertLevel: s.portfolioAlertLevel as any,
  }))
  const insights = portfolio.insights.map(i => ({
    id:          i.id,
    type:        i.type as any,
    title:       i.title,
    body:        i.body,
    isUseful:    i.isUseful,
    dismissedAt: i.dismissedAt?.toISOString() ?? null,
  }))

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/home"
          className="t-small"
          style={{ color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: '10px' }} /> Mis carteras
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{
                fontFamily:    'var(--serif)',
                fontSize:      'clamp(24px, 4vw, 36px)',
                fontWeight:    700,
                color:         'var(--text-1)',
                letterSpacing: '-0.025em',
                lineHeight:    1.15,
              }}>
                {portfolio.name}
              </h1>
              <RiskBadge riskTolerance={tolerance ?? null} />
            </div>
            <p className="t-body" style={{ color: 'var(--text-2)' }}>
              {portfolio.positions.length} posiciones · {currency}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '4px' }}>
            <Link href={`/portfolio/${id}/edit`} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
              <i className="fa-solid fa-pen" /> Editar cartera
            </Link>
            <AnalyzeButton portfolioId={id} />
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
        gap:                 '24px',
        alignItems:          'start',
      }}>

        {/* ═══ LEFT COLUMN ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Asset table card */}
          <div style={{
            background: 'var(--grad-dark)', border: '1px solid var(--border-md)',
            borderRadius: 'var(--r-2xl)', overflow: 'hidden',
          }}>
            <AssetTable positions={enrichedPositions} currency={currency} />
          </div>

        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Balance efectivo */}
          <MetricCard
            title="Balance efectivo"
            tooltip="Representa el dinero que ingresaste a esta cartera, independientemente de cómo se valorizaron los activos."
            value={costBasis.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            suffix={currency}
            accent="green"
          />

          {/* Ganancia / Pérdida diaria */}
          <MetricCard
            title="Ganancia / Pérdida diaria"
            tooltip="Variación del valor total de tu cartera en el día de hoy respecto al cierre anterior."
            pnl={dailyPnl}
            placeholder="No se pudieron obtener precios de mercado"
          />

          {/* Insights */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <h2 className="t-h3" style={{ color: 'var(--text-1)' }}>Insights</h2>
              <span className="chip" style={{ background: 'var(--green-soft)', color: 'var(--green-core)', border: '1px solid var(--green-glow)' }}>
                {insights.length}
              </span>
            </div>
            <InsightFeed portfolioId={id} insights={insights} />
          </div>

        </div>
      </div>
    </div>
  )
}
