'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Hook que trae los items de la sección (servicios / categorías), activos e inactivos.
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useCallback, useEffect, useState } from 'react'
import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'

/**
 * Items de la sección: activos E inactivos, ordenados por sectionitem_order.
 * `reload()` los vuelve a pedir y devuelve la lista nueva.
 */
export function useGroupItems(idSection: number) {
  const [items, setItems] = useState<SectionItemApiItem[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  const reload = useCallback(async (): Promise<SectionItemApiItem[]> => {
    try {
      // Sin filtro de estado: así también salen los items ocultos
      const res = await sectionItemsService.getList({ id_section: idSection, per_page: 100, page: 1 })
      if (!res.success) return []
      const sorted = [...res.data].sort((a, b) => (a.sectionitem_order ?? 0) - (b.sectionitem_order ?? 0))
      setItems(sorted)
      return sorted
    } catch {
      return []
    } finally {
      setHasLoaded(true)
    }
  }, [idSection])

  useEffect(() => { void reload() }, [reload])

  return { items, hasLoaded, reload }
}
