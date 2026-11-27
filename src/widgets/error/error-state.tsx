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

  const canShowIcon =
    showIcon && Boolean(icon ?? true)

  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn(
        'flex w-full items-center justify-center overflow-hidden',
        fullScreen
          ? 'h-dvh'
          : 'h-full min-h-0 flex-1',
        'px-4 py-[clamp(0.75rem,3vmin,2rem)]',
        className,
      )}
    >
      <div className="flex w-full max-w-2xl flex-col items-center text-center">

        {/* Icono */}
        {canShowIcon && (
          <div
            className="
              relative
              mb-[clamp(0.75rem,3vmin,2rem)]
              flex
              items-center
              justify-center
            "
          >
            {/* Glow */}
            <div
              aria-hidden="true"
              className="
                absolute
                size-[clamp(4rem,16vmin,12rem)]
                rounded-full
                bg-destructive/15
                blur-3xl
              "
            />

            {/* Círculo exterior */}
            <div
              className="
                relative
                flex
                size-[clamp(4rem,13vmin,9rem)]
                items-center
                justify-center
                rounded-full
                bg-destructive/10
                text-destructive
                ring-1
                ring-destructive/20
              "
            >
              {/* Círculo interior */}
              <div
                className="
                  flex
                  size-[clamp(2.75rem,8.5vmin,6rem)]
                  items-center
                  justify-center
                  rounded-full
                  bg-background
                  ring-1
                  ring-destructive/20
                "
              >
                {icon ?? (
                  <CircleAlert
                    className="
                      size-[clamp(1.75rem,5vmin,3.5rem)]
                    "
                    strokeWidth={1.6}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Título */}
        {hasTitle && (
          <h2
            className="
              max-w-xl
              text-balance
              text-[clamp(1.125rem,3.2vmin,1.5rem)]
              font-semibold
              leading-tight
              tracking-tight
              text-foreground
            "
          >
            {title}
          </h2>
        )}

        {/* Mensaje */}
        {hasMessage && (
          <p
            className={cn(
              `
                max-w-xl
                text-pretty
                text-[clamp(0.8rem,2vmin,1rem)]
                leading-[1.6]
                text-muted-foreground
              `,
              hasTitle &&
                'mt-[clamp(0.5rem,1.8vmin,1rem)]',
            )}
          >
            {message}
          </p>
        )}

        {/* Mensaje secundario */}
        {hasMessage2 && (
          <p
            className={cn(
              `
                max-w-lg
                text-pretty
                text-[clamp(0.75rem,1.8vmin,0.875rem)]
                leading-[1.6]
                text-muted-foreground/70
              `,
              (hasTitle || hasMessage) &&
                'mt-[clamp(0.25rem,1vmin,0.5rem)]',
            )}
          >
            {message2}
          </p>
        )}

        {/* Acciones */}
        {hasActions && (
          <div
            className="
              mt-[clamp(1rem,3vmin,2.25rem)]
              flex
              w-full
              max-w-sm
              flex-col-reverse
              gap-3
              sm:w-auto
              sm:max-w-none
              sm:flex-row
              sm:justify-center
            "
          >
            {canShowSecondaryAction && (
              <Button
                type="button"
                variant="outline"
                disabled={isPrimaryLoading}
                onClick={onSecondaryAction}
                className="
                  h-[clamp(2.25rem,6vmin,2.75rem)]
                  w-full
                  px-[clamp(1rem,3vmin,1.5rem)]
                  text-[clamp(0.75rem,1.8vmin,0.875rem)]
                  sm:w-auto
                "
              >
                <ArrowLeft
                  className="size-[clamp(0.875rem,2vmin,1rem)]"
                />

                {secondaryLabel}
              </Button>
            )}

            {canShowPrimaryAction && (
              <Button
                type="button"
                disabled={isPrimaryLoading}
                onClick={onPrimaryAction}
                className="
                  h-[clamp(2.25rem,6vmin,2.75rem)]
                  w-full
                  px-[clamp(1rem,3vmin,1.5rem)]
                  text-[clamp(0.75rem,1.8vmin,0.875rem)]
                  sm:w-auto
                "
              >
                {isPrimaryLoading ? (
                  <Loader2
                    className="
                      size-[clamp(0.875rem,2vmin,1rem)]
                      animate-spin
                    "
                  />
                ) : (
                  <RotateCcw
                    className="
                      size-[clamp(0.875rem,2vmin,1rem)]
                    "
                  />
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
// 'use client'

// import type { ReactNode } from 'react'
// import {
//   ArrowLeft,
//   CircleAlert,
//   Loader2,
//   RotateCcw,
// } from 'lucide-react'

// import { Button } from '@/shared/ui/button'
// import { cn } from '@/shared/lib/utils'

// interface ErrorStateProps {
//   title?: string
//   message?: string
//   message2?: string

//   icon?: ReactNode
//   showIcon?: boolean

//   primaryLabel?: string
//   onPrimaryAction?: () => void
//   showPrimaryAction?: boolean
//   isPrimaryLoading?: boolean

//   secondaryLabel?: string
//   onSecondaryAction?: () => void
//   showSecondaryAction?: boolean

//   fullScreen?: boolean
//   className?: string
// }

// export function ErrorState({
//   title,
//   message,
//   message2,

//   icon,
//   showIcon = true,

//   primaryLabel = 'Reintentar',
//   onPrimaryAction,
//   showPrimaryAction = true,
//   isPrimaryLoading = false,

//   secondaryLabel = 'Volver',
//   onSecondaryAction,
//   showSecondaryAction = true,

//   fullScreen = false,
//   className,
// }: ErrorStateProps) {
//   const hasTitle = Boolean(title?.trim())
//   const hasMessage = Boolean(message?.trim())
//   const hasMessage2 = Boolean(message2?.trim())

//   const canShowPrimaryAction = showPrimaryAction && typeof onPrimaryAction === 'function'

//   const canShowSecondaryAction =
//     showSecondaryAction &&
//     typeof onSecondaryAction === 'function'

//   const hasActions =
//     canShowPrimaryAction || canShowSecondaryAction

//   const canShowIcon = showIcon && Boolean(icon ?? true)

//   return (
//     <section
//       role="alert"
//       aria-live="polite"
//       className={cn(
//         'flex w-full flex-1 items-center justify-center',
//         fullScreen ? 'min-h-dvh' : 'min-h-[540px]',
//         className,
//       )}
//     >
//       <div className="flex w-full max-w-2xl flex-col items-center text-center">
//         {canShowIcon && (
//           <div className="relative mb-6 flex items-center justify-center sm:mb-8">
//             <div
//               aria-hidden="true"
//               className="absolute size-28 rounded-full bg-destructive/15 blur-3xl sm:size-48"
//             />

//             <div className="relative flex size-24 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20 sm:size-36">
//               <div className="flex size-16 items-center justify-center rounded-full bg-background ring-1 ring-destructive/20 sm:size-24">
//                 {icon ?? (
//                   <CircleAlert
//                     className="size-9 sm:size-14"
//                     strokeWidth={1.6}
//                   />
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {hasTitle && (
//           <h2 className="max-w-xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-2xl">
//             {title}
//           </h2>
//         )}

//         {hasMessage && (
//           <p
//             className={cn(
//               'max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7',
//               hasTitle && 'mt-3 sm:mt-4',
//             )}
//           >
//             {message}
//           </p>
//         )}

//         {hasMessage2 && (
//           <p
//             className={cn(
//               'max-w-lg text-pretty text-sm leading-6 text-muted-foreground/70',
//               (hasTitle || hasMessage) && 'mt-1.5 sm:mt-2',
//             )}
//           >
//             {message2}
//           </p>
//         )}

//         {hasActions && (
//           <div className="mt-7 flex w-full max-w-sm flex-col-reverse gap-3 sm:mt-9 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
//             {canShowSecondaryAction && (
//               <Button
//                 type="button"
//                 variant="outline"
//                 disabled={isPrimaryLoading}
//                 onClick={onSecondaryAction}
//                 className="h-11 w-full px-6 sm:w-auto"
//               >
//                 <ArrowLeft className="size-4" />
//                 {secondaryLabel}
//               </Button>
//             )}

//             {canShowPrimaryAction && (
//               <Button
//                 type="button"
//                 disabled={isPrimaryLoading}
//                 onClick={onPrimaryAction}
//                 className="h-11 w-full px-6 sm:w-auto"
//               >
//                 {isPrimaryLoading ? (
//                   <Loader2 className="size-4 animate-spin" />
//                 ) : (
//                   <RotateCcw className="size-4" />
//                 )}

//                 {isPrimaryLoading
//                   ? 'Reintentando...'
//                   : primaryLabel}
//               </Button>
//             )}
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }