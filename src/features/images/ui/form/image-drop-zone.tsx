'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { ImagePlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface DropZoneProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onClick' | 'onDrop' | 'onDragOver' | 'onDragLeave'> {
  dragOver:    boolean
  onDragOver:  () => void
  onDragLeave: () => void
  onDrop:      (files: File[]) => void
  onClick:     () => void
  disabled:    boolean
  compact:     boolean
}

// Recibe ...rest para reenviar props que Radix inyecta cuando se usa como
// asChild de un DropdownMenuTrigger (onPointerDown, aria-*, data-state, etc.)
// — sin esto, Radix no puede abrir el menú al hacer clic sobre esta zona.
export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(function DropZone(
  { dragOver, onDragOver, onDragLeave, onDrop, onClick, disabled, compact, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      onClick={onClick}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(Array.from(e.dataTransfer.files)) }}
      className={cn(
        'flex cursor-pointer select-none flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all',
        compact ? 'gap-1 p-3' : 'gap-2 p-5',
        dragOver
          ? 'border-primary bg-primary/5 scale-[0.99]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-xl bg-muted',
        compact ? 'size-8' : 'size-10',
      )}>
        <ImagePlus className={cn(compact ? 'size-4' : 'size-5', 'text-muted-foreground')} />
      </div>
      <div className="text-center">
        <p className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {compact ? 'Agregar archivos' : 'Arrastra imágenes aquí'}
        </p>
        {!compact && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            o haz clic para seleccionar · puedes navegar entre carpetas y elegir varias a la vez
          </p>
        )}
      </div>
    </div>
  )
})
