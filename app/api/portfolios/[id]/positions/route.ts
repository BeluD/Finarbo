import { NextResponse }   from 'next/server'
import { auth }          from '@/auth'
import { prisma }        from '@/lib/prisma'
import { parsePositions } from '@/lib/parsePositions'

type Params = { params: Promise<{ id: string }> }

// POST /api/portfolios/[id]/positions
// Reemplaza todas las posiciones del portfolio con las del archivo subido.
export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.portfolio.findUnique({ where: { id }, select: { userId: true } })
  if (!existing)                           return NextResponse.json({ error: 'No encontrada.' }, { status: 404 })
  if (existing.userId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No se recibió archivo.' }, { status: 400 })

  const allowed = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
  if (!allowed.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
    return NextResponse.json({ error: 'Solo se aceptan archivos CSV o Excel (.xlsx, .xls).' }, { status: 415 })
  }

  let positions
  try {
    const buffer = await file.arrayBuffer()
    positions    = parsePositions(buffer)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 })
  }

  // Reemplaza posiciones en una transacción
  await prisma.$transaction([
    prisma.position.deleteMany({ where: { portfolioId: id } }),
    prisma.position.createMany({
      data: positions.map((p) => ({
        portfolioId: id,
        ticker:      p.ticker,
        quantity:    p.quantity,
        avgBuyPrice: p.avgBuyPrice,
      })),
    }),
  ])

  return NextResponse.json({ count: positions.length, positions })
}
