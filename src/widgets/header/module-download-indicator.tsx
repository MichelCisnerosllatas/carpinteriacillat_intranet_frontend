'use client'

import { useMemo } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useNotificationStore, type DownloadNotification } from '@/shared/stores/notification-store'

/**
 * Chip de progreso para descargas masivas en curso, pensado para colocarse junto al título
 * de un módulo (ej. "Imágenes"). La campanita del header ya muestra esto mismo, pero si el
 * usuario está parado en el módulo de origen quiere verlo ahí también, sin tener que abrir
 * la campanita — por eso lee del mismo store, filtrado por `route`.
 *
 * El filtro NO va dentro del selector de Zustand: `.filter()` crea un array nuevo en cada
 * render, y con `useSyncExternalStore` (lo que usa Zustand v5 por debajo) un snapshot que
 * nunca es referencialmente igual dispara un loop infinito ("Maximum update depth exceeded").
 * Por eso acá se selecciona el array crudo (estable mientras el store no cambie) y el
 * filtrado se memoiza aparte.
 */
export function ModuleDownloadIndicator({ route, className }: { route: string; className?: string }) {
  const notifications = useNotificationStore((state) => state.notifications)
  const cancelDownload = useNotificationStore((state) => state.cancelDownload)

  const jobs = useMemo(
    () => notifications.filter(
      (n): n is DownloadNotification => n.kind === 'download' && n.route === route && n.status === 'running'
    ),
    [notifications, route]
  )

  if (jobs.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {jobs.map((job) => {
        const pct = job.total > 0 ? Math.round((job.completed / job.total) * 100) : 0
        return (
          <div
            key={job.id}
            className="flex animate-in items-center gap-2 rounded-full border bg-muted/50 py-1 pr-1.5 pl-2.5 text-xs fade-in slide-in-from-top-1 duration-200"
          >
            <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
            <span className="whitespace-nowrap text-muted-foreground">
              Descargando {job.completed}/{job.total}...
            </span>
            <div className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <button
              type="button"
              onClick={() => cancelDownload(job.id)}
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <X className="size-3" />
              <span className="sr-only">Cancelar descarga</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
