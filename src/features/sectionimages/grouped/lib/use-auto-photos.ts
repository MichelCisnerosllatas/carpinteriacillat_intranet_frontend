'use client'

// SOLO carrusel «Muebles a medida» (config.autoPhotos).
// Trae los trabajos publicados de la Galería (una vez) y calcula las "fotos automáticas" de cada
// tarjeta con la regla de la web (auto-photos.ts). En las secciones sin fotos automáticas (hero) no pide nada.
// Ver grouped/README.md → "Fotos automáticas".

import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../data/schema'
import type { GroupedSectionConfig } from '../grouped-section.config'
import { useWebWorkList } from './use-web-work-list'
import { getCategoryAutoPhotos, type AutoPhoto } from './auto-photos'

const EMPTY: AutoPhoto[] = []

export function useAutoPhotos(config: GroupedSectionConfig) {
  const enabled = config.autoPhotos
  // Solo se piden los trabajos (publicados) si la sección usa fotos automáticas
  const { works, isLoading, isError } = useWebWorkList(enabled, 1)

  /** Fotos automáticas de una tarjeta (con sus fotos propias, para saber si hacen falta). */
  const getFor = (item: SectionItemApiItem, ownPhotos: SectionImage[]): AutoPhoto[] => {
    if (!enabled || isLoading || isError) return EMPTY
    return getCategoryAutoPhotos(item, ownPhotos, works)
  }

  return { enabled, isLoading, isError, getFor }
}
