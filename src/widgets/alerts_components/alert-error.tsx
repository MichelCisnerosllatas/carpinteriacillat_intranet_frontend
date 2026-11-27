import { XCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert'
import type { AppAlertProps } from './types'
import { ErrorList } from './error-list'

export function AlertError({ title, message, apiError, className }: AppAlertProps) {
  const displayTitle = title ?? apiError?.message
  return (
    <Alert className={`border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 ${className ?? ''}`}>
      <XCircle className='text-red-600 dark:text-red-400' />
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
