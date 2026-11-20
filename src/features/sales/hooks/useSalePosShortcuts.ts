// src/features/sales/hooks/useSalePosShortcuts.ts
'use client'

import { useEffect, useRef } from 'react'

type Shortcuts = {
  /** F2 — ir al buscador de productos. */
  onProduct: () => void
  /** F3 — ir al campo cliente. */
  onClient: () => void
  /** F4 — importar proforma (solo al crear). */
  onProforma?: () => void
  /** Ctrl+Enter — emitir venta. */
  onSubmit: () => void
  /** false mientras hay un modal abierto: los atajos no deben actuar "detrás" del modal. */
  enabled: boolean
}

/**
 * Atajos de teclado de "Realizar venta". El administrador trabaja casi sin mouse, así que las
 * acciones principales tienen tecla propia. Se escucha en `window` para que funcionen estando
 * el foco en cualquier campo de la pantalla.
 */
export function useSalePosShortcuts(shortcuts: Shortcuts) {
  // Se guarda en un ref para no volver a registrar el listener en cada render (las funciones
  // que llegan cambian de identidad en cada render).
  const ref = useRef(shortcuts)
  // Se actualiza después de cada render (no durante el render, que React no permite).
  useEffect(() => {
    ref.current = shortcuts
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const current = ref.current
      if (!current.enabled) return

      if (e.key === 'F2') {
        e.preventDefault()
        current.onProduct()
      } else if (e.key === 'F3') {
        // preventDefault: F3 abre "Buscar en la página" en el navegador.
        e.preventDefault()
        current.onClient()
      } else if (e.key === 'F4' && current.onProforma) {
        e.preventDefault()
        current.onProforma()
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        current.onSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
