'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Hook con las fotos marcadas (checkbox) en la pestaña Imágenes.
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useState } from 'react'

/**
 * Selección de fotos por id.
 * - toggle(id, marcada): marca o desmarca una foto.
 * - setMany(ids, marcadas): marca o desmarca varias (ej. "todas las de este item").
 * - clear(): limpia la selección.
 */
export function usePhotoSelection() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const isSelected = (id: number) => selectedIds.includes(id)

  const toggle = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)))
  }

  const setMany = (ids: number[], checked: boolean) => {
    setSelectedIds((prev) => {
      const rest = prev.filter((x) => !ids.includes(x))
      return checked ? [...rest, ...ids] : rest
    })
  }

  const clear = () => setSelectedIds([])

  return { selectedIds, count: selectedIds.length, isActive: selectedIds.length > 0, isSelected, toggle, setMany, clear }
}

/** Lo que devuelve usePhotoSelection (para pasarlo como prop). */
export type PhotoSelection = ReturnType<typeof usePhotoSelection>

/** Estado del checkbox "todas las de este grupo": true, false o 'indeterminate' (algunas). */
export function getGroupCheckState(selection: PhotoSelection, ids: number[]): boolean | 'indeterminate' {
  const marked = ids.filter((id) => selection.isSelected(id)).length
  if (marked === 0) return false
  return marked === ids.length ? true : 'indeterminate'
}
