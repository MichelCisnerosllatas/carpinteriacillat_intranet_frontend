'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, ImageOff } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { getTypeWorkBadge, getWebWorkStateOption } from '../../../data/data'
import type { ReorderItem } from './types'

export function SortableRow({ item, position, onMoveUp, onMoveDown }: {
  item: ReorderItem
  position: number
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const stateOpt = getWebWorkStateOption(item.stateValue)

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
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
        {item.coverUrl ? <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" /> : <ImageOff className="size-4 text-muted-foreground" />}
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
      <Badge variant="outline" className={cn('hidden text-xs sm:inline-flex', getTypeWorkBadge(item.typeKey))}>{item.typeName}</Badge>
      <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
      <div className="flex shrink-0 flex-col gap-0.5">
        <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronUp className="size-3.5 pointer-coarse:size-4" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronDown className="size-3.5 pointer-coarse:size-4" />
        </button>
      </div>
    </div>
  )
}
