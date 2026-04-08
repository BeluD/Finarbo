import { NextResponse }   from 'next/server'
import { auth }           from '@/auth'
import { prisma }         from '@/lib/prisma'
import Anthropic          from '@anthropic-ai/sdk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

type Params = { params: Promise<{ id: string }> }

const HORIZON_LABEL: Record<string, string> = {
  SHORT:  'menos de 1 año',
  MEDIUM: '1 a 5 años',
  LONG:   'más de 5 años',
}

const RISK_LABEL: Record<string, string> = {
  PRESERVE: 'Conservador — prefiere no perder capital aunque gane poco',
  BALANCED: 'Moderado — busca crecimiento equilibrado',
  GROWTH:   'Arriesgado — maximizar ganancias aceptando volatilidad',
}

const OBJECTIVE_LABEL: Record<string, string> = {
  GROW_SAVINGS:          'hacer crecer los ahorros',
  SPECIFIC_GOAL:         'ahorrar para un objetivo específico',
  LIVE_FROM_INVESTMENTS: 'vivir de las inversiones',
  OTHER:                 'otro objetivo personal',
}

// ─── Helpers ────────────────────────────────────────────────

function buildPrompt(
  positions:     { ticker: string; quantity: number; avgBuyPrice: number; value: number; peso: number }[],
  totalBasis:    number,
  currency:      string,
  riskTolerance: string,
  horizon:       string,
  objective:     string,
  objectiveText: string | null,
): string {
  const posLines = positions
    .map(p =>
      `- ${p.ticker}: ${p.quantity} unidades @ ${p.avgBuyPrice.toFixed(2)} ${currency} · valor total ${p.value.toFixed(2)} ${currency} · peso ${p.peso.toFixed(1)}%`
    )
    .join('\n')

  const objectiveDesc = objective === 'OTHER' && objectiveText
    ? objectiveText
    : OBJECTIVE_LABEL[objective] ?? objective

  return `Sos un asesor financiero amigable. Analizá la siguiente cartera de inversión y generá entre 3 y 5 insights en español argentino, claros y sin jerga financiera, que sean accionables para el inversor.

DATOS DE LA CARTERA:
Balance efectivo total: ${totalBasis.toFixed(2)} ${currency}
Perfil de riesgo: ${RISK_LABEL[riskTolerance] ?? riskTolerance}
Horizonte de inversión: ${HORIZON_LABEL[horizon] ?? horizon}
Objetivo: ${objectiveDesc}

POSICIONES (ordenadas por peso):
${posLines}

INSTRUCCIONES:
- Generá exactamente un JSON array con objetos de esta forma:
  [{"type": "ALERT"|"INFO"|"POSITIVE", "title": "...", "body": "..."}]
- "type" debe ser ALERT (algo riesgoso o preocupante), INFO (observación neutral) o POSITIVE (algo que está bien).
- "title": máximo 6 palabras, directo.
- "body": máximo 2 oraciones, en lenguaje llano, que expliquen el problema o la oportunidad y qué podría hacer el inversor.
- No uses palabras como "portafolio", "asset", "rebalancear", "diversificación" en inglés.
- Respondé únicamente con el array JSON, sin bloques de código ni explicaciones adicionales.`
}

// ─── POST /api/portfolios/[id]/analyze ──────────────────────

export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })

  const { id } = await params

  // 1. Traer cartera con posiciones y KYC
  const portfolio = await prisma.portfolio.findUnique({
    where:   { id },
    include: { positions: true, kyc: true },
  })

  if (!portfolio)                           return NextResponse.json({ error: 'No encontrada' },  { status: 404 })
  if (portfolio.userId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  if (!portfolio.kyc)                       return NextResponse.json({ error: 'KYC incompleto' }, { status: 400 })
  if (portfolio.positions.length === 0)     return NextResponse.json({ error: 'Sin posiciones' }, { status: 400 })

  // 2. Calcular valores, pesos y score de riesgo
  const totalBasis = portfolio.positions.reduce((s, p) => s + p.quantity * p.avgBuyPrice, 0)
  const enriched   = portfolio.positions
    .map(p => ({
      ticker:      p.ticker,
      quantity:    p.quantity,
      avgBuyPrice: p.avgBuyPrice,
      value:       p.quantity * p.avgBuyPrice,
      peso:        totalBasis > 0 ? (p.quantity * p.avgBuyPrice / totalBasis) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  // Risk score: concentración (HHI normalizado) + factor de tolerancia declarada
  const hhi = enriched.reduce((s, p) => s + (p.peso / 100) ** 2, 0) // 1/n a 1
  const toleranceFactor: Record<string, number> = {
    PRESERVE: 0.20,
    BALANCED: 0.50,
    GROWTH:   0.80,
  }
  const baseFactor  = toleranceFactor[portfolio.kyc.riskTolerance] ?? 0.50
  const totalRiskScore = Math.min(1, hhi * 0.5 + baseFactor * 0.5)

  const alertLevel = (score: number): 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' => {
    if (score < 0.20) return 'VERY_LOW'
    if (score < 0.40) return 'LOW'
    if (score < 0.60) return 'MEDIUM'
    if (score < 0.80) return 'HIGH'
    return 'VERY_HIGH'
  }

  // 3. Llamar a Claude
  const prompt = buildPrompt(
    enriched,
    totalBasis,
    portfolio.kyc.currency,
    portfolio.kyc.riskTolerance,
    portfolio.kyc.horizon,
    portfolio.kyc.objective,
    portfolio.kyc.objectiveText ?? null,
  )

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  let rawText: string
  try {
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages:   [{ role: 'user', content: prompt }],
    })
    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Respuesta inesperada de Claude')
    rawText = block.text.trim()
  } catch (err) {
    console.error('[analyze] Anthropic error:', err)
    return NextResponse.json({ error: 'Error al llamar a Claude' }, { status: 502 })
  }

  // 4. Parsear respuesta JSON
  let parsed: { type: string; title: string; body: string }[]
  try {
    const clean = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    parsed = JSON.parse(clean)
    if (!Array.isArray(parsed)) throw new Error('No es un array')
  } catch (err) {
    console.error('[analyze] JSON parse error:', err, '\nRaw:', rawText)
    return NextResponse.json({ error: 'Respuesta inválida de Claude' }, { status: 502 })
  }

  const VALID_TYPES = new Set(['ALERT', 'INFO', 'POSITIVE'])
  const validInsights = parsed.filter(i => i.title && i.body && VALID_TYPES.has(i.type))

  if (validInsights.length === 0) {
    return NextResponse.json({ error: 'No se generaron insights válidos' }, { status: 502 })
  }

  // 5a. Guardar snapshot de riesgo
  await prisma.analysisSnapshot.create({
    data: {
      portfolioId:         id,
      totalRiskScore,
      portfolioAlertLevel: alertLevel(totalRiskScore),
    },
  })

  // 5b. Guardar insights (reemplazar anteriores no descartados)
  await prisma.insight.deleteMany({
    where: { portfolioId: id, dismissedAt: null },
  })

  const created = await prisma.insight.createMany({
    data: validInsights.map(i => ({
      portfolioId: id,
      type:        i.type as 'ALERT' | 'INFO' | 'POSITIVE',
      title:       i.title,
      body:        i.body,
    })),
  })

  // 6. Devolver los insights recién creados
  const insights = await prisma.insight.findMany({
    where:   { portfolioId: id, dismissedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ count: created.count, insights })
}
