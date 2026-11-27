
interface ApiErrorResponse {
  success?: boolean
  status?: number
  message?: string
  errors?: Record<string, string[]>
}

export interface AppAlertProps {
  title?: string
  message?: string
  apiError?: ApiErrorResponse
  className?: string
}
