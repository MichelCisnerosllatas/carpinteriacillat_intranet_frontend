'use client'

// Carrusel de categorías y Restauración: lista de muebles con su categoría, portada y galería
// (endpoint "join"). La usan el selector "Foto de un mueble" (formulario de imagen) y el
// selector de muebles del modo "Trabajo" (formulario de item y diálogo "+ Nuevo") y las "fotos automáticas" de la
// vista agrupada (use-auto-photos.ts). Se filtra en el navegador.

import { useEffect, useState } from 'react'
import { furnituresService } from '@/features/furnitures/services/furnitures.service'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'

/** Nombre a mostrar del mueble: título público o, si no tiene, su nombre. */
export function getFurnitureDisplayTitle(f: Pick<FurnitureJoinApiItem, 'furniture_title' | 'furniture_name'>): string {
  return f.furniture_title?.trim() || f.furniture_name
}

/**
 * Trae los muebles una sola vez al montar (máx. 100).
 * `enabled = false` → no pide nada (ej. secciones sin fotos automáticas) y devuelve lista vacía.
 */
export function useFurnitureJoinList(enabled = true) {
  const [furnitures, setFurnitures] = useState<FurnitureJoinApiItem[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    // Si se activa más tarde (ej. al abrir el diálogo "+ Nuevo"), se vuelve a mostrar "cargando"
    setIsLoading(true)
    setIsError(false)
    furnituresService.getList({ page: 1, per_page: 100 })
      .then((res) => {
        if (cancelled) return
        if (res.success) setFurnitures(res.data)
        else setIsError(true)
      })
      .catch(() => { if (!cancelled) setIsError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [enabled])

  return { furnitures, isLoading, isError }
}
