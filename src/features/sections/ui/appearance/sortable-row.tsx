'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'
import type { SectionDisplayListItem } from '../../model/sectionget.dto'

export function SortableRow({
  item, defaultLabel, labelMax, disabled, onLabel, onVisible, onMoveUp, onMoveDown,
}: {
  item: SectionDisplayListItem
  defaultLabel: string
  labelMax?: number
  disabled: boolean
  onLabel: (label: string) => void
  onVisible: (visible: boolean) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key, disabled })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card px-2 py-1.5',
        isDragging && 'z-50 opacity-75 shadow-md',
        !item.visible && 'bg-muted/40',
      )}
    >
      {/* Handle — touch-none para que el navegador no le dispute el gesto al arrastre */}
      <div
        {...attributes}
        {...listeners}
        aria-label={`Arrastrar «${item.label}»`}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4" />
      </div>
      <Input
        value={item.label}
        placeholder={defaultLabel}
        maxLength={labelMax}
        disabled={disabled}
        aria-label={`Nombre de la fila «${defaultLabel}»`}
        onChange={(e) => onLabel(e.target.value)}
        className={cn('h-8 min-w-0 flex-1', !item.visible && 'text-muted-foreground line-through')}
      />
      {/* Subir/bajar — alternativa fija al arrastre (mouse, touch o teclado) */}
      <div className="flex shrink-0 flex-col">
        <button
          type="button" onClick={onMoveUp} disabled={!onMoveUp || disabled} aria-label="Subir"
          className="flex size-4 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 pointer-coarse:size-6"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button" onClick={onMoveDown} disabled={!onMoveDown || disabled} aria-label="Bajar"
          className="flex size-4 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 pointer-coarse:size-6"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
      <Switch
        checked={item.visible}
        onCheckedChange={onVisible}
        disabled={disabled}
        aria-label={item.visible ? `Ocultar «${defaultLabel}»` : `Mostrar «${defaultLabel}»`}
      />
    </div>
  )
}
