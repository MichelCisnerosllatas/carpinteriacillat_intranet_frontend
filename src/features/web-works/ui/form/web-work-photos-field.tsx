'use client'

// Lista de fotos de galería del trabajo: agregar del banco, arrastrar para ordenar,
// pie de foto, visible/oculta, usar como portada y quitar.
// El arreglo vive en el formulario padre (useFieldArray de `images`); este componente solo lo
// muestra y lo modifica con los métodos que recibe. El orden del arreglo = orden en la web.

import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller, useFormContext, type UseFieldArrayReturn } from 'react-hook-form'
import { GripVertical, ImageOff, Star, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { toastInfo } from '@/shared/lib/toast'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'
import { BankImagePicker } from './bank-image-picker'
import type { WebWorkFormValues } from './web-work-form.schema'

type PhotosArray = UseFieldArrayReturn<WebWorkFormValues, 'images', 'key'>

interface WebWorkPhotosFieldProps {
  photos: PhotosArray
  /** id_image de la portada actual (para marcar la foto que lo es). */
  coverId: number | null
  onUseAsCover: (photo: { id_image: number }) => void
  disabled?: boolean
}

export function WebWorkPhotosField({ photos, coverId, onUseAsCover, disabled }: WebWorkPhotosFieldProps) {
  const { fields, append, move, remove } = photos

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handlePick = (item: ImageApiItem) => {
    if (fields.some((f) => f.id_image === item.id_image)) {
      toastInfo('Ya está en la lista', 'Esa foto ya es parte de la galería del trabajo.')
      return
    }
    append({
      id_web_work_image: null,
      id_image: item.id_image,
      url: getImageUrl(item.image_patch),
      name: getImageDisplayName(item),
      webworkimage_caption: '',
      visible: true,
    })
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = fields.findIndex((f) => f.key === active.id)
    const to = fields.findIndex((f) => f.key === over.id)
    if (from >= 0 && to >= 0) move(from, to)
  }

  return (
    <div className="flex flex-col gap-3">
      <BankImagePicker onPick={handlePick} disabled={disabled} />

      {fields.length === 0 ? (
        <div className="flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center text-xs text-muted-foreground">
          <ImageOff className="size-5" />
          Todavía no hay fotos. Agrégalas desde el banco de imágenes.
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Arrastra las fotos para cambiar el orden en que se muestran.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.key)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                {fields.map((field, index) => (
                  <SortablePhotoCard
                    key={field.key}
                    sortableId={field.key}
                    index={index}
                    isCover={coverId != null && coverId === field.id_image}
                    onUseAsCover={() => onUseAsCover({ id_image: field.id_image })}
                    onRemove={() => remove(index)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  )
}

interface SortablePhotoCardProps {
  sortableId: string
  index: number
  isCover: boolean
  onUseAsCover: () => void
  onRemove: () => void
  disabled?: boolean
}

function SortablePhotoCard({ sortableId, index, isCover, onUseAsCover, onRemove, disabled }: SortablePhotoCardProps) {
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
