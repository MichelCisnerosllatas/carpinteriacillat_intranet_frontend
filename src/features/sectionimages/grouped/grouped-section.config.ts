// Configuración de cada "sección especial" que usa la vista agrupada de fotos (acordeón por item).
// Los componentes de grouped/ui reciben UNO de estos objetos y de ahí sacan los textos y las reglas.
// Así el hero de Servicios y el carrusel de categorías comparten las mismas pantallas.
// Ver grouped/README.md.

import { CATEGORY_COVERFLOW_TYPE_KEY, SERVICE_SHOWCASE_TYPE_KEY } from './special-sections.constants'

export type GroupedSectionConfig = {
  /** `sectionitem_type` de los items de esta sección. */
  itemType: string

  // ── Cómo se llama cada item (con su género: "el servicio" / "la categoría") ──
  itemLabel: string    // 'Servicio'
  itemLower: string    // 'servicio'
  theItem: string      // 'el servicio'
  ofTheItem: string    // 'del servicio'
  thisItem: string     // 'este servicio'
  hiddenLabel: string  // 'Oculto' / 'Oculta'
  unnamedItem: string  // 'Servicio sin nombre'

  // ── Textos de la pestaña Imágenes ──
  tabTitle: string
  tabDescription: string
  /** Aviso extra (opcional) arriba de la lista. */
  helpText?: string
  emptyItemsText: string
  noPhotosText: string
  unassignedTitle: string
  /** Dónde NO se muestran las fotos sin item (ej. "Estas fotos no se muestran en el hero."). */
  unassignedHelp: string
  /** Qué hacer con ellas (ej. "Edítalas para asignarlas a un servicio."). */
  unassignedAssignHint: string

  // ── Items desde la pestaña Imágenes ──
  /** 'inline' = botón que abre un input para escribir el nombre; 'form' = va al formulario de item. */
  addItemMode: 'inline' | 'form'
  addItemLabel: string
  /** Placeholder del input (solo modo 'inline'). */
  addItemPlaceholder?: string
  /** true = el nombre del item se puede cambiar con el lápiz del encabezado. */
  canRenameInline: boolean
  /** Opción del menú ⋮ del item (en la pestaña Imágenes): abre el formulario del item. */
  editItemLabel: string
  deleteItemLabel: string
  deletedToast: string

  /**
   * Regla SOLO del hero de Servicios: un item sin fotos visibles se oculta solo, un item nuevo
   * nace oculto y el switch no se puede encender sin fotos visibles.
   * (En el carrusel no aplica: sin fotos propias la web usa las de sus trabajos.)
   */
  hideItemWithoutVisiblePhotos: boolean

  /**
   * Pestaña "Items" del detalle de la sección con nombre propio (ej. "Categorías").
   * Si viene, esa pestaña va ANTES de Imágenes (Info general | <label> | Imágenes).
   * Si no viene (hero), la pestaña se llama "Items" y queda en su lugar de siempre.
   */
  itemsTab?: {
    label: string    // texto de la pestaña
    tooltip: string  // ayuda al pasar el mouse
    title: string    // título dentro de la pestaña
  }

  /**
   * "Fotos automáticas": las que la WEB usa cuando una tarjeta no tiene fotos propias visibles
   * (ver lib/auto-photos.ts): fotos de los trabajos publicados de la Galería de esa categoría (máx. 4).
   * El intranet las muestra (badge "De un trabajo") con el botón "Personalizar fotos".
   * Solo el carrusel de categorías; el hero no tiene (false).
   */
  autoPhotos: boolean
}

