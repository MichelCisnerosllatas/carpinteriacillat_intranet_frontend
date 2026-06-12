'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'

interface UsersErrorProps {
  title?: string
  message?: string
  showRetryButton?: boolean
  isLoading?: boolean
  onRetry?: () => void
}

export function UsersError({
  title = 'Error al cargar usuarios',
  message,
  showRetryButton = true,
  isLoading = false,
  onRetry,
}: UsersErrorProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 bg-background">
      <AlertCircle className="size-10 text-destructive" />

      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>

        {message && (
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {message}
          </p>
        )}
      </div>

      {showRetryButton && (
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 size-3.5" />
          Reintentar
        </Button>
      )}
    </div>
  )
}