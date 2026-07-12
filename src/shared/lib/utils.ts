// src/shared/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Returns current datetime formatted as "YYYY-MM-DD HH:mm:ss" (backend expected format)
export function formatDatetime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

// Formatea una fecha (ISO "2026-04-16" o datetime "2026-04-16T00:00:00.000000Z") para mostrar
// al usuario, ej. "16/04/2026". Úsala en toda la UI en vez de imprimir el string crudo del API.
export function formatDisplayDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-PE', options)
}

export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5
  const rangeWithDots: (number | string)[] = []
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) rangeWithDots.push(i)
  } else {
    rangeWithDots.push(1)
    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) rangeWithDots.push(i)
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) rangeWithDots.push(i)
    } else {
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) rangeWithDots.push(i)
      rangeWithDots.push('...', totalPages)
    }
  }
  return rangeWithDots
}
