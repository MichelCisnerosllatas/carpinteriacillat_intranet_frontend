'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  LoaderCircle, ImageIcon, CheckSquare, Square, Search, X, Folder, Menu,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { useImageListStore } from '../../stores/useImageListStore'
import { useImageDeleteStore } from '../../stores/useImageDeleteStore'
import { useImagesViewStore } from '../../stores/useImagesViewStore'
import { getImageFolder } from '../../lib/image-url'
import type { ImageItem } from '../../data/schema'
import { ImageCard } from './image-card'
import { ImagesFolderSidebar, useImageFolderTree } from './images-folder-sidebar'

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
  const [folderFilter,    setFolderFilter]    = useState('') // '' = todas las carpetas
  const [folderSheetOpen, setFolderSheetOpen] = useState(false)

  const { tree: folderTree, isLoading: isFolderTreeLoading } = useImageFolderTree()
  const { folderSidebarCollapsed, setFolderSidebarCollapsed } = useImagesViewStore()

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

  // Filtro por carpeta — en el cliente, sobre la página ya cargada (ver el per_page
  // alto en useImageListStore). Incluye la carpeta elegida y todas sus subcarpetas.
  // Memoizado: sin esto, cada render crearía un array nuevo y el efecto de abajo
  // (que depende de esta referencia) resetearía la selección todo el tiempo.
  const visibleItems = useMemo(() => (
    folderFilter
      ? items.filter((item) => {
          const itemFolder = getImageFolder(item.patch)
          return itemFolder === folderFilter || itemFolder.startsWith(folderFilter + '/')
        })
      : items
  ), [items, folderFilter])

  // Reset selection when the visible set changes (carpeta, página, búsqueda...)
  useEffect(() => { setSelected(new Set()) }, [visibleItems])

  const toggleSelect = (item: ImageItem) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === visibleItems.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(visibleItems.map((i) => i.id)))
    }
  }

  const openLightbox = (item: ImageItem) => {
    const idx = visibleItems.findIndex((i) => i.id === item.id)
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

  // Agrupa las miniaturas visibles por carpeta de storage — el ORDEN DE LOS GRUPOS
  // sigue siendo el mismo que visibleItems (más reciente primero): un grupo aparece
  // en la posición de su imagen más reciente, no alfabético. Ordenar alfabético acá
  // rompía el "más nuevo primero" (una carpeta como "camas" podía terminar antes que
  // "puertas" aunque "puertas" tuviera la imagen recién subida). Dentro de cada grupo
  // el orden cronológico también se conserva.
  const groupKeys: string[] = []
  visibleItems.forEach((item) => {
    const key = getImageFolder(item.patch)
    if (!groupKeys.includes(key)) groupKeys.push(key)
  })
  const groups = groupKeys.map((key) => ({
    key,
    items: visibleItems.filter((item) => getImageFolder(item.patch) === key),
  }))

  // Lightbox slides — todos los items visibles (respeta el filtro por carpeta)
  const lightboxSlides = visibleItems.map((item) => ({
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

  const activeFolderLabel = folderFilter.split('/').pop() ?? folderFilter

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">

        {/* ── Barra compacta: contador + filtro activo + buscador, todo en una fila ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="whitespace-nowrap text-sm text-muted-foreground">
              {folderFilter
                ? `${visibleItems.length} imagen(es) en "${activeFolderLabel}"`
                : meta ? `${meta.total ?? 0} imagen(es) en total` : 'Cargando...'}
            </p>
            {folderFilter && (
              <button
                type="button"
                onClick={() => setFolderFilter('')}
                className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
              >
                <Folder className="size-3" />
                {activeFolderLabel}
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Buscador — a la derecha, expandido en desktop, ícono colapsable en mobile */}
          <div className="ml-auto flex items-center gap-2">
            {/* Desktop */}
            <div className="relative hidden sm:block sm:w-56 lg:w-72">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, título o alt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8"
              />
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-2 sm:hidden">
              {mobileSearchOpen ? (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Buscar imágenes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => { if (!search) setMobileSearchOpen(false) }}
                    className="h-8 w-40 pl-8"
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

            {/* Mobile: botón para abrir el árbol de carpetas */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="md:hidden"
              onClick={() => setFolderSheetOpen(true)}
            >
              <Menu className="mr-1.5 size-3.5" />
              Carpetas
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-3 min-w-0">
          {/* ── Sidebar de carpetas — desktop, fijo al hacer scroll, contraíble ── */}
          <aside
            className={cn(
              'hidden md:block shrink-0 self-start sticky top-16 transition-[width] duration-150',
              folderSidebarCollapsed ? 'w-9' : 'w-56',
            )}
          >
            {folderSidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setFolderSidebarCollapsed(false)}
                    className="flex size-9 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <PanelLeftOpen className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Mostrar carpetas</TooltipContent>
              </Tooltip>
            ) : (
              <div className="max-h-[calc(100svh-6rem)] overflow-y-auto rounded-xl border bg-card p-2">
                <div className="mb-1.5 flex items-center justify-between border-b px-1 pb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Carpetas
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setFolderSidebarCollapsed(true)}
                        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <PanelLeftClose className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Ocultar carpetas</TooltipContent>
                  </Tooltip>
                </div>
                <ImagesFolderSidebar
                  tree={folderTree}
                  isLoading={isFolderTreeLoading}
                  activeFolder={folderFilter}
                  totalCount={meta?.total ?? items.length}
                  onSelect={setFolderFilter}
                />
              </div>
            )}
          </aside>

          {/* ── Sidebar de carpetas — mobile, en un Sheet lateral ── */}
          <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
            <SheetContent side="left" className="w-64 p-4">
              <SheetHeader className="mb-3">
                <SheetTitle className="text-sm">Carpetas</SheetTitle>
              </SheetHeader>
              <ImagesFolderSidebar
                tree={folderTree}
                isLoading={isFolderTreeLoading}
                activeFolder={folderFilter}
                totalCount={meta?.total ?? items.length}
                onSelect={(f) => { setFolderFilter(f); setFolderSheetOpen(false) }}
              />
            </SheetContent>
          </Sheet>

          {/* ── Columna principal ── */}
          <div className="flex flex-1 flex-col gap-4 min-w-0">

            {/* ── Botón seleccionar todo ── */}
            {visibleItems.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex w-fit items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {selected.size === visibleItems.length && visibleItems.length > 0
                  ? <CheckSquare className="size-4 text-primary" />
                  : <Square className="size-4" />}
                {selected.size > 0
                  ? `${selected.size} seleccionada${selected.size !== 1 ? 's' : ''} de ${visibleItems.length}`
                  : 'Seleccionar todo'}
              </button>
            )}

            {/* ── Grid, agrupado por carpeta ── */}
            {visibleItems.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
                <ImageIcon className="size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {folderFilter ? 'No hay imágenes en esta carpeta.' : 'No hay imágenes para mostrar.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {groups.map((group) => (
                  <div key={group.key || '__root__'} className="flex flex-col gap-2.5">
                    {/* Encabezado de carpeta — solo si hay más de una carpeta visible */}
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

                    {/* auto-fill en vez de breakpoints fijos: las columnas aumentan solas
                        según el ancho disponible, en lugar de quedarse fijas y solo agrandar
                        las tarjetas en pantallas grandes. */}
                    <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
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
              <div className="mt-auto flex flex-col gap-1.5 border-t pt-4">
                <div className="flex items-center justify-between">
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
                {/* El filtro por carpeta solo mira la página cargada — si hay más páginas,
                    puede haber imágenes de esta carpeta que todavía no se muestran. */}
                {folderFilter && lastPage > 1 && (
                  <p className="text-[11px] text-muted-foreground">
                    El filtro de carpeta solo se aplica a esta página. Avanza de página para ver el resto.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
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
