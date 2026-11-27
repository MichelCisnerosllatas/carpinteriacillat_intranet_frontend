// Rangos rápidos de fechas para los filtros de dashboards y reportes.
// Se calculan en el navegador y se envían al backend como "Y-m-d".

export type DateRangePreset =
  | 'this_month'
  | 'last_month'
  | 'last_7'
  | 'last_30'
  | 'last_90'
  | 'this_year'
  | 'custom'

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_month', label: 'Mes anterior' },
  { value: 'last_7', label: 'Últimos 7 días' },
  { value: 'last_30', label: 'Últimos 30 días' },
  { value: 'last_90', label: 'Últimos 90 días' },
  { value: 'this_year', label: 'Este año' },
  { value: 'custom', label: 'Personalizado' },
]

export type DateRange = { dateFrom: string; dateTo: string }

// Date → "Y-m-d" usando la fecha LOCAL. No se usa toISOString() porque convierte a UTC y,
// de noche en Perú (UTC-5), devolvería el día siguiente.
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function daysAgo(today: Date, days: number): Date {
  const date = new Date(today)
  date.setDate(date.getDate() - days)
  return date
}

export function getPresetRange(preset: DateRangePreset, today: Date = new Date()): DateRange {
  const year = today.getFullYear()
  const month = today.getMonth()

  switch (preset) {
    case 'last_month':
      // new Date(año, mes, 0) = último día del mes anterior.
      return { dateFrom: toIsoDate(new Date(year, month - 1, 1)), dateTo: toIsoDate(new Date(year, month, 0)) }
    case 'last_7':
      return { dateFrom: toIsoDate(daysAgo(today, 6)), dateTo: toIsoDate(today) }
    case 'last_30':
      return { dateFrom: toIsoDate(daysAgo(today, 29)), dateTo: toIsoDate(today) }
    case 'last_90':
      return { dateFrom: toIsoDate(daysAgo(today, 89)), dateTo: toIsoDate(today) }
    case 'this_year':
      return { dateFrom: toIsoDate(new Date(year, 0, 1)), dateTo: toIsoDate(today) }
    case 'this_month':
    case 'custom':
    default:
      return { dateFrom: toIsoDate(new Date(year, month, 1)), dateTo: toIsoDate(today) }
  }
}

// Un rango personalizado puede quedar a medio llenar mientras el usuario escribe:
// solo se consulta al backend cuando ambas fechas existen y están en orden.
export function isValidRange(range: DateRange): boolean {
  return Boolean(range.dateFrom && range.dateTo && range.dateFrom <= range.dateTo)
}
