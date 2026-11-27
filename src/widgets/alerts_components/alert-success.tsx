import { CheckCircle2 } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert'
import type { AppAlertProps } from './types'

export function AlertSuccess({ title, message, apiError, className }: AppAlertProps) {
  const displayTitle = title ?? apiError?.message
  return (
    <Alert className={`border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 ${className ?? ''}`}>
      <CheckCircle2 className='text-green-600 dark:text-green-400' />
      {displayTitle && <AlertTitle>{displayTitle}</AlertTitle>}
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  )
}
