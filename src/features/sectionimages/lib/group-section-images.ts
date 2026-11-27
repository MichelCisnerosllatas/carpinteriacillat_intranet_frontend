import type { SectionImage } from '../data/schema'
import { sortByOrder } from './image-roles'
import { getSectionItemHeading, type SectionItemsMap } from './use-section-items-map'

/** Un grupo de fotos: las de UN item de la sección, o las que no tienen item. */
export type ImageItemGroup = {
  key: string
  idSectionItem: number | null
  /** "01 · Muebles a medida", "Sin item asignado" o '' (sección sin items: no lleva encabezado). */
  heading: string
  images: SectionImage[]
}

/** Las fotos de UNA sección, separadas por item. */
export type ImageSectionGroup = {
  idSection: number
  sectionName: string
  navigationName: string | null
  /** true si la sección tiene items (entonces cada foto debería pertenecer a uno). */
  hasItems: boolean
  groups: ImageItemGroup[]
}

/**
 * Agrupa las fotos por sección y, dentro de cada sección, por item.
 * - Los items van en su orden (01, 02...) y al final el grupo "Sin item asignado".
 * - `includeEmptyItems`: también crea grupos vacíos para los items que aún no tienen fotos
 *   (útil en el detalle de una sección, para poder agregarles fotos).
 */
export function groupSectionImages(
  images: SectionImage[],
  itemsMap: SectionItemsMap,
  includeEmptyItems = false,
  /** Secciones a mostrar aunque no tengan fotos (ej. la sección del detalle). */
  extraSectionIds: number[] = [],
): ImageSectionGroup[] {
  // 1) Secciones en el orden en que aparecen
  const sectionIds: number[] = [...extraSectionIds]
  images.forEach((img) => { if (!sectionIds.includes(img.idSection)) sectionIds.push(img.idSection) })

  return sectionIds.map((idSection) => {
    const sectionImages = sortByOrder(images.filter((img) => img.idSection === idSection))
    const sectionItems = itemsMap[idSection] ?? []
    const first = sectionImages[0]
    const hasItems = sectionItems.length > 0 || sectionImages.some((img) => img.idSectionItem != null)

    // Sección sin items: un único grupo sin encabezado
    if (!hasItems) {
      return {
        idSection,
        sectionName: first?.sectionName ?? '',
        navigationName: first?.navigationName ?? null,
        hasItems,
        groups: [{ key: `${idSection}-none`, idSectionItem: null, heading: '', images: sectionImages }],
      }
    }

    // 2) Ids de items a mostrar: primero los de la sección (en orden), luego los que solo vienen en fotos
    const itemIds: number[] = includeEmptyItems ? sectionItems.map((i) => i.id_section_item) : []
    sectionImages.forEach((img) => {
      if (img.idSectionItem != null && !itemIds.includes(img.idSectionItem)) itemIds.push(img.idSectionItem)
    })
    // Orden de los items según su posición en la sección (los desconocidos al final)
    const position = (id: number) => {
      const idx = sectionItems.findIndex((i) => i.id_section_item === id)
      return idx < 0 ? Number.MAX_SAFE_INTEGER : idx
    }
    itemIds.sort((a, b) => position(a) - position(b))

    const groups: ImageItemGroup[] = itemIds.map((idSectionItem) => {
      const groupImages = sectionImages.filter((img) => img.idSectionItem === idSectionItem)
      return {
        key: `${idSection}-${idSectionItem}`,
        idSectionItem,
        heading: getSectionItemHeading(sectionItems, idSectionItem, groupImages[0]?.sectionItemTitle ?? null),
        images: groupImages,
      }
    })

    // 3) Grupo final con las fotos que no tienen item
    const withoutItem = sectionImages.filter((img) => img.idSectionItem == null)
    if (withoutItem.length > 0 || includeEmptyItems) {
      groups.push({ key: `${idSection}-none`, idSectionItem: null, heading: 'Sin item asignado', images: withoutItem })
    }

    return {
      idSection,
      sectionName: first?.sectionName ?? '',
      navigationName: first?.navigationName ?? null,
      hasItems,
      groups,
    }
  })
}
