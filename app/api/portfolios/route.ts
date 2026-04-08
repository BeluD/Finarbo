import { NextResponse } from 'next/server'
import { auth }         from '@/auth'
import { prisma }       from '@/lib/prisma'

// GET /api/portfolios — lista las carteras del usuario autenticado
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const portfolios = await prisma.portfolio.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      kyc:       true,
      positions: { select: { id: true } },
      snapshots: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  const result = portfolios.map((p) => ({
    id:                    p.id,
    name:                  p.name,
    calculatedRiskProfile: p.calculatedRiskProfile,
    currency:              p.kyc?.currency ?? 'USD',
    positionCount:         p.positions.length,
    lastAnalysis:          p.snapshots[0]?.createdAt ?? null,
    totalRiskScore:        p.snapshots[0]?.totalRiskScore ?? null,
    portfolioAlertLevel:   p.snapshots[0]?.portfolioAlertLevel ?? null,
    kyc:                   p.kyc,
    createdAt:             p.createdAt,
  }))

  return NextResponse.json(result)
}

// POST /api/portfolios — crea una nueva cartera con KYC y posiciones
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: {
    name:          string
    riskTolerance: string
    horizon:       string
    objective:     string
    objectiveText: string | null
    currency:      string
    positions:     { ticker: string; quantity: number; avgBuyPrice: number }[]
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const { name, riskTolerance, horizon, objective, objectiveText, currency, positions } = body

  if (!name?.trim())   return NextResponse.json({ error: 'El nombre es requerido.' },   { status: 422 })
  if (!positions?.length) return NextResponse.json({ error: 'La cartera no tiene posiciones.' }, { status: 422 })

  const portfolio = await prisma.portfolio.create({
    data: {
      userId: session.user.id,
      name:   name.trim(),
      kyc: {
        create: {
          riskTolerance: riskTolerance as any,
          horizon:       horizon       as any,
          objective:     objective     as any,
          objectiveText: objectiveText ?? null,
          currency:      currency      as any,
        },
      },
      positions: {
        create: positions.map((p) => ({
          ticker:      p.ticker,
          quantity:    p.quantity,
          avgBuyPrice: p.avgBuyPrice,
        })),
      },
    },
    include: { kyc: true, positions: true },
  })

  return NextResponse.json(portfolio, { status: 201 })
}
