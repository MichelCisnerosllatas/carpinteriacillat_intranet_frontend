// src/widgets/alerts_components.tsx
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert'

interface ApiErrorResponse {
  success?: boolean
  status?: number
  message?: string
  errors?: Record<string, string[]>
}

interface AppAlertProps {
  title?: string
  message?: string
  apiError?: ApiErrorResponse
  className?: string
}

function ErrorList({ errors }: { errors: Record<string, string[]> }) {
  const messages = Object.values(errors).flat()
  if (messages.length === 0) return null
  return (
    <ul className='mt-1 list-disc pl-4 space-y-0.5'>
      {messages.map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  )
}

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
