'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { cn } from '@/shared/lib/utils'
import type { ChatbotOption } from '../../data/schema'

export function SortableRow({ item, position, onMoveUp, onMoveDown }: {
  item: ChatbotOption
  position: number
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-sm', isDragging && 'z-50 opacity-75 shadow-md')}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4 pointer-coarse:size-5" />
      </div>
      <span className="w-6 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{position}</span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FaIcon value={item.icon} className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
      {!item.state && <Badge variant="outline" className="text-xs text-muted-foreground">Inactiva</Badge>}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button type="button" onClick={onMoveUp} disabled={!onMoveUp} aria-label="Subir" className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronUp className="size-3.5 pointer-coarse:size-4" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={!onMoveDown} aria-label="Bajar" className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronDown className="size-3.5 pointer-coarse:size-4" />
        </button>
      </div>
    </div>
  )
}
