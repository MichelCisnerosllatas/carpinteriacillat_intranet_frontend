'use client'

import { ErrorState } from '@/widgets/error/error-state'

interface WebWorksErrorProps {
  title?: string
  message?: string
  isLoading?: boolean
  onRetry?: () => void
}

export function WebWorksError({
  title = 'Error al cargar trabajos',
  message,
  isLoading = false,
  onRetry,
}: WebWorksErrorProps) {
  return (
    <ErrorState
      isPrimaryLoading={isLoading}
      title={title}
      message={message}
      primaryLabel="Reintentar"
      onPrimaryAction={onRetry}
    />
  )
}
