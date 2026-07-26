'use client'

import type { ReactNode } from 'react'
import {
  ArrowLeft,
  CircleAlert,
  Loader2,
  RotateCcw,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  message2?: string

  icon?: ReactNode
  showIcon?: boolean

  primaryLabel?: string
  onPrimaryAction?: () => void
  showPrimaryAction?: boolean
  isPrimaryLoading?: boolean

  secondaryLabel?: string
  onSecondaryAction?: () => void
  showSecondaryAction?: boolean

  fullScreen?: boolean
  className?: string
}

export function ErrorState({
  title,
  message,
  message2,

  icon,
  showIcon = true,

  primaryLabel = 'Reintentar',
  onPrimaryAction,
  showPrimaryAction = true,
  isPrimaryLoading = false,

  secondaryLabel = 'Volver',
  onSecondaryAction,
  showSecondaryAction = true,

  fullScreen = false,
  className,
}: ErrorStateProps) {
  const hasTitle = Boolean(title?.trim())
  const hasMessage = Boolean(message?.trim())
  const hasMessage2 = Boolean(message2?.trim())

  const canShowPrimaryAction =
    showPrimaryAction &&
    typeof onPrimaryAction === 'function'

  const canShowSecondaryAction =
    showSecondaryAction &&
    typeof onSecondaryAction === 'function'

  const hasActions =
    canShowPrimaryAction || canShowSecondaryAction

  const canShowIcon = showIcon && Boolean(icon ?? true)

  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn(
        'flex w-full flex-1 items-center justify-center px-5 py-10',
        fullScreen ? 'min-h-dvh' : 'min-h-full',
        className,
      )}
    >
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        {canShowIcon && (
          <div className="relative mb-6 flex items-center justify-center sm:mb-8">
            <div
              aria-hidden="true"
              className="absolute size-28 rounded-full bg-destructive/15 blur-3xl sm:size-48"
            />

            <div className="relative flex size-24 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20 sm:size-36">
              <div className="flex size-16 items-center justify-center rounded-full bg-background ring-1 ring-destructive/20 sm:size-24">
                {icon ?? (
                  <CircleAlert
                    className="size-9 sm:size-14"
                    strokeWidth={1.6}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {hasTitle && (
          <h2 className="max-w-xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
        )}

        {hasMessage && (
          <p
            className={cn(
              'max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7',
              hasTitle && 'mt-3 sm:mt-4',
            )}
          >
            {message}
          </p>
        )}

        {hasMessage2 && (
          <p
            className={cn(
              'max-w-lg text-pretty text-sm leading-6 text-muted-foreground/70',
              (hasTitle || hasMessage) && 'mt-1.5 sm:mt-2',
            )}
          >
            {message2}
          </p>
        )}

        {hasActions && (
          <div className="mt-7 flex w-full max-w-sm flex-col-reverse gap-3 sm:mt-9 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            {canShowSecondaryAction && (
              <Button
                type="button"
                variant="outline"
                disabled={isPrimaryLoading}
                onClick={onSecondaryAction}
                className="h-11 w-full px-6 sm:w-auto"
              >
                <ArrowLeft className="size-4" />
                {secondaryLabel}
              </Button>
            )}

            {canShowPrimaryAction && (
              <Button
                type="button"
                disabled={isPrimaryLoading}
                onClick={onPrimaryAction}
                className="h-11 w-full px-6 sm:w-auto"
              >
                {isPrimaryLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCcw className="size-4" />
                )}

                {isPrimaryLoading
                  ? 'Reintentando...'
                  : primaryLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}