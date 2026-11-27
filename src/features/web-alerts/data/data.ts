// Opciones fijas de las alertas del sitio, con sus textos en español y sus colores.
// Los valores (`value`) son los mismos que guarda el backend: no cambiarlos.

import { CircleCheck, Info, Star, TriangleAlert, type LucideIcon } from 'lucide-react'

/** Colores (estilos) de la barra. `barClass` imita los colores que usa la web. */
export const ALERT_STYLES: { value: string; label: string; barClass: string; icon: LucideIcon }[] = [
  { value: 'promo',   label: 'Promoción',   barClass: 'bg-gradient-to-r from-red-600 to-red-700 text-white',       icon: Star },
  { value: 'info',    label: 'Información', barClass: 'bg-gradient-to-r from-sky-600 to-blue-700 text-white',      icon: Info },
  { value: 'warning', label: 'Aviso',       barClass: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900', icon: TriangleAlert },
  { value: 'success', label: 'Éxito',       barClass: 'bg-gradient-to-r from-emerald-600 to-green-700 text-white', icon: CircleCheck },
]

/** Busca un color por su valor. Si no lo encuentra, devuelve "Información". */
export const getAlertStyle = (value: string) =>
  ALERT_STYLES.find((s) => s.value === value) ?? ALERT_STYLES[1]

/** Alineación de todo el contenido de la barra. */
export const ALERT_ALIGNS = [
  { value: 'left',   label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right',  label: 'Derecha' },
]

/** Lo que aparece al final de la barra (a la derecha del texto). */
export const ALERT_TRAILINGS = [
  { value: 'none',   label: 'Nada' },
  { value: 'arrow',  label: 'Flecha' },
  { value: 'button', label: 'Botón con texto' },
]

/** Qué hace la barra cuando el cliente baja por la página. */
export const ALERT_SCROLL_BEHAVIORS = [
  { value: 'hide',   label: 'Se oculta al bajar' },
  { value: 'sticky', label: 'Se queda visible' },
]

/** Estado de visibilidad que calcula el backend (con su hora), con el color de su etiqueta. */
export const ALERT_VISIBILITY_STATUSES = [
  { value: 'showing',   label: 'Se está mostrando', badge: 'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-300' },
  { value: 'scheduled', label: 'Programada',        badge: 'bg-sky-100/40 text-sky-900 dark:text-sky-200 border-sky-300' },
  { value: 'expired',   label: 'Vencida',           badge: 'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300' },
  { value: 'off',       label: 'Desactivada',       badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300' },
]

/** Busca un estado de visibilidad por su valor. Si no lo encuentra, devuelve "Desactivada". */
export const getAlertVisibilityStatus = (value: string) =>
  ALERT_VISIBILITY_STATUSES.find((s) => s.value === value) ?? ALERT_VISIBILITY_STATUSES[3]

/**
 * Cuántas alertas muestra la web como máximo a la vez (las primeras según el orden).
 * Debe coincidir con MAX_VISIBLE_ALERTS del sitio público (features/site-alerts).
 */
export const MAX_ALERTS_ON_WEB = 3

/** Filtro de la lista por el interruptor "Activada". */
export const ALERT_STATES = [
  { value: 1, label: 'Activadas' },
  { value: 0, label: 'Desactivadas' },
]
