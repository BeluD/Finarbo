import { NextResponse }  from 'next/server'
import { auth }         from '@/auth'
import { prisma }       from '@/lib/prisma'

type Params = { params: Promise<{ id: string; insightId: string }> }

// PATCH /api/portfolios/[id]/insights/[insightId]
// Body: { isUseful: boolean } | { dismiss: true }
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, insightId } = await params

  const insight = await prisma.insight.findUnique({
    where:   { id: insightId },
    include: { portfolio: { select: { userId: true } } },
  })
  if (!insight)                                   return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (insight.portfolio.userId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  if (insight.portfolioId !== id)                  return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const body = await req.json()

  const updated = await prisma.insight.update({
    where: { id: insightId },
    data: {
      ...(typeof body.isUseful === 'boolean' && { isUseful: body.isUseful }),
      ...(body.dismiss === true && { dismissedAt: new Date() }),
    },
  })

  return NextResponse.json(updated)
}
