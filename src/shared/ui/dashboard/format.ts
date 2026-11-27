// Formateadores numéricos para dashboards y reportes.
// Todos usan la configuración regional de Perú (es-PE) para que montos, porcentajes y
// cantidades se lean igual en toda la intranet (ej. "S/ 1,234.50").

export type Currency = 'PEN' | 'USD'

const LOCALE = 'es-PE'

// El backend puede devolver montos como número o como string decimal ("120.50"):
// esta función los convierte de forma segura y devuelve 0 si el valor no es numérico.
export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Monto con símbolo de moneda. `compact` sirve para ejes de gráficos ("S/ 12 mil"),
// donde no hay espacio para el número completo.
export function formatMoney(
  value: number | string | null | undefined,
  currency: Currency = 'PEN',
  options: { compact?: boolean } = {}
): string {
  const amount = toNumber(value)
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    notation: options.compact ? 'compact' : 'standard',
    minimumFractionDigits: options.compact ? 0 : 2,
    maximumFractionDigits: options.compact ? 1 : 2,
  }).format(amount)
}

// Cantidad entera o con decimales fijos (ej. 1,250 o 4.5).
export function formatNumber(value: number | string | null | undefined, decimals = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(toNumber(value))
}

// El backend envía porcentajes ya multiplicados por 100 (ej. 12.5 = 12.5 %).
// Puede venir null cuando el divisor es 0: en ese caso no hay porcentaje que mostrar.
export function formatPercent(
  value: number | string | null | undefined,
  options: { decimals?: number; signed?: boolean } = {}
): string {
  if (value === null || value === undefined || value === '') return '—'
  const { decimals = 1, signed = false } = options
  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(toNumber(value) / 100)
}

// Fecha de negocio "Y-m-d" → "18/11/2026". Se parsea a mano (no con new Date("2026-11-18"))
// porque el navegador la interpretaría como UTC y podría mostrar el día anterior.
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}
