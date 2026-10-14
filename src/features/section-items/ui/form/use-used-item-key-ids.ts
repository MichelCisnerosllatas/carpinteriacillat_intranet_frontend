'use client'

// Secciones especiales cuyas tarjetas (items) están enlazadas por su clave:
//   carrusel «Muebles a medida» → 'category-<id_category>'  (ver ./category)
//   «Restauración»             → 'furniture-<id_furniture>' (ver ./restoration)
// ¿Qué ids ya tienen tarjeta en esta sección? Así el select no deja repetir uno.

import { useEffect, useState } from 'react'
import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'

/**
 * Ids (sacados de `sectionitem_key` con `getIdFromKey`) que ya tienen tarjeta en la sección,
 * sin contar el item que se edita. Si la consulta falla devuelve una lista vacía (no se bloquea nada).
 */
export function useUsedItemKeyIds(
  idSection: number | null | undefined,
  currentItemId: number | null | undefined,
  getIdFromKey: (key?: string | null) => number | null,
) {
  const [usedIds, setUsedIds] = useState<number[]>([])

  useEffect(() => {
    if (!idSection) { setUsedIds([]); return }
    let cancelled = false
    // Sin filtro de estado: una tarjeta oculta también cuenta como "ya está"
    sectionItemsService.getList({ id_section: idSection, per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled || !res.success) return
        const ids = res.data
          .filter((item) => item.id_section_item !== currentItemId)
          .map((item) => getIdFromKey(item.sectionitem_key))
          .filter((id): id is number => id != null)
        setUsedIds(ids)
      })
      .catch(() => { if (!cancelled) setUsedIds([]) })
    return () => { cancelled = true }
    // getIdFromKey es una función pura importada (no cambia): no hace falta en las dependencias
  }, [idSection, currentItemId])

  return usedIds
}
