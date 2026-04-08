import * as XLSX from 'xlsx'
import { ParsedPosition } from '@/types'

/**
 * Parsea un archivo CSV o XLSX y devuelve las posiciones normalizadas.
 * Formato esperado de columnas (case-insensitive):
 *   abrev | cant | cotizacion (opcional) | pppCompra
 */
export function parsePositions(buffer: ArrayBuffer): ParsedPosition[] {
  const workbook  = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet     = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  })

  if (rows.length === 0) throw new Error('El archivo está vacío.')

  // Normalizar headers: minúsculas sin espacios
  const normalize = (s: string) => String(s).toLowerCase().replace(/\s+/g, '')

  const positions: ParsedPosition[] = []

  for (const [i, row] of rows.entries()) {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([k, v]) => [normalize(k), v])
    )

    const ticker      = String(normalized['abrev'] ?? normalized['ticker'] ?? '').trim().toUpperCase()
    const quantityRaw = normalized['cant']       ?? normalized['quantity'] ?? normalized['cantidad'] ?? ''
    const priceRaw    = normalized['pppcompra']  ?? normalized['ppcompra'] ?? normalized['preciopromedio'] ?? normalized['avgbuyprice'] ?? ''

    if (!ticker) throw new Error(`Fila ${i + 2}: falta la columna "abrev" (ticker).`)

    const quantity    = parseFloat(String(quantityRaw).replace(',', '.'))
    const avgBuyPrice = parseFloat(String(priceRaw).replace(',', '.'))

    if (isNaN(quantity) || quantity <= 0)
      throw new Error(`Fila ${i + 2} (${ticker}): "cant" inválido — recibido: "${quantityRaw}".`)

    if (isNaN(avgBuyPrice) || avgBuyPrice < 0)
      throw new Error(`Fila ${i + 2} (${ticker}): "pppCompra" inválido — recibido: "${priceRaw}".`)

    positions.push({ ticker, quantity, avgBuyPrice })
  }

  if (positions.length === 0) throw new Error('No se encontraron posiciones válidas en el archivo.')

  return positions
}
