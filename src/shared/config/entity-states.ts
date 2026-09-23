// src/shared/config/entity-states.ts
export type EntityStateOption = {
  value: number
  label: string
  badge: string
}

export const ENTITY_STATES: EntityStateOption[] = [
  { value: 1, label: 'Activo',     badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  { value: 0, label: 'Inactivo',   badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300' },
  { value: 2, label: 'Pendiente',  badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
  { value: 3, label: 'Suspendido', badge: 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-300' },
  { value: 4, label: 'Eliminado',  badge: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-300' },
  { value: 5, label: 'Archivado',  badge: 'bg-slate-100/30 text-slate-700 dark:text-slate-300 border-slate-300' },
]

export const getStateOption = (value: number): EntityStateOption =>
  ENTITY_STATES.find((s) => s.value === value) ?? ENTITY_STATES[1]

/**
 * Para los módulos de "Sitio Web" donde el estado es puramente binario (0/1 = se muestra o no en
 * el sitio público: Navegaciones, Secciones, Sec. Imágenes, Botones/Items/Detalles de Sección,
 * Testimonios, Tipos de Sección) — a diferencia de `ENTITY_STATES`, que sirve para módulos con un
 * estado más rico (pendiente/suspendido/eliminado/archivado, ej. Usuarios, Clientes). El
 * formulario de esos módulos usa un switch (`VisibilityToggle`), no un `<Select>`; esto es para
 * el badge de la tabla y su filtro, con el mismo lenguaje ("Mostrado"/"Oculto").
 */
export const VISIBILITY_STATES: EntityStateOption[] = [
  { value: 1, label: 'Mostrado', badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  { value: 0, label: 'Oculto',   badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300' },
]

export const getVisibilityStateOption = (value: number): EntityStateOption =>
  VISIBILITY_STATES.find((s) => s.value === value) ?? VISIBILITY_STATES[1]
