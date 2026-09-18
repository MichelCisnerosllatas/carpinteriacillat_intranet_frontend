'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * Sincroniza la pestaña activa de un `<Tabs>` con el query param `?tab=` de la URL.
 *
 * Por qué: sin esto, la pestaña activa vive solo en un `useState` — no tiene URL propia (no se
 * puede compartir ni recargar en esa pestaña) y, sobre todo, cada clic de tab se perdía del
 * historial: "atrás" del navegador sacaba de la página entera en vez de volver a la pestaña
 * anterior, y un formulario hijo (crear un botón, una imagen, etc.) que vuelve con
 * `goBackOrFallback`/`router.back()` caía siempre en la primera pestaña.
 *
 * Usa `router.push` (no `replace`): cada cambio de pestaña apila su propia entrada de historial
 * a propósito, para que "atrás" navegue pestaña por pestaña (Info → Imágenes → Botones → ...)
 * antes de salir de la página — y para que volver desde un formulario hijo aterrice en la
 * pestaña exacta desde la que se navegó.
 *
 * @param validTabs valores permitidos para `?tab=` — cualquier otro valor (o su ausencia) cae en `defaultTab`.
 */
export function useTabQueryParam(validTabs: readonly string[], defaultTab: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const raw = searchParams.get('tab')
  const activeTab = raw && validTabs.includes(raw) ? raw : defaultTab

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === defaultTab) params.delete('tab')
      else params.set('tab', tab)
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams, defaultTab]
  )

  return [activeTab, setActiveTab] as const
}
