'use client'

// Botón "+ Nuevo" junto al select "Trabajo" (Restauración) o "Categoría" (carrusel «Muebles a medida»)
// del formulario de imagen. Aquí está la configuración de cada sección y los datos del diálogo.
// Misma lógica que el formulario de item: section-items/ui/form/restoration/restoration-item-fields.tsx
// y section-items/ui/form/category/category-item-fields.tsx (no se repiten muebles/categorías ya usados).
//   - Restauración: "Nombre del trabajo" (obligatorio) + "Mueble relacionado" (opcional, cualquier mueble activo).
//   - Carrusel: select de categorías activas.

import { useEffect } from 'react'
import { useCategorySelectStore } from '@/features/categories/stores/useCategorySelectStore'
import { useUsedItemKeyIds } from '@/features/section-items/ui/form/use-used-item-key-ids'
import {
  CATEGORY_ITEM_TYPE, buildCategoryItemKey, getCategoryIdFromKey,
  getFurnitureIdFromRestorationKey, useFurnitureJoinList,
} from '../../../grouped'

/** Secciones que tienen el botón "+ Nuevo". */
export type NewSectionItemKind = 'restoration' | 'category'

/** Textos del diálogo según la sección. */
export const NEW_SECTION_ITEM_TEXTS: Record<NewSectionItemKind, {
  title: string
  description: string
  /** Carrusel: etiqueta, placeholder y textos del select de categorías. */
  fieldLabel: string
  placeholder: string
  help: string
  emptyText: string
  usedSuffix: string
}> = {
  restoration: {
    title: 'Nuevo trabajo de restauración',
    description: 'Escribe el nombre del trabajo. La tarjeta se crea visible y queda elegida en el formulario.',
    fieldLabel: 'Nombre del trabajo',
    placeholder: 'Ej. Restauración de cómoda antigua',
    help: 'Es el nombre que se ve en la web.',
    emptyText: '',
    usedSuffix: ' (ya está en Restauración)',
  },
  category: {
    title: 'Nueva categoría del carrusel',
    description: 'Elige la categoría. La tarjeta se crea visible y queda elegida en el formulario.',
    fieldLabel: 'Categoría',
    placeholder: 'Elegir categoría',
    help: 'Solo se listan las categorías activas.',
    emptyText: 'No hay categorías activas.',
    usedSuffix: ' (ya está en el carrusel)',
  },
}

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
 * Datos del diálogo. `enabled` = diálogo abierto (cada vez que se abre se vuelven a pedir los
 * datos, así un trabajo recién creado ya aparece como "ya está").
 * - Restauración: `furnitures` (muebles con galería) + `usedIds` (muebles que ya usa otro trabajo).
 * - Carrusel: `options` (categorías activas, las ya usadas marcadas).
 */
export function useNewSectionItemOptions(kind: NewSectionItemKind, idSection: number | null | undefined, enabled: boolean) {
  // Restauración: muebles con su galería
  const furnitureList = useFurnitureJoinList(enabled && kind === 'restoration')

  // Carrusel: categorías activas (el store las carga una sola vez)
  const categories = useCategorySelectStore((s) => s.options)
  const isLoadingCategories = useCategorySelectStore((s) => s.isLoading)
  const isErrorCategories = useCategorySelectStore((s) => s.isError)
  const loadCategories = useCategorySelectStore((s) => s.load)
  useEffect(() => {
    if (enabled && kind === 'category') void loadCategories()
  }, [enabled, kind, loadCategories])

  // Ids que ya tienen tarjeta en la sección (se piden de nuevo al abrir el diálogo)
  const usedIds = useUsedItemKeyIds(
    enabled ? idSection : null,
    null,
    kind === 'restoration' ? getFurnitureIdFromRestorationKey : getCategoryIdFromKey,
  )

  if (kind === 'restoration') {
    return {
      options: [] as NewSectionItemOption[],
      furnitures: furnitureList.furnitures,
      usedIds,
      isLoading: furnitureList.isLoading,
      isError: furnitureList.isError,
    }
  }

  const options: NewSectionItemOption[] = categories.map((c) => ({
    id: c.id_category,
    label: c.category_name,
    used: usedIds.includes(c.id_category),
    item: { type: CATEGORY_ITEM_TYPE, key: buildCategoryItemKey(c.id_category), title: c.category_name },
  }))
  return { options, furnitures: [], usedIds, isLoading: isLoadingCategories, isError: isErrorCategories }
}
