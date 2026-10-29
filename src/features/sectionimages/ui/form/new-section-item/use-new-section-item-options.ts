'use client'

// Botón "+ Nuevo" junto al select "Categoría" (carrusel «Muebles a medida») del formulario de imagen.
// Aquí están los textos y los datos del diálogo.
// Misma lógica que el formulario de item: section-items/ui/form/category/category-item-fields.tsx
// (no se repiten categorías ya usadas): select de categorías activas.

import { useEffect } from 'react'
import { useCategorySelectStore } from '@/features/categories/stores/useCategorySelectStore'
import { useUsedItemKeyIds } from '@/features/section-items/ui/form/use-used-item-key-ids'
import { CATEGORY_ITEM_TYPE, buildCategoryItemKey, getCategoryIdFromKey } from '../../../grouped'

/** Textos del diálogo. */
export const NEW_SECTION_ITEM_TEXTS = {
  title: 'Nueva categoría del carrusel',
  description: 'Elige la categoría. La tarjeta se crea visible y queda elegida en el formulario.',
  fieldLabel: 'Categoría',
  placeholder: 'Elegir categoría',
  help: 'Solo se listan las categorías activas.',
  emptyText: 'No hay categorías activas.',
  usedSuffix: ' (ya está en el carrusel)',
} as const

/** Una opción del select de categorías (carrusel). */
export type NewSectionItemOption = {
  id: number
  label: string
  /** Ya tiene tarjeta en esta sección. */
  used: boolean
  /** Lo que se guarda en sections_items. */
  item: { type: string; key: string; title: string }
}

/**
 * Datos del diálogo: `options` (categorías activas, las ya usadas marcadas).
 * `enabled` = diálogo abierto (cada vez que se abre se vuelven a pedir las tarjetas usadas,
 * así una recién creada ya aparece como "ya está").
 */
export function useNewSectionItemOptions(idSection: number | null | undefined, enabled: boolean) {
  // Categorías activas (el store las carga una sola vez)
  const categories = useCategorySelectStore((s) => s.options)
  const isLoading = useCategorySelectStore((s) => s.isLoading)
  const isError = useCategorySelectStore((s) => s.isError)
  const loadCategories = useCategorySelectStore((s) => s.load)
  useEffect(() => {
    if (enabled) void loadCategories()
  }, [enabled, loadCategories])

  // Ids que ya tienen tarjeta en la sección (se piden de nuevo al abrir el diálogo)
  const usedIds = useUsedItemKeyIds(enabled ? idSection : null, null, getCategoryIdFromKey)

  const options: NewSectionItemOption[] = categories.map((c) => ({
    id: c.id_category,
    label: c.category_name,
    used: usedIds.includes(c.id_category),
    item: { type: CATEGORY_ITEM_TYPE, key: buildCategoryItemKey(c.id_category), title: c.category_name },
  }))
  return { options, isLoading, isError }
}
