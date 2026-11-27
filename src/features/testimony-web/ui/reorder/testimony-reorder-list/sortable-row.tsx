'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import type { ReorderItem } from './types'

export function SortableRow({
  item, onMoveUp, onMoveDown, isVisibleOnWeb,
}: {
  item: ReorderItem
  onMoveUp?:   () => void
  onMoveDown?: () => void
  isVisibleOnWeb: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const stateOpt = getVisibilityStateOption(item.stateValue)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-sm',
        isDragging && 'z-50 opacity-75 shadow-md',
        !isVisibleOnWeb && 'opacity-60'
      )}
    >
      {/* Handle — en touch, arrastrar con dnd-kit no es confiable (el gesto se confunde con
          el scroll de la página), así que se agranda un poco y se agrega touch-none para
          que el navegador no le dispute el gesto al drag */}
      <div
        {...attributes}
        {...listeners}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4 pointer-coarse:size-5" />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
      <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          isVisibleOnWeb ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-muted-foreground/20 text-muted-foreground'
        )}
      >
        {isVisibleOnWeb ? 'En el sitio' : 'No visible'}
      </Badge>

      {/* Subir/bajar — alternativa fija al arrastre, siempre funciona (mouse, touch o
          teclado) sin depender de acertar ni sostener el handle */}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8"
        >
          <ChevronUp className="size-3.5 pointer-coarse:size-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8"
        >
          <ChevronDown className="size-3.5 pointer-coarse:size-4" />
        </button>
      </div>
    </div>
  )
}
