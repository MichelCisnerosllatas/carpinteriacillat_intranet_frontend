'use client'

// Carrusel de categorías: lista de trabajos de la Galería (web_works) con su categoría, portada y
// fotos de galería (`include=media`). La usan las "fotos automáticas" de la vista agrupada
// (use-auto-photos.ts) y el selector "Foto de un trabajo" del formulario de imagen.
// Se filtra en el navegador.
//
// Llama directo a la API con un tipo LOCAL mínimo (no importa nada de features/web-works) para que
// esta carpeta no dependa de ese módulo. Ver grouped/README.md.

import { useEffect, useState } from 'react'
import apiClient from '@/shared/api/apiClient'

/** Una foto de galería de un trabajo (solo lo que usa esta carpeta). */
export type GroupedWebWorkImage = {
  id_web_work_image: number
  id_image: number
  url: string
  name: string
  webworkimage_caption: string | null
  webworkimage_order: number | null
  webworkimage_state: number
}

/** Un trabajo de la Galería (solo lo que usa esta carpeta). */
export type GroupedWebWork = {
  id_web_work: number
  webwork_title: string
  webwork_state: number
  /** Fecha de entrega "2026-05-10" o null. */
  webwork_delivered_at: string | null
  webwork_order: number | null
  category: { id_category: number; category_name: string } | null
  /** Portada (id_image del trabajo) o null. */
  cover: { id_image: number; url: string; name: string } | null
  images: GroupedWebWorkImage[]
  type: { typework_key: string; typework_name: string } | null
}

type WebWorkListResponse = {
  success: boolean
  message: string
  data: GroupedWebWork[]
}

/** Endpoint del listado de trabajos (intranet). */
const WEB_WORK_LIST_URL = '/v1/intranet/web-work'

/**
 * Trae los trabajos una sola vez al montar (máx. 100, con sus fotos).
 * `enabled = false` → no pide nada (ej. secciones sin fotos automáticas) y devuelve lista vacía.
 * `state` (opcional): 1 = solo publicados. Sin valor trae todos.
 */
export function useWebWorkList(enabled = true, state?: number) {
  const [works, setWorks] = useState<GroupedWebWork[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    // Se arranca fuera del render del efecto (mismo patrón de setTimeout que el resto del repo)
    const timer = window.setTimeout(() => {
      setIsLoading(true)
      setIsError(false)
      apiClient
        .get<WebWorkListResponse>(WEB_WORK_LIST_URL, {
          params: { include: 'media', per_page: 100, page: 1, ...(state != null ? { state } : {}) },
        })
        .then(({ data }) => {
          if (cancelled) return
          if (data.success) setWorks(data.data ?? [])
          else setIsError(true)
        })
        .catch(() => { if (!cancelled) setIsError(true) })
        .finally(() => { if (!cancelled) setIsLoading(false) })
    }, 0)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [enabled, state])

  return { works, isLoading, isError }
}
