'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SectionImageCard, type SectionImageCardProps } from './sectionimage-card'

interface SortableSectionImageCardProps extends SectionImageCardProps {
  /** Grupo (item) al que pertenece la foto: solo se puede soltar dentro del mismo grupo. */
  groupKey: string
  /** true mientras se guarda el orden: no se puede arrastrar. */
  dragDisabled?: boolean
}

/**
 * Tarjeta de foto que se puede arrastrar para ordenarla dentro de su grupo.
 * Se arrastra desde el asa (ícono ⋮⋮); el resto de la tarjeta funciona igual que siempre,
 * así en el celular deslizar sobre la foto sigue haciendo scroll normal.
 */
export function SortableSectionImageCard({ groupKey, dragDisabled = false, ...cardProps }: SortableSectionImageCardProps) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: cardProps.item.id, disabled: dragDisabled, data: { groupKey } })

  // Asa de arrastre: touch-none SOLO aquí (no en toda la tarjeta) para que el navegador
  // no le dispute el gesto al arrastre; en celular hay que mantenerla presionada ~¼ s.
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      disabled={dragDisabled}
      aria-label="Arrastrar para ordenar"
      title="Arrastra para ordenar (en celular, mantén presionado)"
      className="flex size-7 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:size-9"
    >
      <GripVertical className="size-4 pointer-coarse:size-5" />
    </button>
  )

  // Translate (sin escala) para que la tarjeta no se deforme si las alturas varían
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('relative', isDragging && 'z-50 opacity-80 shadow-lg')}
    >
      <SectionImageCard {...cardProps} dragHandle={handle} />
    </div>
  )
}
