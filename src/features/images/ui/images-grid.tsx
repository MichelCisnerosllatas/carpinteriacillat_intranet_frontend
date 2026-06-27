'use client'

import { useEffect, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  LoaderCircle, ImageIcon, Trash2, ExternalLink, RefreshCw, CheckSquare, Square,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { formatBytes } from '../lib/image-url'
import { useImageListStore } from '../stores/useImageListStore'
import { useImageDeleteStore } from '../stores/useImageDeleteStore'
import type { ImageItem } from '../data/schema'

// ── ImageCard ─────────────────────────────────────────────────────────────────

function ImageCard({
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

// ── ImagesGrid ────────────────────────────────────────────────────────────────

export function ImagesGrid() {
  const {
    items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message,
    load, reset,
  } = useImageListStore()
  const { deleteItem, bulkDeleteItems } = useImageDeleteStore()

  const [selected,    setSelected]    = useState<Set<number>>(new Set())
  const [lightboxIdx, setLightboxIdx] = useState(-1)
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => { void load() }, [])

  // Reset selection when items change (e.g. page change)
  useEffect(() => { setSelected(new Set()) }, [items])

  const toggleSelect = (item: ImageItem) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  const openLightbox = (item: ImageItem) => {
    const idx = items.findIndex((i) => i.id === item.id)
    if (idx >= 0) setLightboxIdx(idx)
  }

  const handleDelete = async (item: ImageItem) => {
    const displayName = item.name ?? item.patch.split('/').pop() ?? item.patch
    const confirmed   = await swalDeleteConfirm(
      `¿Eliminar "${displayName}"?`,
      'Se eliminará el registro de la base de datos. Esta acción no se puede deshacer.',
    )
    if (!confirmed) return
    const ok = await deleteItem(item.id)
    if (ok) toastSuccess('Imagen eliminada', `"${displayName}" fue eliminada.`)
    else     toastError('Error al eliminar', 'No se pudo eliminar la imagen.')
  }

  const handleBulkDelete = async () => {
    const count     = selected.size
    const confirmed = await swalDeleteConfirm(
      `¿Eliminar ${count} imagen${count !== 1 ? 'es' : ''}?`,
      'Esta acción eliminará los registros seleccionados de la base de datos y no se puede deshacer.',
    )
    if (!confirmed) return
    setBulkLoading(true)
    const ok = await bulkDeleteItems(Array.from(selected))
    setBulkLoading(false)
    if (ok) {
      toastSuccess('Imágenes eliminadas', `${count} imagen${count !== 1 ? 'es' : ''} eliminada${count !== 1 ? 's' : ''}.`)
      setSelected(new Set())
    } else {
      toastError('Error al eliminar', 'No se pudieron eliminar las imágenes seleccionadas.')
    }
  }

  const currentPage = filters.page ?? 1
  const lastPage    = meta?.last_page ?? 1

  // Lightbox slides — todos los items de la página actual
  const lightboxSlides = items.map((item) => ({
    src:         item.url,
    alt:         item.name ?? item.patch,
    downloadUrl: item.url,
  }))

  // ── Loading / Error states ──
  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando imágenes...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar imágenes</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">

        {/* ── Header bar ── */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total ?? 0} imagen(es) en total` : 'Cargando...'}
          </p>
          <div className="flex items-center gap-2">
            {isFetching && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LoaderCircle className="size-3.5 animate-spin" />Actualizando...
              </div>
            )}
            <Button size="sm" variant="outline" onClick={() => void load({ page: 1 })}>
              <RefreshCw className="size-3.5 mr-1.5" />Recargar
            </Button>
          </div>
        </div>

        {/* ── Botón seleccionar todo ── */}
        {items.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex w-fit items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {selected.size === items.length && items.length > 0
              ? <CheckSquare className="size-4 text-primary" />
              : <Square className="size-4" />}
            {selected.size > 0
              ? `${selected.size} seleccionada${selected.size !== 1 ? 's' : ''} de ${items.length}`
              : 'Seleccionar todo'}
          </button>
        )}

        {/* ── Grid ── */}
        {items.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
            <ImageIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No hay imágenes para mostrar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <ImageCard
                key={item.id}
                item={item}
                isSelected={selected.has(item.id)}
                onToggleSelect={toggleSelect}
                onOpenLightbox={openLightbox}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* ── Paginación — siempre visible cuando hay datos ── */}
        {hasLoaded && meta && (
          <div className="mt-auto flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {meta ? `Mostrando ${meta.from ?? 0} – ${meta.to ?? 0} de ${meta.total ?? 0}` : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1 || isFetching}
                onClick={() => void load({ page: currentPage - 1 })}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {lastPage}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= lastPage || isFetching}
                onClick={() => void load({ page: currentPage + 1 })}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Barra flotante de acciones masivas ── */}
      <DataTableBulkActions
        selectedCount={selected.size}
        isLoading={bulkLoading}
        onDelete={handleBulkDelete}
        onClear={() => setSelected(new Set())}
      />

      {/* ── Lightbox (fuera del grid para evitar conflictos) ── */}
      <Lightbox
        open={lightboxIdx >= 0}
        close={() => setLightboxIdx(-1)}
        index={lightboxIdx}
        slides={lightboxSlides}
        plugins={[Zoom, Thumbnails, Download]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        thumbnails={{ position: 'bottom', width: 72, height: 48, gap: 8, border: 0, borderRadius: 6 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
      />
    </>
  )
}
