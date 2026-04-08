import Link              from 'next/link'
import { auth }          from '@/auth'
import { prisma }        from '@/lib/prisma'
import PortfolioList     from '@/components/portfolio/PortfolioList'
import { PortfolioCardData } from '@/components/portfolio/PortfolioCard'

export const metadata = { title: 'Mis carteras — Finarbo' }

export default async function HomePage() {
  const session = await auth()
  const name    = session?.user?.name ?? 'Inversora'

  const rows = session?.user?.id
    ? await prisma.portfolio.findMany({
        where:   { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          kyc:       true,
          positions: { select: { id: true, quantity: true, avgBuyPrice: true } },
          snapshots: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      })
    : []

  const portfolios: PortfolioCardData[] = rows.map(p => ({
    id:                    p.id,
    name:                  p.name,
    positionCount:         p.positions.length,
    currency:              p.kyc?.currency    ?? 'USD',
    costBasis:             p.positions.reduce((sum, pos) => sum + pos.quantity * pos.avgBuyPrice, 0),
    riskTolerance:         (p.kyc?.riskTolerance ?? null) as import('@/components/portfolio/PortfolioCard').RiskTolerance | null,
    calculatedRiskProfile: p.calculatedRiskProfile,
    totalRiskScore:        p.snapshots[0]?.totalRiskScore ?? null,
    portfolioAlertLevel:   p.snapshots[0]?.portfolioAlertLevel ?? null,
    lastAnalysis:          p.snapshots[0]?.createdAt.toISOString() ?? null,
    updatedAt:             p.updatedAt.toISOString(),
  }))

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="t-h1" style={{ color: 'var(--text-1)', marginBottom: '4px' }}>
          Hola, {name}.
        </h1>
        <p className="t-body" style={{ color: 'var(--text-2)' }}>
          {portfolios.length > 0
            ? `Tenés ${portfolios.length} ${portfolios.length === 1 ? 'cartera' : 'carteras'}.`
            : 'Tus carteras de inversión.'
          }
        </p>
      </div>

      {portfolios.length === 0 ? (
        /* ── Empty state ── */
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fa-solid fa-file-arrow-up" aria-hidden="true" style={{ fontSize: '28px', color: 'var(--green-core)' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 700,
            color: 'var(--text-1)', marginBottom: '10px', letterSpacing: '-0.015em',
          }}>
            Empezá a ver tu análisis
          </h2>
          <p className="t-body" style={{ color: 'var(--text-2)', maxWidth: '380px', marginBottom: '28px' }}>
            Para ver el estado de tus inversiones, subí tu primera cartera.
            Solo necesitás un archivo CSV o Excel con tus posiciones.
          </p>
          <Link href="/portfolio/new" className="btn btn-filled">
            <i className="fa-solid fa-file-arrow-up" />
            Subir cartera
          </Link>
        </div>
      ) : (
        /* ── Portfolio list with toggle ── */
        <PortfolioList portfolios={portfolios} />
      )}
    </div>
  )
}
