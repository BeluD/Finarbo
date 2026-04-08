import { notFound }           from 'next/navigation'
import { auth }               from '@/auth'
import { prisma }             from '@/lib/prisma'
import Link                   from 'next/link'
import EditPortfolioWizard    from '@/components/portfolio/EditPortfolioWizard'
import { RiskTolerance, Horizon, Objective, Currency } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function EditPortfolioPage({ params }: Props) {
  const { id }  = await params
  const session = await auth()

  const portfolio = await prisma.portfolio.findUnique({
    where:   { id },
    include: { kyc: true, positions: true },
  })

  if (!portfolio || portfolio.userId !== session?.user?.id) notFound()
  if (!portfolio.kyc) notFound()

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <Link
          href={`/portfolio/${id}`}
          className="t-small"
          style={{ color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: '10px' }} /> Volver al análisis
        </Link>
      </div>

      <EditPortfolioWizard
        initial={{
          id,
          name:          portfolio.name,
          riskTolerance: portfolio.kyc.riskTolerance as RiskTolerance,
          horizon:       portfolio.kyc.horizon        as Horizon,
          objective:     portfolio.kyc.objective      as Objective,
          objectiveText: portfolio.kyc.objectiveText  ?? '',
          currency:      portfolio.kyc.currency       as Currency,
          positions:     portfolio.positions.map(p => ({
            ticker:      p.ticker,
            quantity:    p.quantity,
            avgBuyPrice: p.avgBuyPrice,
          })),
        }}
      />
    </div>
  )
}
