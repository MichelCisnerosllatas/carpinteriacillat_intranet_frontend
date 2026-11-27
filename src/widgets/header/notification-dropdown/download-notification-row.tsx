'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { CheckCircle, XCircle, X, Loader2, OctagonX } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import {
  useNotificationStore,
  type DownloadNotification,
  type DownloadStatus,
} from '@/shared/stores/notification-store'
import { downloadStatusText } from './utils'
import { DownloadProgressBar } from './download-progress-bar'

const downloadStatusIcon: Record<DownloadStatus, React.ElementType> = {
  running: Loader2,
  done: CheckCircle,
  error: XCircle,
  cancelled: OctagonX,
}

const downloadStatusColor: Record<DownloadStatus, string> = {
  running: 'text-blue-500',
  done: 'text-green-500',
  error: 'text-red-500',
  cancelled: 'text-muted-foreground',
}

export function DownloadNotificationRow({ n }: { n: DownloadNotification }) {
  const router = useRouter()
  const { cancelDownload, removeNotification } = useNotificationStore()
  const Icon = downloadStatusIcon[n.status]
  const isRunning = n.status === 'running'

  return (
    <DropdownMenuItem
      className={cn('flex flex-col items-stretch gap-1.5 px-3 py-2.5', !n.read && 'bg-muted/50')}
      onClick={() => { NProgress.start(); router.push(n.route) }}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 size-4 shrink-0', downloadStatusColor[n.status], isRunning && 'animate-spin')} />
        <div className="flex-1 space-y-0.5">
          <p className="text-sm leading-none font-medium">{n.label}</p>
          <p className="text-xs text-muted-foreground">{downloadStatusText(n)}</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                if (isRunning) cancelDownload(n.id)
                else removeNotification(n.id)
              }}
            >
              <X className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isRunning ? 'Cancelar descarga' : 'Quitar de la lista'}</TooltipContent>
        </Tooltip>
      </div>
      {isRunning && <div className="ml-7"><DownloadProgressBar n={n} /></div>}
    </DropdownMenuItem>
  )
}
