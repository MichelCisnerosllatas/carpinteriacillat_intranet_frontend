import {
  formatMoney,
  formatNumber,
  formatPercent,
  formatShortDate,
  toNumber,
  type Currency,
} from '@/shared/ui/dashboard'
import type { ReportValueType } from '../model/report.dto'

// Formatea un valor según el `type` que manda el backend (columnas, KPIs, campos del detalle).
export function formatReportCell(value: unknown, type: ReportValueType, currency: Currency): string {
  if (value === null || value === undefined || value === '') return '—'

  switch (type) {
    case 'money':
      return formatMoney(toNumber(value), currency)
    case 'number': {
      // Cantidades pueden ser decimales (ej. 2.5 m²); los enteros se muestran sin ",00".
      const n = toNumber(value)
      return formatNumber(n, Number.isInteger(n) ? 0 : 2)
    }
    case 'percent':
      return formatPercent(toNumber(value))
    case 'date':
      return formatShortDate(String(value))
    default:
      return String(value)
  }
}

// Formato corto para ejes de gráficos ("S/ 12 mil"), donde no entra el número completo.
export function formatReportAxis(value: number, type: ReportValueType, currency: Currency): string {
  if (type === 'money') return formatMoney(value, currency, { compact: true })
  if (type === 'percent') return formatPercent(value, { decimals: 0 })
  return formatNumber(value)
}

// Las columnas numéricas se alinean a la derecha para que las cifras se puedan comparar.
export function isNumericColumn(type: ReportValueType): boolean {
  return type === 'money' || type === 'number' || type === 'percent'
}
