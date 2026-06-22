'use client'

import { useEffect, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Folder, FolderOpen, HardDrive, ImagePlus,
  Loader2, LoaderCircle, Menu, RefreshCw, Search, ServerCrash,
  SquareCheck, SquareMinus, Trash2, Upload, X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageGalleryStore } from '../stores/useStorageGalleryStore'
import { useStorageActionStore } from '../stores/useStorageActionStore'
import { StorageCard } from './storage-card'
import { StorageUploadDialog } from './storage-upload-dialog'
import type { BulkDeleteMode } from '../data/schema'

const ChevronRightIcon = ChevronRight

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
            <Button
              size="sm"
              variant="outline"
              onClick={() => void load({ page: 1 })}
              className="hidden sm:flex"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
            </Button>
          )}        


          {/* <Button size="icon" variant="outline" className="size-9 sm:hidden" onClick={() => void load({ page: 1 })}>
            <RefreshCw className="size-4" />
          </Button> */}

          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="size-3.5 mr-1.5" />
            <span className="hidden sm:inline">Subir imagen</span>
            <span className="sm:hidden">Subir</span>
          </Button>
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
              'flex items-center gap-3 rounded-xl transition-all',
              selectedCount > 0
                ? 'sticky top-16 z-20 border bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur-sm'
                : ''
            )}>
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 text-muted-foreground h-8 px-2"
                onClick={selectedCount === items.length ? clearSelection : selectAll}
              >
                {selectedCount === items.length
                  ? <SquareCheck className="size-4 text-primary" />
                  : selectedCount > 0
                    ? <SquareMinus className="size-4 text-primary" />
                    : <SquareMinus className="size-4 opacity-30" />
                }
                <span className="text-xs">
                  {selectedCount > 0
                    ? `${selectedCount} seleccionado${selectedCount > 1 ? 's' : ''}`
                    : 'Seleccionar todos'}
                </span>
              </Button>
              {selectedCount > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/5 h-8 px-2"
                    onClick={() => setBulkDialogOpen(true)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="text-xs">Eliminar seleccionados</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-muted-foreground h-8 px-2"
                    onClick={clearSelection}
                  >
                    <X className="size-3.5" />
                    <span className="text-xs">Deseleccionar</span>
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
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Upload className="mr-2 size-4" />Subir imagen
              </Button>
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
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8"
                  disabled={currentPage <= 1 || isFetching}
                  onClick={() => void load({ page: currentPage - 1 })}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-[72px] text-center text-xs text-muted-foreground">
                  {currentPage} / {lastPage}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8"
                  disabled={currentPage >= lastPage || isFetching}
                  onClick={() => void load({ page: currentPage + 1 })}
                >
                  <ChevronRight className="size-4" />
                </Button>
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

// ─── Folder sidebar (shared between desktop aside + mobile Sheet) ─────────────

function FolderSidebar({
  folders, activeFolder, onSelect,
}: {
  folders: string[]; activeFolder: string; onSelect: (path: string) => void
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
          activeFolder === 'all'
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <HardDrive className="size-3.5 shrink-0" />
        <span>Todas</span>
      </button>
      {buildFolderTree(folders).map((node) => (
        <FolderTreeItem
          key={node.path}
          node={node}
          activeFolder={activeFolder}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  )
}

// ─── Folder tree helpers ──────────────────────────────────────────────────────

type FolderNode = { name: string; path: string; children: FolderNode[] }

function buildFolderTree(folders: string[]): FolderNode[] {
  const root: FolderNode[] = []
  const nodeMap = new Map<string, FolderNode>()

  // Sort ensures parents always come before children
  const sorted = [...folders].filter((f) => f !== '(raíz)').sort()

  for (const folderPath of sorted) {
    const parts      = folderPath.split('/')
    const name       = parts[parts.length - 1]
    const parentPath = parts.slice(0, -1).join('/')
    const node: FolderNode = { name, path: folderPath, children: [] }
    nodeMap.set(folderPath, node)

    const parent = parentPath ? nodeMap.get(parentPath) : null
    if (parent) parent.children.push(node)
    else root.push(node)
  }

  // Add "(raíz)" at the top if present
  if (folders.includes('(raíz)')) {
    root.unshift({ name: '(raíz)', path: '(raíz)', children: [] })
  }

  return root
}

function FolderTreeItem({
  node, activeFolder, onSelect, depth = 0,
}: {
  node: FolderNode; activeFolder: string
  onSelect: (path: string) => void; depth?: number
}) {
  const isActive   = activeFolder === node.path
  const isAncestor = activeFolder.startsWith(node.path + '/')
  const [open, setOpen] = useState(isActive || isAncestor)
  const hasChildren = node.children.length > 0

  // Auto-expand when descendant becomes active
  useEffect(() => {
    if (isActive || isAncestor) setOpen(true)
  }, [isActive, isAncestor])

  return (
    <div>
      <div
        className={cn(
          'flex w-full items-center rounded-lg text-xs transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => hasChildren && setOpen((p) => !p)}
          className={cn('flex size-5 shrink-0 items-center justify-center', !hasChildren && 'cursor-default opacity-0')}
          tabIndex={-1}
        >
          {open ? <ChevronDown className="size-3" /> : <ChevronRightIcon className="size-3" />}
        </button>

        {/* Folder label (click = filter) */}
        <button
          onClick={() => onSelect(node.path)}
          className="flex flex-1 items-center gap-1.5 overflow-hidden py-1.5 pr-2 text-left"
        >
          {open && hasChildren
            ? <FolderOpen className="size-3.5 shrink-0" />
            : <Folder className="size-3.5 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.path}
              node={child}
              activeFolder={activeFolder}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BulkDeleteDialog({
  open, count, files, isActing, onClose, onConfirm,
}: {
  open: boolean
  count: number
  files: ReturnType<typeof useStorageGalleryStore.getState>['items']
  isActing: boolean
  onClose: () => void
  onConfirm: (mode: BulkDeleteMode) => void
}) {
  const withDb    = files.filter((f) => f.dbRecord !== null).length
  const withoutDb = files.filter((f) => f.dbRecord === null).length

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isActing && onClose()}>
      <DialogContent
        className="max-w-sm"
        showCloseButton={!isActing}
        onInteractOutside={(e) => { if (isActing) e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (isActing) e.preventDefault() }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            Eliminar {count} archivo{count > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription>
            Elige qué deseas eliminar de cada archivo seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Con registro en BD</span>
            <Badge variant="secondary">{withDb}</Badge>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-muted-foreground">Huérfanos (sin BD)</span>
            <Badge variant="outline">{withoutDb}</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <BulkOption
            onClick={() => onConfirm('physical')}
            disabled={isActing}
            icon={<HardDrive className="size-4" />}
            label="Solo archivos físicos"
            desc="Los registros BD se conservan"
          />
          {withDb > 0 && (
            <BulkOption
              onClick={() => onConfirm('both')}
              disabled={isActing}
              icon={<Trash2 className="size-4 text-destructive" />}
              label="Archivos físicos + registros BD"
              desc="Limpieza total para los conectados"
              danger
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isActing}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BulkOption({
  onClick, disabled, icon, label, desc, danger = false,
}: {
  onClick: () => void; disabled: boolean; icon: React.ReactNode
  label: string; desc: string; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        danger
          ? 'hover:border-destructive hover:bg-destructive/5'
          : 'hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30'
      )}
    >
      <span className={cn('flex items-center gap-2 font-medium', danger && 'text-destructive')}>
        {icon}{label}
      </span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  )
}