/** Configuración por `typesection_key`. */
export const GROUPED_SECTION_CONFIG: Record<string, GroupedSectionConfig> = {
  // Hero de la página Servicios: cada item es un servicio con sus fotos
  [SERVICE_SHOWCASE_TYPE_KEY]: {
    itemType: 'showcase',
    itemLabel: 'Servicio',
    itemLower: 'servicio',
    theItem: 'el servicio',
    ofTheItem: 'del servicio',
    thisItem: 'este servicio',
    hiddenLabel: 'Oculto',
    unnamedItem: 'Servicio sin nombre',
    tabTitle: 'Fotos del hero de Servicios',
    tabDescription:
      'La 1ª foto visible de cada servicio es la principal (la web muestra todas las visibles). Marca varias fotos para ocultarlas, mostrarlas o eliminarlas juntas. Para agregar fotos usa «Agregar imagen» y elige el servicio; para cambiar el orden usa «Reordenar».',
    emptyItemsText: 'Esta sección aún no tiene servicios. Agrega el primero con el botón de abajo.',
    noPhotosText: 'Sin fotos. Usa «Agregar imagen» (arriba) y elige este servicio.',
    unassignedTitle: 'Sin servicio asignado',
    unassignedHelp: 'Estas fotos no se muestran en el hero.',
    unassignedAssignHint: 'Edítalas para asignarlas a un servicio.',
    addItemMode: 'inline',
    addItemLabel: 'Agregar nuevo servicio',
    addItemPlaceholder: 'Nombre del servicio, ej. Muebles a medida',
    canRenameInline: true,
    editItemLabel: 'Editar descripción y botón',
    deleteItemLabel: 'Eliminar servicio',
    deletedToast: 'Servicio eliminado',
    hideItemWithoutVisiblePhotos: true,
    autoPhotos: false,
  },

  // Carrusel «Muebles a medida» de Servicios: cada item es una categoría (tarjeta)
  [CATEGORY_COVERFLOW_TYPE_KEY]: {
    itemType: 'category',
    itemLabel: 'Categoría',
    itemLower: 'categoría',
    theItem: 'la categoría',
    ofTheItem: 'de la categoría',
    thisItem: 'esta categoría',
    hiddenLabel: 'Oculta',
    unnamedItem: 'Categoría sin nombre',
    tabTitle: 'Fotos del carrusel «Muebles a medida»',
    tabDescription:
      'La 1ª foto visible de cada categoría es la principal de su tarjeta. Marca varias fotos para ocultarlas, mostrarlas o eliminarlas juntas. Para agregar fotos usa «Agregar imagen» y elige la categoría; para cambiar el orden usa «Reordenar».',
    helpText: 'Si una categoría no tiene fotos aquí, la web usa las de sus últimos trabajos publicados (Galería → Trabajos).',
    emptyItemsText: 'Esta sección aún no tiene categorías. Agrega la primera con el botón de abajo.',
    noPhotosText: 'Sin fotos propias: la web usa las de sus últimos trabajos. Usa «Agregar imagen» (arriba) para elegirlas.',
    unassignedTitle: 'Sin categoría asignada',
    unassignedHelp: 'Estas fotos no se muestran en el carrusel.',
    unassignedAssignHint: 'Edítalas para asignarlas a una categoría.',
    // El nombre sale de la categoría elegida: se agrega y cambia en el formulario de item
    addItemMode: 'form',
    addItemLabel: 'Agregar categoría',
    canRenameInline: false,
    editItemLabel: 'Cambiar categoría',
    deleteItemLabel: 'Quitar del carrusel',
    deletedToast: 'Categoría quitada del carrusel',
    hideItemWithoutVisiblePhotos: false,
    // Sin fotos propias visibles la web usa las de sus trabajos publicados (Galería)
    autoPhotos: true,
    itemsTab: {
      label: 'Categorías',
      tooltip: 'Tarjetas del carrusel: una por categoría',
      title: 'Categorías del carrusel',
    },
  },
}

/** Configuración de la sección, o null si no usa la vista agrupada. */
export function getGroupedSectionConfig(typesectionKey?: string | null): GroupedSectionConfig | null {
  if (!typesectionKey) return null
  return GROUPED_SECTION_CONFIG[typesectionKey] ?? null
}

/** Nombre a mostrar de un item (si no tiene título, "Servicio sin nombre" / "Categoría sin nombre"). */
export function getGroupItemName(config: GroupedSectionConfig, item: { sectionitem_title?: string | null }): string {
  return item.sectionitem_title?.trim() || config.unnamedItem
}

/** Primera letra en mayúscula (ej. "este servicio" → "Este servicio"). */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
