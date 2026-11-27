'use client'

import { useEffect, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  HardDrive,
  ImagePlus,
  Loader2,
  LoaderCircle,
  Menu,
  RefreshCw,
  Search,
  ServerCrash,
  SquareCheck,
  SquareMinus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Can } from '@/features/auth/ui/can'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { swalConfirm } from '@/shared/lib/swal'
import { downloadUrlAsFile } from '@/shared/lib/download-url'
import { runBulkDownload } from '@/shared/lib/bulk-download'
import { useStorageGalleryStore } from '../../../stores/useStorageGalleryStore'
import { useStorageActionStore } from '../../../stores/useStorageActionStore'
import { StorageCard } from '../storage-card'
import { StorageUploadDialog } from '../../dialogs/storage-upload-dialog'
import type { BulkDeleteMode } from '../../../data/schema'
import { FolderSidebar } from './folder-sidebar'
import { BulkDeleteDialog } from './bulk-delete-dialog'

export function StorageGallery() {
  const {
    meta, filters, search, folders, selectedPaths, hasLoaded,
    isFetching, isError, message,
    load, loadDbRecords, loadFolders,
    setFolder, setSearch, selectAll, clearSelection,
    getFilteredItems, getSelectedItems, reset,
  } = useStorageGalleryStore()

  const { bulkAction, isActing } = useStorageActionStore()

  const [uploadOpen,      setUploadOpen]      = useState(false)
  const [bulkDialogOpen,  setBulkDialogOpen]  = useState(false)
  const [activeFolder,    setActiveFolder]    = useState<string>('all')
  const [folderSheetOpen, setFolderSheetOpen] = useState(false)
  const [lightboxIndex,   setLightboxIndex]   = useState(-1)

  useEffect(() => {
    const init = async () => {
      await loadDbRecords()
      await Promise.all([load(), loadFolders()])
    }
    void init()
    return () => reset()
  }, [])

  const items        = getFilteredItems()
  const selectedItems = getSelectedItems()
  const selectedCount = selectedPaths.size
  const currentPage  = filters.page ?? 1
  const lastPage     = meta?.last_page ?? 1

  // Build slides for centralized lightbox (images only)
  const imageItems = items.filter((f) => f.isImage)
  const slides     = imageItems.map((f) => ({ src: f.url, alt: f.dbRecord?.image_alt ?? f.filename }))
  const pathToSlideIndex = new Map(imageItems.map((f, i) => [f.path, i]))

  const handleFolderClick = (folder: string) => {
    setActiveFolder(folder)
    setFolder(folder)
  }

  const handleBulkDelete = async (mode: BulkDeleteMode) => {
    const { success, failed } = await bulkAction(selectedItems, mode)
    if (success > 0) toastSuccess('Eliminación completada', `${success} archivo${success !== 1 ? 's' : ''} eliminado${success !== 1 ? 's' : ''}.`)
    if (failed > 0)  toastError('Algunos fallaron', `${failed} archivo${failed !== 1 ? 's' : ''} no pudo${failed !== 1 ? 'n' : ''} eliminarse.`)
    clearSelection()
    setBulkDialogOpen(false)
    await Promise.all([load({ page: 1 }), loadDbRecords(), loadFolders()])
  }

  const handleBulkDownload = async () => {
    const toDownload = selectedItems
    const count = toDownload.length
    const confirmed = await swalConfirm({
      title: `¿Descargar ${count} archivo${count !== 1 ? 's' : ''}?`,
      text: 'Se descargan uno por uno. Puedes seguir usando la app mientras tanto — el progreso queda en la campanita de notificaciones.',
      confirmText: 'Descargar',
    })
    if (!confirmed) return

    clearSelection()
    runBulkDownload({
      label: 'Servidor · Imágenes',
      route: '/images/storage',
      items: toDownload.map((file) => ({
        run: () => downloadUrlAsFile(file.url, file.filename),
      })),
    })
  }

  if (!hasLoaded) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Cargando almacenamiento...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <ServerCrash className="size-6 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">Error al cargar el almacenamiento</p>
          {message && <p className="mt-1 text-xs text-muted-foreground">{message}</p>}
        </div>
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>
          <RefreshCw className="mr-2 size-4" />Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-0">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        {/* Mobile: folder button */}
        <Button
          size="sm"
          variant="outline"
          className="md:hidden shrink-0"
          onClick={() => setFolderSheetOpen(true)}
        >
          <Menu className="size-4 mr-1.5" />
          {activeFolder === 'all' ? 'Carpetas' : activeFolder.split('/').pop()}
        </Button>

        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar archivo..."
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5">
            <HardDrive className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{meta?.total ?? 0} archivos</span>
          </div>

          {isFetching ? (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void load({ page: 1 })}
                  className="hidden sm:flex"
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar lista</TooltipContent>
            </Tooltip>
          )}


          {/* <Button size="icon" variant="outline" className="size-9 sm:hidden" onClick={() => void load({ page: 1 })}>
            <RefreshCw className="size-4" />
          </Button> */}

          {/* Solo si tiene permiso de subir imágenes (ver ROLES_Y_PERMISOS.md) */}
          <Can permission="storage_images.create">
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="size-3.5 mr-1.5" />
              <span className="hidden sm:inline">Subir imagen</span>
              <span className="sm:hidden">Subir</span>
            </Button>
          </Can>
        </div>
      </div>

      <div className="mt-4 flex flex-1 gap-4 min-w-0">
        {/* Desktop folder sidebar — sticky debajo del header (h-16 = 4rem) */}
        <aside className="hidden md:block w-52 shrink-0 self-start sticky top-16">
          <div className="max-h-[calc(100svh-5rem)] overflow-y-auto rounded-xl border bg-card p-2">
            <FolderSidebar
              folders={folders}
              activeFolder={activeFolder}
              onSelect={(f) => { handleFolderClick(f) }}
            />
          </div>
        </aside>

        {/* Mobile folder Sheet */}
        <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
          <SheetContent side="left" className="w-64 p-4">
            <SheetHeader className="mb-3">
              <SheetTitle className="text-sm">Carpetas</SheetTitle>
            </SheetHeader>
            <FolderSidebar
              folders={folders}
              activeFolder={activeFolder}
              onSelect={(f) => { handleFolderClick(f); setFolderSheetOpen(false) }}
            />
          </SheetContent>
        </Sheet>

        {/* Main grid area */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">

          {/* Selection bar — sticky debajo del header cuando hay selección */}
          {items.length > 0 && (
            <div className={cn(
              'flex items-center gap-2 overflow-x-auto no-scrollbar rounded-xl transition-all sm:gap-3',
              selectedCount > 0
                // Fondo invertido: bg-background/90 queda casi idéntico al fondo de la
                // página en modo oscuro y la barra se vuelve invisible al seleccionar.
                ? 'sticky top-16 z-20 border border-foreground/10 bg-foreground text-background px-3 py-1.5 shadow-md shadow-black/30 dark:shadow-black/60'
                : ''
            )}>
              <Button
                size="sm"
                variant="ghost"
                className={cn('shrink-0 gap-2 h-8 px-2', selectedCount > 0 ? '' : 'text-muted-foreground')}
                onClick={selectedCount === items.length ? clearSelection : selectAll}
              >
                {selectedCount === items.length
                  ? <SquareCheck className="size-4 text-primary" />
                  : selectedCount > 0
                    ? <SquareMinus className="size-4 text-primary" />
                    : <SquareMinus className="size-4 opacity-30" />
                }
                <span className="whitespace-nowrap text-xs">
                  {selectedCount > 0
                    ? `${selectedCount} seleccionado${selectedCount > 1 ? 's' : ''}`
                    : 'Seleccionar todos'}
                </span>
              </Button>
              {selectedCount > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4 shrink-0 bg-background/20" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 gap-1.5 h-8 px-2"
                    onClick={() => void handleBulkDownload()}
                  >
                    <Download className="size-3.5" />
                    <span className="hidden text-xs sm:inline">Descargar</span>
                  </Button>
                  {/* Solo si tiene permiso de eliminar */}
                  <Can permission="storage_images.delete">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 gap-1.5 h-8 px-2 text-red-400 hover:bg-red-950 hover:text-red-300 dark:text-red-600 dark:hover:bg-red-50 dark:hover:text-red-700"
                      onClick={() => setBulkDialogOpen(true)}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden text-xs sm:inline">Eliminar seleccionados</span>
                    </Button>
                  </Can>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 gap-1.5 h-8 px-2"
                    onClick={clearSelection}
                  >
                    <X className="size-3.5" />
                    <span className="hidden text-xs sm:inline">Deseleccionar</span>
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Grid */}
          {items.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <ImagePlus className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No hay archivos</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {search ? 'No hay resultados para tu búsqueda' : 'Esta carpeta está vacía'}
                </p>
              </div>
              <Can permission="storage_images.create">
                <Button size="sm" onClick={() => setUploadOpen(true)}>
                  <Upload className="mr-2 size-4" />Subir imagen
                </Button>
              </Can>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {items.map((file) => (
                <StorageCard
                  key={file.path}
                  file={file}
                  isSelected={selectedPaths.has(file.path)}
                  onToggleSelect={(path) => useStorageGalleryStore.getState().toggleSelect(path)}
                  onPreview={file.isImage ? () => setLightboxIndex(pathToSlideIndex.get(file.path) ?? 0) : undefined}
                />
              ))}
            </div>
          )}

          {/* Pagination — siempre visible */}
          {meta && (
            <div className="mt-auto flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {meta.total > 0
                  ? `${meta.from ?? 1}–${meta.to ?? meta.total} de ${meta.total} archivo${meta.total !== 1 ? 's' : ''}`
                  : 'Sin archivos'}
              </p>
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      disabled={currentPage <= 1 || isFetching}
                      onClick={() => void load({ page: currentPage - 1 })}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Página anterior</TooltipContent>
                </Tooltip>
                <span className="min-w-[72px] text-center text-xs text-muted-foreground">
                  {currentPage} / {lastPage}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      disabled={currentPage >= lastPage || isFetching}
                      onClick={() => void load({ page: currentPage + 1 })}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Página siguiente</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Centralized lightbox — one instance for all gallery images */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={slides}
        plugins={[Zoom, Thumbnails]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
      />

      {/* Upload dialog */}
      <StorageUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Bulk delete dialog */}
      <BulkDeleteDialog
        open={bulkDialogOpen}
        count={selectedCount}
        files={selectedItems}
        isActing={isActing}
        onClose={() => setBulkDialogOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
