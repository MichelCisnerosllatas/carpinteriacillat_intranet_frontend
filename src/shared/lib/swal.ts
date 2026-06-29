/**
 * SweetAlert2 helper — shared/lib/swal.ts
 *
 * A typed wrapper around SweetAlert2 that:
 *  - Automatically picks dark/light theme from next-themes
 *  - Provides named helpers for the most common patterns
 *
 * IMPORTANT: This file is CLIENT-ONLY. Do not import in Server Components.
 * Add 'use client' at the top of any component that calls these helpers,
 * or call them only inside event handlers / useEffect.
 *
 * Usage:
 *   import { swalConfirm, swalSuccess, swalError, swalInput } from '@/shared/lib/swal'
 *
 *   // Confirmation dialog
 *   const confirmed = await swalConfirm({
 *     title: 'Delete user?',
 *     text: 'This action cannot be undone.',
 *   })
 *   if (confirmed) deleteUser(id)
 *
 *   // Simple alerts
 *   await swalSuccess('Done!', 'User has been created.')
 *   await swalError('Failed', 'Could not connect.')
 *   await swalWarning('Watch out', 'You are about to delete 50 records.')
 *
 *   // Input dialog
 *   const { value } = await swalInput({ title: 'New name', inputPlaceholder: 'Enter name...' })
 *   if (value) rename(value)
 */

import Swal, { type SweetAlertOptions, type SweetAlertResult } from 'sweetalert2'

// ─── Theme-aware base ─────────────────────────────────────────────────────────
// Reads the current theme class from <html> (set by next-themes)
function getThemeOptions(): Partial<SweetAlertOptions> {
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  return isDark
    ? {
        background: '#1e2535',
        color: '#e2e8f0',
        // Colores oscuros para que el texto blanco de SweetAlert2 sea legible
        confirmButtonColor: '#3b5bdb',   // azul medio — texto blanco visible
        cancelButtonColor: '#374151',    // gris oscuro — texto blanco visible
      }
    : {
        background: 'oklch(1 0 0)',
        color: 'oklch(0.129 0.042 264.695)',
        confirmButtonColor: 'oklch(0.208 0.042 265.755)',
        cancelButtonColor: 'oklch(0.554 0.046 257.417)',
      }
}

// ─── Scroll lock helpers ──────────────────────────────────────────────────────
function lockScroll() {
  document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  document.body.style.overflow = ''
}

// ─── Base instance ────────────────────────────────────────────────────────────
export function baseSwal<T = any>(
  options: SweetAlertOptions
): Promise<SweetAlertResult<T>> {
  const { willOpen, didClose, customClass, ...rest } = options

  const finalOptions = {
    ...getThemeOptions(),
    customClass: {
      popup: 'rounded-xl shadow-xl border border-border text-sm',
      title: 'text-base font-semibold',
      htmlContainer: 'text-muted-foreground text-sm',
      confirmButton: 'rounded-md px-4 py-2 text-sm font-medium',
      cancelButton: 'rounded-md px-4 py-2 text-sm font-medium',
      ...(customClass ?? {}),
    },
    willOpen: () => {
      lockScroll()
      willOpen?.()
    },
    didClose: () => {
      unlockScroll()
      didClose?.()
    },
    ...rest,
  } as SweetAlertOptions

  return Swal.fire(finalOptions) as Promise<SweetAlertResult<T>>
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export async function swalConfirm(options: {
  title: string
  text?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}): Promise<boolean> {
  const result = await baseSwal({
    title: options.title,
    text: options.text,
    icon: options.danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Confirm',
    cancelButtonText: options.cancelText ?? 'Cancel',
    reverseButtons: true,
    ...(options.danger
      ? {
          confirmButtonColor: 'oklch(0.577 0.245 27.325)', // --destructive
          iconColor: 'oklch(0.577 0.245 27.325)',
        }
      : {}),
  })
  return result.isConfirmed
}

// ─── Alert helpers ────────────────────────────────────────────────────────────
export function swalSuccess(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'success' })
}

export function swalError(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'error' })
}

export function swalWarning(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'warning' })
}

export function swalInfo(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'info' })
}

// ─── Input dialog ─────────────────────────────────────────────────────────────
export async function swalInput(options: {
  title: string
  text?: string
  inputPlaceholder?: string
  inputLabel?: string
  confirmText?: string
}): Promise<SweetAlertResult<string>> {
  return baseSwal<string>({
    title: options.title,
    text: options.text,
    input: 'text',
    inputPlaceholder: options.inputPlaceholder,
    inputLabel: options.inputLabel,
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'OK',
    inputValidator: (value: string) => {
      if (!value) return 'Please enter a value.'
      return undefined
    },
  })
}

export async function swalDeleteConfirm(
  title = '¿Eliminar registro?',
  text = 'Esta acción no se puede deshacer.'
): Promise<boolean> {
  return swalConfirm({
    title,
    text,
    confirmText: 'Sí, eliminar',
    cancelText: 'Cancelar',
    danger: true,
  })
}

// Re-export raw Swal for edge cases
export { Swal }
