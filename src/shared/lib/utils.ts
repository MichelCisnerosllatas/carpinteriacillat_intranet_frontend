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
