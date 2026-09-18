/**
 * `testimony_rating` es un número de 0 a 5 con un decimal (ej. 4.5) — el mismo rango/paso que
 * el input del form usa (`step="0.5"`). Estas constantes evitan repetir esos límites en el form
 * y en cualquier otro lugar que necesite validarlos o formatearlos.
 */
export const TESTIMONY_RATING_MIN = 0
export const TESTIMONY_RATING_MAX = 5
export const TESTIMONY_RATING_STEP = 0.5

/** Formatea el rating para mostrarlo en tablas/detalle — `null` cae en "—" en vez de "0". */
export function formatTestimonyRating(value: number | null): string {
  if (value == null) return '—'
  return value.toFixed(1)
}
