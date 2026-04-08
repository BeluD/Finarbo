import { NextResponse }             from 'next/server'
import { auth }                    from '@/auth'
import { prisma }                  from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// GET /api/portfolios/[id]
export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where:   { id },
    include: {
      kyc:       true,
      positions: true,
      snapshots: { orderBy: { createdAt: 'desc' }, take: 10 },
      insights:  { where: { dismissedAt: null }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!portfolio)                        return NextResponse.json({ error: 'No encontrada.' }, { status: 404 })
  if (portfolio.userId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  return NextResponse.json(portfolio)
}

// PATCH /api/portfolios/[id]
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.portfolio.findUnique({ where: { id }, select: { userId: true } })
  if (!existing)                          return NextResponse.json({ error: 'No encontrada.' }, { status: 404 })
  if (existing.userId !== session.user.id)   return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json()
  const { name, riskTolerance, horizon, objective, objectiveText, currency, positions } = body

  // Update name + KYC in one transaction
  const portfolio = await prisma.portfolio.update({
    where: { id },
    data:  {
      ...(name?.trim() && { name: name.trim() }),
      kyc: {
        update: {
          ...(riskTolerance  && { riskTolerance:  riskTolerance  as any }),
          ...(horizon        && { horizon:        horizon        as any }),
          ...(objective      && { objective:      objective      as any }),
          ...(currency       && { currency:       currency       as any }),
          objectiveText: objectiveText ?? null,
        },
      },
    },
    include: { kyc: true },
  })

  // Replace positions if provided
  if (Array.isArray(positions) && positions.length > 0) {
    await prisma.position.deleteMany({ where: { portfolioId: id } })
    await prisma.position.createMany({
      data: positions.map((p: { ticker: string; quantity: number; avgBuyPrice: number }) => ({
        portfolioId:  id,
        ticker:       p.ticker,
        quantity:     p.quantity,
        avgBuyPrice:  p.avgBuyPrice,
      })),
    })
  }

  return NextResponse.json(portfolio)
}

// DELETE /api/portfolios/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.portfolio.findUnique({ where: { id }, select: { userId: true } })
  if (!existing)                          return NextResponse.json({ error: 'No encontrada.' }, { status: 404 })
  if (existing.userId !== session.user.id)   return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  await prisma.portfolio.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
