'use client'

import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/shared/lib/use-mobile'
import { usePreviewStore } from '@/shared/stores/preview-store'
import { isLandingPreviewRoute } from './landing-preview.routes'

// Única fuente de "¿el panel está realmente ocupando espacio en pantalla ahora mismo?" — la
// usan tanto el propio widget (para pintarse) como layout-client.tsx (para correr el contenido
// principal y que no quede tapado atrás del panel, ver ese archivo).
export function useLandingPreviewVisibility() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isOpen = usePreviewStore((s) => s.isOpen)
  const widthPx = usePreviewStore((s) => s.widthPx)
  const inScope = isLandingPreviewRoute(pathname)
  // En mobile el panel es una hoja que sale desde ABAJO con su propio fondo oscuro — no le
  // hace falta reservar espacio horizontal (el patrón de "hoja + backdrop" ya es el esperado
  // para overlays en mobile, a diferencia del panel lateral de escritorio).
  const occupiesLayoutSpace = inScope && isOpen && !isMobile

  return { inScope, isMobile, isOpen, widthPx, occupiesLayoutSpace }
}
