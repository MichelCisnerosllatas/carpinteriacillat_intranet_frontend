'use client'

// SOLO para «Restauración» (restoration_compare) al EDITAR.
// Arma los valores iniciales de la tarjeta "Fotos del trabajo" a partir de la foto que se edita:
//   1) pide las fotos de la sección y se queda con las de SU trabajo (id_section_item), visibles y ocultas.
//   2) bloque "Antes" = la 1ª con variant 'before' (por orden); "Después" = la 1ª con 'after'.
//      La foto editada SIEMPRE va en su bloque (si hay varias del mismo tipo, gana la editada).
//   3) mueble del select: el del enlace '/gallery/<id>' de las fotos; si no, el del trabajo
//      (clave 'furniture-<id>'); si no, sin mueble.
// Las demás fotos del trabajo (si hay más de una por tipo) no se tocan.

import { useEffect, useState } from 'react'
import { toastWarning } from '@/shared/lib/toast'
import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'
import { sectionImagesService } from '../../../services/sectionimages.service'
import { mapSectionImageFromApi } from '../../../stores/useSectionImageListStore'
import { sortByOrder } from '../../../lib/image-roles'
import type { SectionImage } from '../../../data/schema'
import {
  getFurnitureIdFromLink, getFurnitureIdFromRestorationKey, isRestorationPhotoVariant, type RestorationPhotoVariant,
} from '../../../grouped'
import { emptyRestorationSlot, type RestorationPairInitial, type RestorationSlotValue } from './use-restoration-pair'

/** Foto guardada → valor de un bloque. Sin foto → bloque vacío. */
function toSlot(photo: SectionImage | null): RestorationSlotValue {
  if (!photo) return emptyRestorationSlot()
  return {
    // Si vino de un mueble ('/gallery/<id>') se muestra como foto del mueble; si no, el banco
    source: getFurnitureIdFromLink(photo.link) != null ? 'furniture' : 'bank',
    idImage: photo.idImage,
    imageUrl: photo.imageUrl || null,
    imageName: photo.imageName,
    link: photo.link ?? '',
    caption: photo.title ?? '',
  }
}

/**
 * Función pura: valores iniciales del par.
 * `edited` = la foto que se edita (datos frescos); `workPhotos` = fotos de su trabajo;
 * `workFurnitureId` = mueble del trabajo (de su clave) o null.
 */
export function buildRestorationEditInitial(
  edited: SectionImage,
  workPhotos: SectionImage[],
  workFurnitureId: number | null,
): RestorationPairInitial {
  // Las demás fotos del trabajo, en orden (la editada se usa tal cual llegó)
  const others = sortByOrder(workPhotos.filter((p) => p.id !== edited.id))

  // Bloque de la foto editada: su tipo. Si no tiene uno válido (dato viejo), el 1º bloque libre.
  const editedVariant: RestorationPhotoVariant = isRestorationPhotoVariant(edited.variant)
    ? edited.variant
    : others.some((p) => p.variant === 'before') ? 'after' : 'before'

  /** Foto de un bloque: la editada si es su bloque; si no, la 1ª de ese tipo. */
  const pick = (variant: RestorationPhotoVariant): SectionImage | null =>
    variant === editedVariant ? edited : others.find((p) => p.variant === variant) ?? null

  const before = pick('before')
  const after = pick('after')

  // Mueble: el del enlace (primero la editada), si no el del trabajo, si no ninguno
  const furnitureId =
    getFurnitureIdFromLink(edited.link) ??
    getFurnitureIdFromLink(before?.link) ??
    getFurnitureIdFromLink(after?.link) ??
    workFurnitureId

  return {
    furnitureId,
    before: toSlot(before),
    after: toSlot(after),
    ids: { before: before?.id ?? null, after: after?.id ?? null },
    states: { before: before?.stateValue ?? 1, after: after?.stateValue ?? 1 },
  }
}

/**
 * Pide lo necesario y devuelve los valores iniciales (null mientras carga).
 * `edited` = la foto que se edita, o null si todavía no llegó (o la sección no es Restauración).
 */
export function useRestorationEditInitial(edited: SectionImage | null): RestorationPairInitial | null {
  const [initial, setInitial] = useState<RestorationPairInitial | null>(null)

  useEffect(() => {
    setInitial(null)
    if (!edited) return
    let cancelled = false
    const idItem = edited.idSectionItem

    const load = async () => {
      let workPhotos: SectionImage[] = []
      let workFurnitureId: number | null = null

      // Sin trabajo ("Ninguno") solo se carga la foto editada
      if (idItem != null) {
        // 1) Fotos de la sección (todas: visibles y ocultas; máx. 100 como en Reordenar) → las de este trabajo
        try {
          const res = await sectionImagesService.getList({ id_section: edited.idSection, per_page: 100, page: 1 })
          if (res.success) {
            workPhotos = res.data.map(mapSectionImageFromApi).filter((p) => p.idSectionItem === idItem)
          } else {
            toastWarning('No se pudieron cargar las otras fotos del trabajo', 'Solo se muestra la foto que estás editando.')
          }
        } catch {
          toastWarning('No se pudieron cargar las otras fotos del trabajo', 'Solo se muestra la foto que estás editando.')
        }

        // 2) Trabajo: su clave 'furniture-<id>' dice el mueble (si falla, sin mueble: no es crítico)
        try {
          const res = await sectionItemsService.getById(idItem)
          if (res.success) workFurnitureId = getFurnitureIdFromRestorationKey(res.data.sectionitem_key)
        } catch { /* sin mueble del trabajo */ }
      }

      if (!cancelled) setInitial(buildRestorationEditInitial(edited, workPhotos, workFurnitureId))
    }

    void load()
    return () => { cancelled = true }
    // Solo cuando cambia la foto que se edita (no en cada render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edited?.id])

  return initial
}
