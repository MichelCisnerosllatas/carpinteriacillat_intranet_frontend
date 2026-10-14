'use client'

import { useEffect, useState } from 'react'
import { sectionImagesService } from '../services/sectionimages.service'
import type { SectionImage } from '../data/schema'
import { getImageRoles, type ImageRole, type ImageRoleInput } from './image-roles'
import { getSectionItemHeading, useSectionItemsMap } from './use-section-items-map'

/**
 * Rol (Principal / Oculta...) e item ("01 · Título") de UNA foto, para el detalle.
 * Para saber su rol hay que mirar las demás fotos de su sección, así que se piden aquí.
 */
export function useSectionImageRole(image: SectionImage | null): { role: ImageRole | null; itemHeading: string | null } {
  const idSection = image?.idSection ?? 0
  const [siblings, setSiblings] = useState<ImageRoleInput[]>([])
  const itemsMap = useSectionItemsMap(idSection ? [idSection] : [])

  // Todas las fotos de la sección (máx. 100, igual que la pantalla de reordenar)
  useEffect(() => {
    if (!idSection) return
    let cancelled = false
    sectionImagesService.getList({ id_section: idSection, per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled || !res.success) return
        setSiblings(res.data.map((i) => ({
          id: i.id_section_image,
          idSection,
          idSectionItem: i.id_section_item ?? null,
          order: i.sectionimage_order,
          stateValue: i.sectionimage_state,
        })))
      })
      .catch(() => { /* sin rol si falla: no es crítico */ })
    return () => { cancelled = true }
  }, [idSection, image?.id])

  if (!image || siblings.length === 0) return { role: null, itemHeading: null }

  const sectionItems = itemsMap[idSection]
  const hasItems = (sectionItems?.length ?? 0) > 0 || siblings.some((s) => s.idSectionItem != null)
  const role = getImageRoles(siblings, () => hasItems)[image.id] ?? null
  const itemHeading = image.idSectionItem != null
    ? getSectionItemHeading(sectionItems, image.idSectionItem, image.sectionItemTitle)
    : null

  return { role, itemHeading }
}
