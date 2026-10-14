'use client'

import { useEffect, useState } from 'react'
import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'

/** Items de cada sección: { [idSection]: items ordenados por sectionitem_order }. */
export type SectionItemsMap = Record<number, SectionItemApiItem[]>

/** Pide los items (activos) de UNA sección. Si falla, devuelve [] para no romper la pantalla. */
async function fetchSectionItems(idSection: number): Promise<SectionItemApiItem[]> {
  try {
    const res = await sectionItemsService.getForSelect(idSection)
    if (!res.success) return []
    return [...res.data].sort((a, b) => (a.sectionitem_order ?? 0) - (b.sectionitem_order ?? 0))
  } catch {
    return []
  }
}

/**
 * Trae los items de las secciones indicadas (una petición por sección, solo la primera vez).
 * Se usa para poner el encabezado "01 · Título del item" en los grupos de fotos.
 */
export function useSectionItemsMap(sectionIds: number[]): SectionItemsMap {
  const [map, setMap] = useState<SectionItemsMap>({})

  // Clave estable (ids únicos y ordenados) para no repetir el efecto en cada render
  const key = Array.from(new Set(sectionIds.filter((id) => id > 0))).sort((a, b) => a - b).join(',')

  useEffect(() => {
    const missing = key ? key.split(',').map(Number).filter((id) => !(id in map)) : []
    if (missing.length === 0) return

    let cancelled = false
    Promise.all(missing.map(async (id) => ({ id, items: await fetchSectionItems(id) })))
      .then((results) => {
        if (cancelled) return
        setMap((prev) => {
          const next = { ...prev }
          results.forEach((r) => { next[r.id] = r.items })
          return next
        })
      })
    return () => { cancelled = true }
  }, [key])

  return map
}

/** Texto de un item: título > label > key > "Item #id". */
export function getSectionItemName(item: SectionItemApiItem): string {
  return item.sectionitem_title || item.sectionitem_label || item.sectionitem_key || `Item #${item.id_section_item}`
}

/**
 * Encabezado de un item: "01 · Muebles a medida" (número = posición del item en su sección).
 * Si el item no está en la lista (ej. está inactivo), usa el título que vino con la foto.
 */
export function getSectionItemHeading(
  items: SectionItemApiItem[] | undefined,
  idSectionItem: number,
  fallbackTitle: string | null,
): string {
  const index = items ? items.findIndex((i) => i.id_section_item === idSectionItem) : -1
  if (index < 0) return fallbackTitle || `Item #${idSectionItem}`
  return `${String(index + 1).padStart(2, '0')} · ${getSectionItemName(items![index])}`
}
