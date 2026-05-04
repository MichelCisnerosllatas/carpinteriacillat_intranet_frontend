/**
 * Toast helper — shared/lib/toast.ts
 *
 * Thin wrapper around `sonner` that provides typed, named helpers.
 * The <Toaster /> component must be mounted once in your root layout
 * (already done in src/app/layout.tsx).
 *
 * Usage from any file (client or server action):
 *   import { toastSuccess, toastError, toastPromise } from '@/shared/lib/toast'
 *
 *   toastSuccess('Saved!', 'Your changes were saved.')
 *   toastError('Failed', 'Could not connect to server.')
 *   toastWarning('Watch out', 'This action is irreversible.')
 *   toastInfo('Note', 'You have 3 pending tasks.')
 *
 *   // Promise toast (loading → success/error)
 *   toastPromise(saveUser(data), {
 *     loading: 'Saving user...',
 *     success: 'User saved!',
 *     error: 'Failed to save user.',
 *   })
 */

import { toast } from 'sonner'

// ─── Basic toasts ─────────────────────────────────────────────────────────────

export function toastSuccess(title: string, description?: string) {
  toast.success(title, { description })
}

export function toastError(title: string, description?: string) {
  toast.error(title, { description })
}

export function toastWarning(title: string, description?: string) {
  toast.warning(title, { description })
}

export function toastInfo(title: string, description?: string) {
  toast.info(title, { description })
}

// ─── Promise toast ───────────────────────────────────────────────────────────

type ToastPromiseOptions<T> = {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((err: unknown) => string)
  description?: string
}

export function toastPromise<T>(
  promise: Promise<T>,
  options: ToastPromiseOptions<T>
) {
  return toast.promise(promise, {
    loading: options.loading,
    success: options.success as string,
    error: options.error as string,
    description: options.description,
  })
}

// Re-export the raw toast for edge cases
export { toast }
