'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import { SECTION_ITEM_TYPES } from '../../../data/data'
import type { ReorderItem } from './types'

export function SortableRow({
  item, onMoveUp, onMoveDown,
}: {
  item: ReorderItem
  onMoveUp?:   () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const stateOpt = getVisibilityStateOption(item.stateValue)
  const typeLabel = SECTION_ITEM_TYPES.find((t) => t.value === item.type)?.label ?? item.type ?? '—'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-sm',
        isDragging && 'z-50 opacity-75 shadow-md'
      )}
    >
      {/* Handle — agrandado en touch (pointer-coarse) porque el arrastre con dnd-kit no es
          confiable ahí: el gesto se confunde con el scroll de la página. touch-none evita que
          el navegador le dispute el gesto al drag. */}
      <div
        {...attributes}
        {...listeners}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4 pointer-coarse:size-5" />
      </div>
      <Badge variant="secondary" className="shrink-0 text-xs font-normal">{typeLabel}</Badge>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
      <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>

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
