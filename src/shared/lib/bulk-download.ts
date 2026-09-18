import { useNotificationStore } from '../stores/notification-store'

export type BulkDownloadItem = {
  run: () => Promise<void>
}

export interface RunBulkDownloadOptions {
  /** Nombre del módulo mostrado en la notificación, ej. "Imágenes". */
  label: string
  /** Ruta a la que navega la notificación al hacer click, ej. "/images". */
  route: string
  items: BulkDownloadItem[]
  /** Se llama al terminar (éxito, error o cancelación) — el componente que la invocó puede
   * ya no estar montado (el usuario navegó a otro módulo mientras corría en segundo plano),
   * por eso esto es solo un callback best-effort, no algo de lo que dependa el flujo. */
  onSettled?: () => void
}

/**
 * Corre una descarga masiva uno por uno (no en paralelo, no vía un endpoint de zip: el
 * backend de producción es básico) y la publica como una notificación en la campanita del
 * header — con progreso animado y opción de cancelar — mientras el usuario navega libremente
 * a otros módulos. Sigue corriendo en segundo plano porque vive en un store global
 * (`useNotificationStore`), no en el estado del componente que la disparó.
 */
export function runBulkDownload({ label, route, items, onSettled }: RunBulkDownloadOptions): void {
  if (items.length === 0) return

  const { startDownload, reportDownloadProgress, finishDownload, isDownloadCancelled } = useNotificationStore.getState()
  const id = startDownload({ label, route, total: items.length })

  void (async () => {
    let cancelled = false
    let errors = 0

    for (const item of items) {
      if (isDownloadCancelled(id)) { cancelled = true; break }

      let ok = false
      try {
        await item.run()
        ok = true
      } catch {
        errors++
      }
      reportDownloadProgress(id, { completed: 1, errors: ok ? 0 : 1 })
    }

    finishDownload(id, cancelled ? 'cancelled' : errors > 0 ? 'error' : 'done')
    onSettled?.()
  })()
}
