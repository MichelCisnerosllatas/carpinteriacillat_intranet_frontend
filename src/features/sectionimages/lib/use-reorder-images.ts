'use client'

import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { sectionImagesService } from '../services/sectionimages.service'
import { mapSectionImageFromApi } from '../stores/useSectionImageListStore'
import type { SectionImage } from '../data/schema'
import { sortByOrder } from './image-roles'

/**
 * Fotos de UNA sección para la pantalla "Reordenar".
 * `order` de cada foto = su posición actual en pantalla (0, 1, 2...). Al mover, se cambia este valor.
 * Nada se guarda aquí: solo se lleva el orden local y si hubo cambios.
 */
export function useReorderImages(idSection: number) {
  const [images, setImages]               = useState<SectionImage[]>([])
  // Posición original de cada foto ({ [idFoto]: order }) para saber si hubo cambios
  const [originalOrder, setOriginalOrder] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading]         = useState(true)
  const [isError, setIsError]             = useState(false)
  // Al cambiar este número se vuelven a pedir las fotos (ver reload)
  const [reloadKey, setReloadKey]         = useState(0)

  useEffect(() => {
    let cancelled = false
    sectionImagesService.getList({ id_section: idSection, per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setIsError(true); return }

        // Mismo orden que el backend y luego order = 0, 1, 2... (así no hay empates)
        const mapped = res.data.map((i) => ({ ...mapSectionImageFromApi(i), idSection }))
        const built = sortByOrder(mapped).map((img, idx) => ({ ...img, order: idx }))

        const original: Record<number, number> = {}
        built.forEach((img) => { original[img.id] = img.order })

        setImages(built)
        setOriginalOrder(original)
      })
      .catch(() => { if (!cancelled) setIsError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [idSection, reloadKey])

  /** Vuelve a pedir las fotos (se pierde el orden sin confirmar). */
  const reload = () => setReloadKey((k) => k + 1)

  const hasChanges = images.some((img) => img.order !== originalOrder[img.id])

  /**
   * Mueve `activeId` al lugar de `overId` dentro de UN grupo (`groupImages`, en el orden que se ve).
   * Las fotos de otros grupos no cambian.
   */
  const moveInGroup = (groupImages: SectionImage[], activeId: number, overId: number) => {
    const ids = groupImages.map((img) => img.id)
    const newIds = arrayMove(ids, ids.indexOf(activeId), ids.indexOf(overId))
    // Lugares (order) que ocupa el grupo, de menor a mayor: se reparten con el nuevo orden
    const slots = groupImages.map((img) => img.order ?? 0)
    setImages((prev) => prev.map((img) => {
      const idx = newIds.indexOf(img.id)
      return idx < 0 ? img : { ...img, order: slots[idx] }
    }))
  }

  return { images, isLoading, isError, hasChanges, moveInGroup, reload }
}
