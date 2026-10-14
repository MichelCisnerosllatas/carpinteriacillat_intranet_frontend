'use client'

// SOLO carrusel «Muebles a medida» y «Restauración» (config.autoPhotos).
// Trae los muebles (una vez) y calcula las "fotos automáticas" de cada item con la regla de la web
// (auto-photos.ts). En las secciones sin fotos automáticas (hero) no pide nada.
// Ver grouped/README.md → "Fotos automáticas".

import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../data/schema'
import type { GroupedSectionConfig } from '../grouped-section.config'
import { useFurnitureJoinList } from './use-furniture-join-list'
import { getAutoPhotos, type AutoPhotosResult } from './auto-photos'

const EMPTY_RESULT: AutoPhotosResult = { photos: [], furniture: null, idFurniture: null }

export function useAutoPhotos(config: GroupedSectionConfig) {
  const mode = config.autoPhotos
  // Solo se piden los muebles si la sección usa fotos automáticas
  const { furnitures, isLoading, isError } = useFurnitureJoinList(mode != null)

  /** Fotos automáticas de un item (con sus fotos propias, para saber si hacen falta). */
  const getFor = (item: SectionItemApiItem, ownPhotos: SectionImage[]): AutoPhotosResult => {
    if (!mode || isLoading || isError) return EMPTY_RESULT
    return getAutoPhotos(mode, item, ownPhotos, furnitures)
  }

  return { mode, isLoading, isError, getFor }
}
