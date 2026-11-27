import type { GoogleAccessRequestStatus } from './schema'

export const GOOGLE_ACCESS_REQUEST_STATUSES: { value: GoogleAccessRequestStatus; label: string; badge: string }[] = [
  { value: 'pending',  label: 'Pendiente', badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
  { value: 'approved', label: 'Aprobada',  badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  { value: 'rejected', label: 'Rechazada', badge: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-300' },
]

export const getGoogleAccessRequestStatusOption = (value: GoogleAccessRequestStatus) =>
  GOOGLE_ACCESS_REQUEST_STATUSES.find((s) => s.value === value) ?? GOOGLE_ACCESS_REQUEST_STATUSES[0]
