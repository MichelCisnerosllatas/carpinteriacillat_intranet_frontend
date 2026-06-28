'use client'

import { useState } from 'react'
import { Eye, MoreHorizontal, Pencil, CheckCircle2, XCircle, Trash2, Sofa, Images } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { getStateOption } from '@/shared/config/entity-states'
import type { Furniture } from '../../data/schema'

interface FurnitureCardProps {
  item: Furniture
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  onToggleState: () => void
  onDelete: () => void
}

export function FurnitureCard({
  item,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  onToggleState,
  onDelete,
}: FurnitureCardProps) {
  const stateOpt       = getStateOption(item.stateValue)
  const isActive       = item.stateValue === 1
  const [lbIdx, setLbIdx] = useState(-1)

  // Slides: cover + gallery (max 10 in lightbox)
  const slides = [
    ...(item.imageUrl ? [{ src: item.imageUrl, alt: item.imageName ?? item.name }] : []),
    ...item.galleryImages
      .filter((g) => g.imageUrl)
      .map((g) => ({ src: g.imageUrl!, alt: g.imageName ?? '' })),
  ]

  const galleryPreview = item.galleryImages.filter((g) => g.imageUrl).slice(0, 3)
  const extraCount     = item.galleryImages.length > 3 ? item.galleryImages.length - 3 : 0

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <button
            type="button"
            onClick={() => setLbIdx(0)}
            className="h-full w-full cursor-zoom-in"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <Sofa className="size-10 text-muted-foreground/30" />
            <span className="text-[11px] text-muted-foreground/50">Sin imagen</span>
          </div>
        )}

        <div className="absolute right-2 top-2">
          <Badge
            variant="outline"
            className={cn('bg-background/85 text-xs backdrop-blur-sm', stateOpt.badge)}
          >
            {stateOpt.label}
          </Badge>
        </div>

        <div className="absolute left-2 top-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="border-background/80 bg-background/85 backdrop-blur-sm"
            aria-label="Seleccionar"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{item.name}</h3>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground" title={item.description}>
              {item.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px] font-normal">{item.categoryName}</Badge>
          <Badge variant="outline"   className="text-[10px] font-normal">{item.typecolorName}</Badge>
          <Badge variant="outline"   className="text-[10px] font-normal">{item.typewoodName}</Badge>
        </div>

        {(item.largo != null || item.ancho != null) && (
          <p className="text-[11px] text-muted-foreground/70">
            {[
              item.largo != null && `${item.largo} cm largo`,
              item.ancho != null && `${item.ancho} cm ancho`,
            ].filter(Boolean).join(' × ')}
          </p>
        )}

        {/* Gallery thumbnails strip */}
        {galleryPreview.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Images className="size-3 shrink-0 text-muted-foreground/60" />
            <div className="flex gap-1">
              {galleryPreview.map((g, idx) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setLbIdx(item.imageUrl ? idx + 1 : idx)}
                  className="size-7 overflow-hidden rounded border transition-transform hover:scale-110 cursor-zoom-in"
                >
                  <img
                    src={g.imageUrl!}
                    alt={g.imageName ?? ''}
                    className="size-full object-cover"
                    onError={(e) => { ;(e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </button>
              ))}
              {extraCount > 0 && (
                <button
                  type="button"
                  onClick={() => setLbIdx(item.imageUrl ? galleryPreview.length + 1 : galleryPreview.length)}
                  className="flex size-7 items-center justify-center rounded border bg-muted text-[10px] font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  +{extraCount}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={onView}>
          <Eye className="size-3.5" /> Ver detalle
        </Button>
        <div className="flex items-center gap-0.5">
          <Button size="icon" variant="ghost" className="size-7" onClick={onEdit} title="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-7">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onToggleState}>
                {isActive
                  ? <><XCircle className="mr-2 size-4 text-orange-500" />Desactivar</>
                  : <><CheckCircle2 className="mr-2 size-4 text-teal-500" />Activar</>
                }
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-500!">
                <Trash2 className="mr-2 size-4" />Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lightbox */}
      {slides.length > 0 && (
        <Lightbox
          open={lbIdx >= 0}
          close={() => setLbIdx(-1)}
          index={lbIdx}
          slides={slides}
          plugins={[Zoom]}
          controller={{ closeOnBackdropClick: true }}
          zoom={{ maxZoomPixelRatio: 4 }}
          styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
        />
      )}
    </div>
  )
}
