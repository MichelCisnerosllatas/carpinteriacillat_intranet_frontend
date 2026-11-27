'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller, useFormContext } from 'react-hook-form'
import { GripVertical, ImageOff, Star, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import type { WebWorkFormValues } from './web-work-form.schema'

interface SortablePhotoCardProps {
  sortableId: string
  index: number
  isCover: boolean
  onUseAsCover: () => void
  onRemove: () => void
  disabled?: boolean
}

export function SortablePhotoCard({ sortableId, index, isCover, onUseAsCover, onRemove, disabled }: SortablePhotoCardProps) {
  const { control, register, watch } = useFormContext<WebWorkFormValues>()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId })
  const url = watch(`images.${index}.url`)
  const name = watch(`images.${index}.name`)
  const visible = watch(`images.${index}.visible`)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-2 shadow-sm',
        isDragging && 'z-50 opacity-75 shadow-md',
        !visible && 'opacity-70',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
        {url
          ? <img src={url} alt={name} className="h-full w-full object-cover" draggable={false} />
          : <div className="flex h-full items-center justify-center text-muted-foreground"><ImageOff className="size-5" /></div>}
        {/* Asa para arrastrar */}
        <div
          {...attributes}
          {...listeners}
          title="Arrastra para ordenar"
          className="absolute left-1 top-1 flex size-7 cursor-grab touch-none items-center justify-center rounded bg-black/60 text-white active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </div>
        <Button type="button" size="icon" variant="secondary" className="absolute right-1 top-1 size-7" onClick={onRemove} disabled={disabled} title="Quitar foto" aria-label="Quitar foto">
          <X className="size-4" />
        </Button>
        <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[11px] font-medium text-white">{index + 1}</span>
        {isCover && (
          <span className="pointer-events-none absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-amber-500 px-1.5 text-[11px] font-medium text-white">
            <Star className="size-3" />Portada
          </span>
        )}
      </div>

      <Input placeholder="Pie de foto (opcional)" maxLength={150} className="h-8 text-xs" disabled={disabled} {...register(`images.${index}.webworkimage_caption`)} />

      <div className="flex items-center justify-between gap-2">
        <Controller
          control={control}
          name={`images.${index}.visible`}
          render={({ field }) => <VisibilityToggle checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />}
        />
        {!isCover && (
          <button type="button" onClick={onUseAsCover} disabled={disabled} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground" title="Usar como portada">
            <Star className="size-3" />Portada
          </button>
        )}
      </div>
    </div>
  )
}
