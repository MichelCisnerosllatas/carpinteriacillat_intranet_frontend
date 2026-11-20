// El backend (Laravel) puede devolver montos decimales como string ("120.50") porque así los
// entrega MySQL. Recharts y los formateadores necesitan números reales, así que convertimos
// UNA sola vez al recibir la respuesta en vez de hacer Number() en cada gráfico.
//
// Solo se convierten claves numéricas conocidas: así un texto que parezca número
// (ej. una versión de app "1.0" o un código) nunca se transforma por error.
const NUMERIC_KEYS = new Set([
  'total',
  'amount',
  'balance',
  'goal',
  'achieved',
  'remaining',
  'quantity',
  'average_ticket',
  'goal_amount',
  'testimonies_avg_rating',
])

function isNumericKey(key: string): boolean {
  return NUMERIC_KEYS.has(key) || key.endsWith('_total') || key.endsWith('_pct')
}

export function normalizeAmounts<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeAmounts(item)) as T
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (isNumericKey(key) && typeof item === 'string' && item.trim() !== '') {
        const parsed = Number(item)
        result[key] = Number.isFinite(parsed) ? parsed : item
      } else {
        result[key] = normalizeAmounts(item)
      }
    }
    return result as T
  }
  return value
}
