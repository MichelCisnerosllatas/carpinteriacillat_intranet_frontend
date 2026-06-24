'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'

interface UserDevicesErrorProps {
  title?: string
  message?: string
  isLoading?: boolean
  showRetryButton?: boolean
  onRetry?: () => void
}

export function UserDevicesError({
  title = 'Error al cargar dispositivos',
  message = 'No se pudieron cargar los dispositivos.',
  isLoading = false,
  showRetryButton = false,
  onRetry,
}: UserDevicesErrorProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {showRetryButton && onRetry && (
        <Button variant="outline" size="sm" disabled={isLoading} onClick={onRetry}>
          <RefreshCw className={`mr-2 size-4 ${isLoading ? 'animate-spin' : ''}`} />
          Reintentar
        </Button>
      )}
    </div>
  )
}
