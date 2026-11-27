import { type DownloadNotification } from '@/shared/stores/notification-store'

export function downloadStatusText(n: DownloadNotification): string {
  if (n.status === 'running') return `Descargando ${n.completed}/${n.total}...`
  if (n.status === 'done') return `${n.completed} descargado${n.completed !== 1 ? 's' : ''}`
  if (n.status === 'cancelled') return `Cancelado — ${n.completed}/${n.total}`
  return `${n.completed - n.errors} ok, ${n.errors} con error`
}
