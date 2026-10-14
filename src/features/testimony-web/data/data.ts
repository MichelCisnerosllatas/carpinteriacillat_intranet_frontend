import { VISIBILITY_STATES, getVisibilityStateOption, type EntityStateOption } from '@/shared/config/entity-states'

/**
 * `testimony_rating` es un número de 0 a 5 con un decimal (ej. 4.5) — el mismo rango/paso que
 * el input del form usa (`step="0.5"`). Estas constantes evitan repetir esos límites en el form
 * y en cualquier otro lugar que necesite validarlos o formatearlos.
 */
export const TESTIMONY_RATING_MIN = 0
export const TESTIMONY_RATING_MAX = 5
export const TESTIMONY_RATING_STEP = 0.5

/** Estado de una reseña nueva enviada desde la web: queda esperando que el admin la apruebe. */
export const TESTIMONY_STATE_PENDING = 2

/**
 * Estados de un testimonio: los de visibilidad (Mostrado/Oculto) + "Pendiente" (2),
 * que es como llegan las reseñas que deja un cliente desde la web.
 */
export const TESTIMONY_STATES: EntityStateOption[] = [
  ...VISIBILITY_STATES,
  { value: TESTIMONY_STATE_PENDING, label: 'Pendiente', badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
]

/** Opción de estado (label + color del badge) de un testimonio. */
export function getTestimonyStateOption(value: number): EntityStateOption {
  return TESTIMONY_STATES.find((s) => s.value === value) ?? getVisibilityStateOption(value)
}

/** Formatea el rating para mostrarlo en tablas/detalle — `null` cae en "—" en vez de "0". */
export function formatTestimonyRating(value: number | null): string {
  if (value == null) return '—'
  return value.toFixed(1)
}
