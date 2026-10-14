'use client'

// Atajo del formulario de Mueble: "Usar su portada en la tarjeta «<categoría>»".
// La tarjeta es la de su categoría en el carrusel «Muebles a medida» (página Servicios).
// Al guardar, el backend crea/reactiva (true) u oculta (false) esa foto (campo show_cover_on_category_card).
// Es independiente de "Visible en la web" (galería de trabajos).

import { useEffect } from 'react'
import { useCategorySelectStore } from '@/features/categories/stores/useCategorySelectStore'
import { FurnitureShortcutCheck } from './furniture-shortcut-check'

interface FurnitureCategoryCardCheckProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Categoría elegida ahora en el formulario (para mostrar su nombre). */
  idCategory: number | null
  /** Nombre a usar si la categoría no está en la lista de activas (ej. viene del backend). */
  fallbackCategoryName: string | null
  /** Sección del carrusel (viene en `category_card.id_section`). Sin ella no se muestra el enlace. */
  idSection?: number | null
  /** ¿La galería tiene Foto 1 (la portada)? Sin portada no hay foto que usar. */
  hasCover: boolean
  disabled?: boolean
}

/** Checkbox "Usar su portada en la tarjeta «X»" + texto corto + enlace "Ver sección →". */
export function FurnitureCategoryCardCheck({
  checked, onCheckedChange, idCategory, fallbackCategoryName, idSection, hasCover, disabled = false,
}: FurnitureCategoryCardCheckProps) {
  // Nombre de la categoría elegida (las categorías activas ya las carga el select del formulario)
  const categories = useCategorySelectStore((s) => s.options)
  const loadCategories = useCategorySelectStore((s) => s.load)
  useEffect(() => { void loadCategories() }, [loadCategories])
  const categoryName = categories.find((c) => c.id_category === idCategory)?.category_name ?? fallbackCategoryName

  return (
    <FurnitureShortcutCheck
      id="furniture-cover-on-category-card"
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      label={categoryName ? `Usar su portada en la tarjeta «${categoryName}»` : 'Usar su portada en la tarjeta de su categoría'}
      description="Se muestra en «Muebles a medida» (página Servicios)."
      // Aviso: sin fotos en la galería no hay portada que mostrar en la tarjeta
      warning={checked && !hasCover ? 'Agrega al menos una foto a la galería: la Foto 1 es la portada que se usa en la tarjeta.' : null}
      // Enlace a la pestaña Imágenes de esa sección (solo si el backend mandó la sección)
      sectionHref={idSection != null ? `/sections/${idSection}?tab=images` : null}
    />
  )
}
