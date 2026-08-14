'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import { GripVertical, Images, ImagePlus, Upload } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { FurnitureGalleryItem } from './furniture-gallery-item'
import { FurnitureGalleryAddPicker, type PickedImage } from './furniture-gallery-add-picker'
import { FurnitureGalleryUpload } from './furniture-gallery-upload'

export type GalleryEntry = {
  localKey: string
  furnitureImageId?: number
  imageId: number
  imageUrl: string | null
  imageName: string | null
}

export type PendingGalleryItem  = { imageId: number; order: number }
export type ReorderedGalleryItem = { furnitureImageId: number; order: number }

interface FurnitureGalleryManagerProps {
  initialGallery?: GalleryEntry[]
  onPendingItemsChange:   (items: PendingGalleryItem[])   => void
  onRemovedIdsChange:     (furnitureImageIds: number[])   => void
  onReorderedItemsChange: (items: ReorderedGalleryItem[]) => void
  disabled?: boolean
}

let keyCounter = 0
const nextKey = () => `k-${++keyCounter}`

// ── Sortable wrapper ────────────────────────────────────────────────
function SortableItem({
  entry,
  disabled,
  onRemove,
  onClick,
  onMoveBack,
  onMoveForward,
}: {
  entry: GalleryEntry
  disabled: boolean
  onRemove: () => void
  onClick: () => void
  onMoveBack?: () => void
  onMoveForward?: () => void
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: entry.localKey, disabled })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group/item relative', isDragging && 'z-50 opacity-75')}
    >
      {/* Drag handle — en touch siempre visible y con más área de toque (antes 20px,
          oculto detrás de :hover: en touch no había forma de verlo ni de acertarlo) */}
      {!disabled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              {...attributes}
              {...listeners}
              className="absolute left-1 top-1 z-10 flex size-5 cursor-grab touch-none items-center justify-center rounded bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover/item:opacity-100 active:cursor-grabbing pointer-coarse:size-8 pointer-coarse:opacity-100"
            >
              <GripVertical className="size-3 pointer-coarse:size-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Mantén presionado para reordenar</TooltipContent>
        </Tooltip>
      )}
      <FurnitureGalleryItem
        imageUrl={entry.imageUrl}
        imageName={entry.imageName}
        isPending={!entry.furnitureImageId}
        disabled={disabled}
        isDragging={isDragging}
        onRemove={onRemove}
        onClick={onClick}
        onMoveBack={onMoveBack}
        onMoveForward={onMoveForward}
      />
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────
export function FurnitureGalleryManager({
  initialGallery = [],
  onPendingItemsChange,
  onRemovedIdsChange,
  onReorderedItemsChange,
  disabled = false,
}: FurnitureGalleryManagerProps) {
  const [items, setItems]               = useState<GalleryEntry[]>(() =>
    initialGallery.map((i) => ({ ...i, localKey: nextKey() }))
  )
  const [removedFiIds, setRemovedFiIds] = useState<number[]>([])
  const [pickerOpen, setPickerOpen]     = useState(false)
  const [uploadOpen, setUploadOpen]     = useState(false)
  const [lightboxIdx, setLightboxIdx]   = useState(-1)

  // PointerSensor cubre mouse (distancia chica: el mouse no tiembla). TouchSensor aparte
  // para touch, con activación por demora (mantener el dedo quieto un instante) en vez de
  // distancia — sin esto, cualquier intento de hacer scroll sobre la galería se confundía
  // con un arrastre. KeyboardSensor agrega reordenar con flechas para quien no puede arrastrar.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Notify parent whenever items change
  useEffect(() => {
    const pending: PendingGalleryItem[] = items
      .filter((i) => !i.furnitureImageId)
      .map((i) => ({ imageId: i.imageId, order: items.indexOf(i) + 1 }))
    onPendingItemsChange(pending)

    const reordered: ReorderedGalleryItem[] = items
      .filter((i) => !!i.furnitureImageId)
      .map((i) => ({ furnitureImageId: i.furnitureImageId!, order: items.indexOf(i) + 1 }))
    onReorderedItemsChange(reordered)
  }, [items])

  useEffect(() => {
    onRemovedIdsChange(removedFiIds)
  }, [removedFiIds])

  const existingImageIds = items.map((i) => i.imageId)

  const handlePickerConfirm = (picked: PickedImage[]) => {
    const newEntries: GalleryEntry[] = picked.map((p) => ({
      localKey: nextKey(), imageId: p.imageId, imageUrl: p.imageUrl, imageName: p.imageName,
    }))
    setItems((prev) => [...prev, ...newEntries])
  }

  const handleUploadDone = (images: PickedImage[]) => {
    const newEntries: GalleryEntry[] = images.map((p) => ({
      localKey: nextKey(), imageId: p.imageId, imageUrl: p.imageUrl, imageName: p.imageName,
    }))
    setItems((prev) => [...prev, ...newEntries])
  }

  const handleRemove = (entry: GalleryEntry) => {
    setItems((prev) => prev.filter((i) => i.localKey !== entry.localKey))
    if (entry.furnitureImageId) {
      setRemovedFiIds((prev) => [...prev, entry.furnitureImageId!])
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.localKey === active.id)
      const newIdx = prev.findIndex((i) => i.localKey === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  // Alternativa al arrastre que siempre funciona (mouse, touch o teclado) — el drag con
  // dnd-kit puede fallar en touch por gesto/handle, esto no depende de ninguno de los dos.
  const moveItem = (localKey: string, direction: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.localKey === localKey)
      const newIdx = idx + direction
      if (idx < 0 || newIdx < 0 || newIdx >= prev.length) return prev
      return arrayMove(prev, idx, newIdx)
    })
  }

  const lightboxSlides = items
    .filter((i) => i.imageUrl)
    .map((i) => ({ src: i.imageUrl!, alt: i.imageName ?? '' }))

  const getLbIdx = (localKey: string) =>
    items.filter((i) => i.imageUrl).findIndex((i) => i.localKey === localKey)

  const pendingCount = items.filter((i) => !i.furnitureImageId).length

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground">
          <Images className="size-7 opacity-40" />
          <p className="text-xs">Sin imágenes de galería</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.localKey)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((entry, idx) => (
                <SortableItem
                  key={entry.localKey}
                  entry={entry}
                  disabled={disabled}
                  onRemove={() => handleRemove(entry)}
                  onClick={() => {
                    const lbIdx = getLbIdx(entry.localKey)
                    if (lbIdx >= 0) setLightboxIdx(lbIdx)
                  }}
                  onMoveBack={!disabled && idx > 0 ? () => moveItem(entry.localKey, -1) : undefined}
                  onMoveForward={!disabled && idx < items.length - 1 ? () => moveItem(entry.localKey, 1) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setPickerOpen(true)}>
          <ImagePlus className="mr-1.5 size-4" />
          Seleccionar imagen
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => setUploadOpen(true)}>
          <Upload className="mr-1.5 size-4" />
          Subir nueva
        </Button>
        {items.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {items.length} imagen{items.length !== 1 ? 'es' : ''}
            {pendingCount > 0 && (
              <span className="ml-1 text-primary">
                · {pendingCount} nueva{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        )}
      </div>

      <FurnitureGalleryAddPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        existingImageIds={existingImageIds}
        onConfirm={handlePickerConfirm}
      />

      <FurnitureGalleryUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={handleUploadDone}
      />

      <Lightbox
        open={lightboxIdx >= 0}
        close={() => setLightboxIdx(-1)}
        index={lightboxIdx}
        slides={lightboxSlides}
        plugins={[Zoom, Thumbnails]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        thumbnails={{ position: 'bottom', width: 72, height: 48, gap: 8, border: 0, borderRadius: 6 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
      />
    </div>
  )
}
