'use client'

import { Globe } from 'lucide-react'

/** Estos campos viajan tal cual a `/v1/public/site` y los renderiza el sitio web público —
 * a diferencia de "Nombre" (uso interno del intranet, nunca sale de acá). */
export function PublicSiteBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
      <Globe className="size-3" />Se muestra en el sitio web
    </span>
  )
}
