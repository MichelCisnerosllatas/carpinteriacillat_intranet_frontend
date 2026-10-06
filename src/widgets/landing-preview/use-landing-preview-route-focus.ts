'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePreviewStore } from '@/shared/stores/preview-store'
import { getLandingPreviewRouteFocus } from './landing-preview.routes'

// Lleva el preview a su lugar "por defecto" al entrar a una ruta que no manda ningún
// PreviewPayload propio (ver LANDING_PREVIEW_ROUTE_FOCUS) — sin esto, esas pantallas dejaban el
// iframe donde lo hubiera dejado la anterior. Corre en cada cambio de ruta (no solo la primera
// vez) para que volver a la misma pantalla también reposicione.
export function useLandingPreviewRouteFocus() {
  const pathname = usePathname()
  const postFocus = usePreviewStore((s) => s.postFocus)

  useEffect(() => {
    const focus = getLandingPreviewRouteFocus(pathname)
    if (focus) postFocus(focus)
  }, [pathname, postFocus])
}
