// src/features/sale-goals/data/data.ts

export const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const SALE_GOAL_CURRENCIES = [
  { value: 'PEN', label: 'Soles (S/)' },
  { value: 'USD', label: 'Dólares ($)' },
]

/** Años que se ofrecen en el selector: el anterior, el actual y los dos siguientes. */
export function getGoalYearOptions(): number[] {
  const current = new Date().getFullYear()
  return [current - 1, current, current + 1, current + 2]
}
