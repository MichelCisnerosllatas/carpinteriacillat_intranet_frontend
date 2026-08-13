'use client'

import { useEffect, useRef, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  LoaderCircle, ImageIcon, CheckSquare, Square, Search, X, Folder,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { useImageListStore } from '../../stores/useImageListStore'
import { useImageDeleteStore } from '../../stores/useImageDeleteStore'
import { getImageFolder } from '../../lib/image-url'
import type { ImageItem } from '../../data/schema'
import { ImageCard } from './image-card'

export function ImagesGrid() {
  const {
    items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message,
    load, reset,
  } = useImageListStore()
  const { deleteItem, bulkDeleteItems } = useImageDeleteStore()

  const [selected,    setSelected]    = useState<Set<number>>(new Set())
  const [lightboxIdx, setLightboxIdx] = useState(-1)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [search,      setSearch]      = useState(filters.search ?? '')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const appliedSearch = useRef(search)

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search

    const t = window.setTimeout(() => {
      void load({ search, page: 1 })
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

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

  // Agrupa las miniaturas de la página actual por carpeta de storage — "Sin carpeta"
  // (raíz) siempre primero, luego el resto en orden alfabético. Solo agrupa visualmente
  // lo cargado en esta página; no reordena entre páginas.
  const groupKeys: string[] = []
  items.forEach((item) => {
    const key = getImageFolder(item.patch)
    if (!groupKeys.includes(key)) groupKeys.push(key)
  })
  groupKeys.sort((a, b) => {
    if (a === b) return 0
    if (a === '') return -1
    if (b === '') return 1
    return a.localeCompare(b)
  })
  const groups = groupKeys.map((key) => ({
    key,
    items: items.filter((item) => getImageFolder(item.patch) === key),
  }))

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total ?? 0} imagen(es) en total` : 'Cargando...'}
          </p>
        </div>

        {/* ── Buscador — expandido en desktop, ícono colapsable en mobile ── */}
        <div className="flex items-center gap-2">
          {/* Desktop */}
          <div className="relative hidden w-full sm:block sm:w-[320px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, título o texto alternativo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8"
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-1 items-center gap-2 sm:hidden">
            {mobileSearchOpen ? (
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Buscar imágenes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => { if (!search) setMobileSearchOpen(false) }}
                  className="h-8 pl-8"
                />
              </div>
            ) : (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-8"
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search className="size-4" />
              </Button>
            )}
          </div>

          {search && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isFetching}
              onClick={() => { setSearch(''); setMobileSearchOpen(false) }}
            >
              <X className="size-3.5 sm:hidden" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          )}
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

        {/* ── Grid, agrupado por carpeta ── */}
        {items.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
            <ImageIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No hay imágenes para mostrar.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.key || '__root__'} className="flex flex-col gap-2.5">
                {/* Encabezado de carpeta — solo si hay más de una carpeta en la página actual */}
                {groups.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-md',
                      group.key ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-muted',
                    )}>
                      {group.key
                        ? <Folder className="size-3.5 text-amber-600 dark:text-amber-400" />
                        : <ImageIcon className="size-3.5 text-muted-foreground" />}
                    </div>
                    <span className="truncate text-sm font-medium">
                      {group.key || 'Sin carpeta'}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {group.items.length}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {group.items.map((item) => (
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
              </div>
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
