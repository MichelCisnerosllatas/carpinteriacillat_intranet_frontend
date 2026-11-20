// Colores de series para gráficos, tomados de las variables CSS --chart-1 … --chart-8
// (definidas en shared/styles/globals.css para modo claro y oscuro).

export const CHART_COLOR_COUNT = 8

// Siempre en orden fijo: la paleta está pensada para que cada color se distinga del siguiente.
export function chartColor(index: number): string {
  return `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`
}

// Si hay más categorías que colores, las últimas se agrupan en "Otros" en vez de repetir colores
// (dos categorías del mismo color confunden al lector).
export function foldIntoOthers<T extends { label: string; value: number }>(
  items: T[],
  max = CHART_COLOR_COUNT,
  makeOther: (value: number) => T = (value) => ({ label: 'Otros', value }) as T
): T[] {
  if (items.length <= max) return items
  const visible = items.slice(0, max - 1)
  const rest = items.slice(max - 1).reduce((sum, item) => sum + item.value, 0)
  return [...visible, makeOther(rest)]
}
