// Secciones cuyo contenido son trabajos de la Galería (`web_works`) y no items/imágenes propios.
// Su detalle tiene la pestaña "Trabajos" (si `web_settings.tab_works` está activo). Lo que cambia
// entre una y otra (qué trabajos lista y los textos) vive acá, no en el componente.

import { RESTORATION_COMPARE_TYPE_KEY, WORK_GALLERY_TYPE_KEY } from '@/features/sectionimages/grouped'
import { RESTORATION_KEY } from '@/features/web-works'

export type SectionWorksConfig = {
  /**
   * 'manage' = la pestaña lista y administra los trabajos (Restauración).
   * 'summary' = solo resumen (total, visibles, por tipo) + enlaces a Galería → Trabajos y a
   * Apariencia (Galería: muestra TODOS los trabajos, se administran en su propia pantalla).
   */
  mode: 'manage' | 'summary'
  /** `typework_key` que lista la pestaña (y con el que se crea / ordena). `null` = todos los tipos. */
  typeworkKey: string | null
  /** Título de la lista, ej. "Trabajos de restauración". */
  title: string
  /** Ayuda corta: qué trabajos muestra la web en esta sección. */
  description: string
  /** Texto cuando todavía no hay trabajos. */
  emptyText: string
  /** Badge del tipo en cada fila (solo tiene sentido si se listan varios tipos). */
  showTypeBadge: boolean
  /** La web solo muestra el trabajo si tiene al menos un par Antes/Después visible. */
  requiresPairs: boolean
}

const SECTION_WORKS_CONFIG: Record<string, SectionWorksConfig> = {
  [RESTORATION_COMPARE_TYPE_KEY]: {
    mode: 'manage',
    typeworkKey: RESTORATION_KEY,
    title: 'Trabajos de restauración',
    description: 'La web muestra aquí las restauraciones visibles que tengan al menos un par Antes/Después visible, en este orden.',
    emptyText: 'Todavía no hay trabajos de restauración.',
    showTypeBadge: false,
    requiresPairs: true,
  },
  [WORK_GALLERY_TYPE_KEY]: {
    mode: 'summary',
    typeworkKey: null,
    title: 'Trabajos de la galería',
    description: 'La web muestra aquí todos los trabajos visibles (Fabricación y Restauración), en el orden de Galería → Trabajos, con filtro por tipo.',
    emptyText: 'Todavía no hay trabajos en la galería.',
    showTypeBadge: true,
    requiresPairs: false,
  },
}

/** Config de la pestaña "Trabajos" para ese tipo de sección, o `null` si la sección no muestra trabajos. */
export function getSectionWorksConfig(typesectionKey?: string | null): SectionWorksConfig | null {
  return (typesectionKey && SECTION_WORKS_CONFIG[typesectionKey]) || null
}
