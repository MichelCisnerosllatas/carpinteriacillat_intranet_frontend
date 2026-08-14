'use client'

import { useState } from 'react'
import { LoaderCircle, ImageIcon, Trash2, ExternalLink, CheckSquare, Square, MoreVertical } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { useLongPress } from '@/shared/lib/use-long-press'
import { cn } from '@/shared/lib/utils'
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

  // En touch no hay :hover para revelar el checkbox: mantener presionado la foto activa
  // el modo selección. Pero el tap sobre la foto SIEMPRE abre la vista previa —incluso con
  // el modo selección ya activo—, para no perder el "ver" mientras se seleccionan varias.
  // Sumar/quitar imágenes de la selección se hace tocando el checkbox (ya siempre visible
  // en touch) o con otro mantener-presionado.
  const tapHandlers = useLongPress({
    onLongPress: () => onToggleSelect(item),
    onTap:       () => onOpenLightbox(item),
  })

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
            {/* Tap → lightbox (o alternar selección si el modo selección ya está activo) · mantener presionado → activarlo */}
            <button
              type="button"
              className="h-full w-full cursor-zoom-in touch-manipulation select-none"
              {...tapHandlers}
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

        {/* Checkbox de selección — en touch siempre visible (pointer-coarse) y con un
            área de toque de 40px (el dedo no acierta un ícono de 20px "pelado"); con
            mouse, visible en hover o cuando ya está seleccionada, del tamaño de siempre. */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSelect(item) }}
          className={cn(
            'absolute left-0.5 top-0.5 z-10 flex items-center justify-center rounded-full p-1 transition-opacity',
            'pointer-coarse:p-2.5 pointer-coarse:bg-black/40 pointer-coarse:opacity-100',
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          {isSelected
            ? <CheckSquare className="size-5 text-primary drop-shadow" />
            : <Square className="size-5 text-white drop-shadow" />}
        </button>

        {/* Menú de acciones — en touch siempre visible (pointer-coarse), con un botón de
            40px de área de toque (antes 28px, insuficiente para el dedo). Reemplaza el
            overlay central de antes: en touch un overlay que solo aparecía con :hover
            dejaba "Ver"/"Eliminar" inalcanzables. */}
        <div
          className="absolute right-0.5 top-0.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="size-7 bg-black/50 text-white hover:bg-black/70 pointer-coarse:size-10"
                    >
                      <MoreVertical className="size-4 pointer-coarse:size-5" />
                      <span className="sr-only">Más acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Más acciones</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild className="pointer-coarse:py-2.5">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 size-4" /> Abrir original
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500! pointer-coarse:py-2.5"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="mr-2 size-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
