'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { type DownloadNotification } from '@/shared/stores/notification-store'
import { downloadStatusText } from './utils'
import { DownloadProgressBar } from './download-progress-bar'

/** El "peek": cuando arranca una descarga, aparece anclado a la campanita mostrando de qué se
 * trata, y se contrae solo a los pocos segundos — sin robar el foco (no es un menú/Radix
 * Content real, solo una tarjeta visual). Si se hace click, abre la campanita de verdad. */
export function DownloadPeekFlyout({ job, closing, onOpen }: { job: DownloadNotification; closing: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'absolute top-full right-0 z-50 mt-2 w-72 origin-top-right rounded-lg border bg-popover p-3 text-left text-popover-foreground shadow-lg',
        closing
          ? 'animate-out fade-out zoom-out-95 slide-out-to-top-1 duration-200'
          : 'animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-300',
      )}
    >
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        <p className="flex-1 text-sm font-medium">Descargando {job.label.toLowerCase()}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{downloadStatusText(job)}</p>
      <div className="mt-2"><DownloadProgressBar n={job} /></div>
    </button>
  )
}
