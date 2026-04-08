const BASE    = 'https://finnhub.io/api/v1'
const API_KEY = process.env.FINNHUB_API_KEY ?? ''

export interface StockQuote {
  ticker:         string
  current:        number  // c — precio actual
  previousClose:  number  // pc — cierre anterior
}

export interface StockProfile {
  ticker:  string
  name:    string
  sector:  string   // finnhubIndustry
  country: string
  logo:    string
}

/**
 * Obtiene el perfil de un ticker desde Finnhub /stock/profile2.
 * Respuesta cacheada 1 hora por Next.js fetch cache.
 * Devuelve null si el ticker no existe o hay error de red.
 */
export async function getStockProfile(ticker: string): Promise<StockProfile | null> {
  if (!API_KEY) return null

  try {
    const res = await fetch(
      `${BASE}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${API_KEY}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null

    const data = await res.json()

    // Finnhub devuelve {} para tickers desconocidos
    if (!data || !data.name) return null

    return {
      ticker,
      name:    data.name             ?? ticker,
      sector:  data.finnhubIndustry  || 'Sin clasificar',
      country: data.country          || 'Sin clasificar',
      logo:    data.logo             ?? '',
    }
  } catch {
    return null
  }
}

/**
 * Obtiene el precio actual y cierre anterior de un ticker desde Finnhub /quote.
 * Sin cache — se llama en tiempo real para el P&L diario.
 * Devuelve null si el ticker no existe o hay error de red.
 */
export async function getQuote(ticker: string): Promise<StockQuote | null> {
  if (!API_KEY) return null

  try {
    const res = await fetch(
      `${BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${API_KEY}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null

    const data = await res.json()
    if (!data || typeof data.c !== 'number' || data.c === 0) return null

    return {
      ticker,
      current:       data.c,
      previousClose: data.pc,
    }
  } catch {
    return null
  }
}

/**
 * Obtiene quotes de múltiples tickers en paralelo.
 * Los tickers sin quote quedan ausentes del mapa resultado.
 */
export async function getQuotes(tickers: string[]): Promise<Record<string, StockQuote>> {
  const results = await Promise.all(tickers.map(t => getQuote(t)))
  const map: Record<string, StockQuote> = {}
  for (let i = 0; i < tickers.length; i++) {
    const quote = results[i]
    if (quote) map[tickers[i]] = quote
  }
  return map
}

/**
 * Obtiene perfiles de múltiples tickers en paralelo.
 * Los tickers sin perfil quedan con valores "Sin clasificar".
 */
export async function getStockProfiles(tickers: string[]): Promise<Record<string, StockProfile>> {
  const results = await Promise.all(tickers.map(t => getStockProfile(t)))
  const map: Record<string, StockProfile> = {}
  for (let i = 0; i < tickers.length; i++) {
    const profile = results[i]
    map[tickers[i]] = profile ?? {
      ticker:  tickers[i],
      name:    tickers[i],
      sector:  'Sin clasificar',
      country: 'Sin clasificar',
      logo:    '',
    }
  }
  return map
}
