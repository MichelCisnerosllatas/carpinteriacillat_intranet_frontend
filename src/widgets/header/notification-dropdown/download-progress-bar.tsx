'use client'

import { type DownloadNotification } from '@/shared/stores/notification-store'

export function DownloadProgressBar({ n }: { n: DownloadNotification }) {
  const pct = n.total > 0 ? Math.round((n.completed / n.total) * 100) : 0
  return (
    <div className="h-1 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}
