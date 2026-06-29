'use client'

import { ImagePlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface DropZoneProps {
  dragOver:    boolean
  onDragOver:  () => void
  onDragLeave: () => void
  onDrop:      (files: File[]) => void
  onClick:     () => void
  disabled:    boolean
  compact:     boolean
}

export function DropZone({
  dragOver, onDragOver, onDragLeave, onDrop, onClick, disabled, compact,
}: DropZoneProps) {
  return (
    <div
      onClick={onClick}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(Array.from(e.dataTransfer.files)) }}
      className={cn(
        'flex cursor-pointer select-none flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all',
        compact ? 'gap-1 p-3' : 'gap-3 p-10',
        dragOver
          ? 'border-primary bg-primary/5 scale-[0.99]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-2xl bg-muted',
        compact ? 'size-8' : 'size-14',
      )}>
        <ImagePlus className={cn(compact ? 'size-4' : 'size-6', 'text-muted-foreground')} />
      </div>
      <div className="text-center">
        <p className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {compact ? 'Agregar archivos' : 'Arrastra imágenes aquí'}
        </p>
        {!compact && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            o haz clic para seleccionar · puedes elegir varias a la vez
          </p>
        )}
      </div>
    </div>
  )
}
