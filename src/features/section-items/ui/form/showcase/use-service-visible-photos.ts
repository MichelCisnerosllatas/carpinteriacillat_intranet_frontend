'use client'

// SOLO para la sección hero de Servicios (service_showcase).
// ¿El servicio (item) tiene al menos una foto visible? Regla del hero: sin fotos visibles no se muestra.

import { useEffect, useState } from 'react'
import { sectionImagesService } from '@/features/sectionimages/services/sectionimages.service'

/**
 * Consulta las fotos visibles de la sección y mira si alguna es de este servicio.
 * - `hasVisiblePhotos`: true / false, o null si no hay servicio (crear) o falló la consulta.
 * - `isLoading`: todavía consultando.
 */
export function useServiceVisiblePhotos(idSection: number | null | undefined, idSectionItem: number | null | undefined) {
  const [hasVisiblePhotos, setHasVisiblePhotos] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Sin servicio guardado (ej. al crear) no hay nada que consultar
    if (!idSection || !idSectionItem) { setHasVisiblePhotos(null); return }

    let cancelled = false
    setIsLoading(true)
    sectionImagesService.getList({ id_section: idSection, state: 1, per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setHasVisiblePhotos(null); return }
        // Solo cuentan las fotos visibles de ESTE servicio
        setHasVisiblePhotos(res.data.some((p) => p.id_section_item === idSectionItem && p.sectionimage_state === 1))
      })
      .catch(() => { if (!cancelled) setHasVisiblePhotos(null) }) // si falla, no se bloquea nada
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [idSection, idSectionItem])

  return { hasVisiblePhotos, isLoading }
}
