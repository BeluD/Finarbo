import { NextResponse }    from 'next/server'
import { auth }           from '@/auth'
import { parsePositions } from '@/lib/parsePositions'

// POST /api/parse-positions — parsea el archivo y devuelve las posiciones sin guardar
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No se recibió archivo.' }, { status: 400 })

  try {
    const buffer    = await file.arrayBuffer()
    const positions = parsePositions(buffer)
    return NextResponse.json({ count: positions.length, positions })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 })
  }
}
