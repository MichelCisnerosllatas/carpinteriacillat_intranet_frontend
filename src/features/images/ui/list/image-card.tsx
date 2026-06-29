'use client'

import { useState } from 'react'
import { LoaderCircle, ImageIcon, Trash2, ExternalLink, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { formatBytes } from '../../lib/image-url'
import type { ImageItem } from '../../data/schema'

export function ImageCard({
  item,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  onDelete,
}: {
  item:           ImageItem
  isSelected:     boolean
  onToggleSelect: (item: ImageItem) => void
  onOpenLightbox: (item: ImageItem) => void
  onDelete:       (item: ImageItem) => void
}) {
  const [imgError, setImgError] = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const displayName = item.name ?? item.patch.split('/').pop() ?? item.patch

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        {!imgError ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {/* Clic en imagen → lightbox */}
            <button
              type="button"
              className="h-full w-full cursor-zoom-in"
              onClick={() => onOpenLightbox(item)}
            >
              <img
                src={item.url}
                alt={item.alt ?? displayName}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                onLoad={() => setLoaded(true)}
                onError={() => { setImgError(true); setLoaded(true) }}
              />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-8" />
            <span className="text-xs">Sin vista previa</span>
          </div>
        )}

        {/* Checkbox de selección — visible en hover o cuando está seleccionado */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSelect(item) }}
          className={`absolute left-1.5 top-1.5 z-10 transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected
            ? <CheckSquare className="size-5 text-primary drop-shadow" />
            : <Square className="size-5 text-white drop-shadow" />}
        </button>

        {/* Overlay de acciones al hacer hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          <div className="pointer-events-auto flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" className="size-8" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Abrir original</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  className="size-8"
                  onClick={(e) => { e.stopPropagation(); onDelete(item) }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="truncate text-xs font-medium">{displayName}</p>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="flex flex-col gap-1 text-xs">
              {item.title  && <span><span className="text-muted-foreground">Título:</span> {item.title}</span>}
              {item.alt    && <span><span className="text-muted-foreground">Alt:</span> {item.alt}</span>}
              <span><span className="text-muted-foreground">Ruta:</span> {item.patch}</span>
              {item.type   && <span><span className="text-muted-foreground">Tipo:</span> {item.type}</span>}
              {item.size  != null && <span><span className="text-muted-foreground">Tamaño:</span> {formatBytes(item.size)}</span>}
              {item.width != null && item.height != null && (
                <span><span className="text-muted-foreground">Dimensiones:</span> {item.width}×{item.height}px</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        <div className="mt-1 flex items-center gap-1">
          {item.type && (
            <Badge variant="outline" className="px-1 py-0 text-[10px]">
              {item.type.split('/')[1] ?? item.type}
            </Badge>
          )}
          {item.size != null && (
            <span className="text-[10px] text-muted-foreground">{formatBytes(item.size)}</span>
          )}
          {item.width != null && item.height != null && (
            <span className="ml-auto text-[10px] text-muted-foreground">{item.width}×{item.height}</span>
          )}
        </div>
      </div>
    </div>
  )
}
