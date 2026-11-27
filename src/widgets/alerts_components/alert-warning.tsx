import { AlertTriangle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert'
import type { AppAlertProps } from './types'
import { ErrorList } from './error-list'

export function AlertWarning({ title, message, apiError, className }: AppAlertProps) {
  const displayTitle = title ?? apiError?.message
  return (
    <Alert className={`border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 ${className ?? ''}`}>
      <AlertTriangle className='text-yellow-600 dark:text-yellow-400' />
      {displayTitle && <AlertTitle>{displayTitle}</AlertTitle>}
      {message && (
        <AlertDescription>{message}</AlertDescription>
      )}
      {apiError?.errors && (
        <AlertDescription>
          <ErrorList errors={apiError.errors} />
        </AlertDescription>
      )}
    </Alert>
  )
}
