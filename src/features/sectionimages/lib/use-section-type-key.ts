'use client'

import { useEffect, useState } from 'react'
import { useSectionListStore } from '@/features/sections/stores/useSectionListStore'
import { sectionsService } from '@/features/sections/services/sections.service'

/**
 * Tipo de una sección (`type_section.typesection_key`, ej. el hero de Servicios, ver isServiceShowcaseSection).
 * Primero lo busca en el store de secciones (si se viene del detalle ya está ahí);
 * si no, pide la sección por id. `hasLoaded` = ya se sabe el tipo (o falló y queda null).
 * Si todavía no hay sección elegida (ej. formulario vacío), devuelve null sin pedir nada.
 */
export function useSectionTypeKey(idSection: number | null | undefined) {
  // Sección ya cargada en el store (detalle o lista de secciones)
  const cached = useSectionListStore((s) =>
    !idSection
      ? null
      : s.currentItem?.id === idSection
        ? s.currentItem
        : s.items.find((i) => i.id === idSection) ?? null
  )

  const [fetchedKey, setFetchedKey] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (cached || !idSection) return
    let cancelled = false
    setHasFetched(false)
    setFetchedKey(null) // no mostrar el tipo de la sección anterior mientras carga
    sectionsService.getById(idSection)
      .then((res) => {
        if (!cancelled && res.success) setFetchedKey(res.data.type_section?.typesection_key ?? null)
      })
      .catch(() => { /* si falla, se usa la pantalla de siempre */ })
      .finally(() => { if (!cancelled) setHasFetched(true) })
    return () => { cancelled = true }
  }, [idSection, cached])

  // Sin sección elegida: no hay tipo
  if (!idSection) return { typeKey: null, hasLoaded: true }
  if (cached) return { typeKey: cached.typesectionKey ?? null, hasLoaded: true }
  return { typeKey: fetchedKey, hasLoaded: hasFetched }
}
