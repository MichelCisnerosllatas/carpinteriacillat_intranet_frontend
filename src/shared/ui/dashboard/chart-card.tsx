'use client'

import type { ReactNode } from 'react'
import { AlertCircle, ArrowUpRight, ChartColumn, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { IconButton } from '@/shared/ui/icon-button'
import { IconLinkButton } from '@/shared/ui/icon-link-button'
import { Skeleton } from '@/shared/ui/skeleton'

type ChartCardProps = {
  title: string
  description?: ReactNode
  /** Botón o selector opcional en la esquina superior derecha. */
  action?: ReactNode
  /** Si se envía, muestra un botón-ícono ↗ que lleva a esa ruta (ej. el reporte con el detalle). */
  href?: string
  /** Tooltip / aria-label del botón ↗. */
  hrefLabel?: string
  /** Nota al pie (ej. tendencia o aclaración del cálculo). */
  footer?: ReactNode
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isEmpty?: boolean
  emptyMessage?: string
  /**
   * true (por defecto): si no hay datos la tarjeta NO se pinta, así no quedan cajas vacías
   * grandes en el dashboard. Con false se muestra el mensaje `emptyMessage`.
   */
  hideWhenEmpty?: boolean
  className?: string
  contentClassName?: string
  children?: ReactNode
}

// Tarjeta contenedora de todos los gráficos del dashboard. Centraliza los estados
// cargando / error / sin datos para que cada gráfico solo se preocupe de dibujar.
export function ChartCard({
  title,
  description,
  action,
  href,
  hrefLabel = 'Ver en reportes',
  footer,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  isEmpty = false,
  emptyMessage = 'No hay datos para el periodo seleccionado.',
  hideWhenEmpty = true,
  className,
  contentClassName,
  children,
}: ChartCardProps) {
  // Sin datos (y ya cargado, sin error): no se dibuja nada.
  if (isEmpty && hideWhenEmpty && !isLoading && !isError) return null

  const headerAction =
    action || href ? (
      <div className='flex items-center gap-1'>
        {action}
        {href && <IconLinkButton href={href} label={hrefLabel} icon={<ArrowUpRight />} className='size-8' />}
      </div>
    ) : null

  return (
    <Card className={cn('min-w-0 gap-4 py-4', className)}>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {headerAction && <CardAction>{headerAction}</CardAction>}
      </CardHeader>

      <CardContent className={cn('flex-1', contentClassName)}>
        {isLoading ? (
          <ChartCardSkeleton />
        ) : isError ? (
          <ChartCardMessage
            icon={<AlertCircle className='text-destructive h-8 w-8' />}
            text={errorMessage ?? 'No se pudo cargar la información.'}
            action={onRetry && <IconButton label='Reintentar' icon={<RefreshCw />} onClick={onRetry} />}
          />
        ) : isEmpty ? (
          <ChartCardMessage icon={<ChartColumn className='text-muted-foreground/60 h-8 w-8' />} text={emptyMessage} />
        ) : (
          children
        )}
      </CardContent>

      {footer && !isLoading && !isError && (
        <CardFooter className='text-muted-foreground px-4 text-xs'>{footer}</CardFooter>
      )}
    </Card>
  )
}

function ChartCardSkeleton() {
  return (
    <div className='flex h-[260px] flex-col justify-end gap-2'>
      <div className='flex flex-1 items-end gap-2'>
        {[40, 65, 50, 80, 60, 90, 70].map((height) => (
          <Skeleton key={height} className={cn('flex-1 rounded-sm', HEIGHT_CLASSES[height])} />
        ))}
      </div>
      <Skeleton className='h-3 w-full' />
    </div>
  )
}

// Alturas fijas como clases (Tailwind no detecta clases armadas dinámicamente).
const HEIGHT_CLASSES: Record<number, string> = {
  40: 'h-[40%]',
  50: 'h-[50%]',
  60: 'h-[60%]',
  65: 'h-[65%]',
  70: 'h-[70%]',
  80: 'h-[80%]',
  90: 'h-[90%]',
}

function ChartCardMessage({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className='flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center'>
      {icon}
      <p className='text-muted-foreground max-w-xs text-sm'>{text}</p>
      {action}
    </div>
  )
}
