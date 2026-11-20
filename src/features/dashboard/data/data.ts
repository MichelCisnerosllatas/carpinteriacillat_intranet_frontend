// Etiquetas y colores de badges usados en las tablas compactas del dashboard.
// Se definen aquí (y no se importan de features/sales) para que el dashboard no dependa
// de otra feature: el backend ya manda los estados como texto plano.

type BadgeOption = { label: string; badge: string }

const NEUTRAL = 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300'

export const SALE_STATUS_BADGES: Record<string, BadgeOption> = {
  GUARDADA: { label: 'Guardada', badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
  EMITIDA: { label: 'Emitida', badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  ANULADA: { label: 'Anulada', badge: NEUTRAL },
}

export const PAYMENT_STATUS_BADGES: Record<string, BadgeOption> = {
  PENDIENTE: { label: 'Pendiente', badge: NEUTRAL },
  PARCIAL: { label: 'Parcial', badge: 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-300' },
  PAGADO: { label: 'Pagado', badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
}

// Si llega un estado nuevo que no conocemos, se muestra tal cual con estilo neutro.
export function getBadgeOption(map: Record<string, BadgeOption>, value: string): BadgeOption {
  return map[value] ?? { label: value, badge: NEUTRAL }
}
