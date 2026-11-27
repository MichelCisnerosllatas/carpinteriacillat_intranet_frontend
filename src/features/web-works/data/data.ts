import type { EntityStateOption } from '@/shared/config/entity-states'

/** Estado del trabajo en la web: 1 = visible, 0 = oculto. */
export const WEB_WORK_STATES: EntityStateOption[] = [
  { value: 1, label: 'Visible', badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  { value: 0, label: 'Oculto',  badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300' },
]

export const getWebWorkStateOption = (value: number): EntityStateOption =>
  WEB_WORK_STATES.find((s) => s.value === value) ?? WEB_WORK_STATES[1]

/** Clave del tipo que lleva pares Antes/Después (la usa el código, no se cambia). */
export const RESTORATION_KEY = 'restoration'

/** Colores del badge por clave de tipo. Las claves desconocidas usan el estilo neutro. */
export const TYPEWORK_BADGES: Record<string, string> = {
  manufacture: 'bg-sky-100/40 text-sky-900 dark:text-sky-200 border-sky-200',
  restoration: 'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-200',
}

export const getTypeWorkBadge = (key: string | null | undefined): string =>
  (key && TYPEWORK_BADGES[key]) || 'bg-muted text-muted-foreground'
