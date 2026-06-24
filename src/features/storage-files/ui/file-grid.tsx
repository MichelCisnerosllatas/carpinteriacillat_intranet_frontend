'use client'

import { useEffect, useRef, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  CheckSquare2, File as FileIcon, Loader2, RefreshCw, Search, SquareDashed, Upload, X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFileListStore } from '../stores/useStorageFileListStore'
import { useStorageFileActionStore } from '../stores/useStorageFileActionStore'
import { isImage } from '../data/schema'
import { FileCard } from './file-card'
import { FileUploadModal } from './file-upload-modal'
import { FileRenameModal } from './file-rename-modal'
import { FileMoveModal } from './file-move-modal'
import { FileDeleteDialog } from './file-delete-dialog'
import { FileBulkActions } from './file-bulk-actions'
import { FileBulkMoveModal } from './file-bulk-move-modal'
import type { StorageFile } from '../data/schema'

const EXTENSION_OPTIONS = [
  { label: 'Todas',       value: 'all' },
  { label: 'Imágenes',    value: 'images' },
  { label: 'PNG',         value: 'png' },
  { label: 'JPG',         value: 'jpg' },
  { label: 'WEBP',        value: 'webp' },
  { label: 'PDF',         value: 'pdf' },
  { label: 'ZIP',         value: 'zip' },
  { label: 'Word',        value: 'docx' },
  { label: 'Excel',       value: 'xlsx' },
]

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif']

interface FileGridProps {
  currentPath: string | null
}

export function FileGrid({ currentPath }: FileGridProps) {
  const {
    items, meta, filters, selectedPaths,
    hasLoaded, isFetching, isError, message,
    load, navigate, toggleSelect, selectAll, clearSelection, getSelected, removeItem,
  } = useStorageFileListStore()

  const { download, deleteBulk, isDownloading, isSubmitting } = useStorageFileActionStore()

  const [search,     setSearch]     = useState('')
  const [extension,  setExtension]  = useState('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [renameFile, setRenameFile] = useState<StorageFile | null>(null)
  const [moveFile,   setMoveFile]   = useState<StorageFile | null>(null)
  const [deleteFile, setDeleteFile] = useState<StorageFile | null>(null)
  const [bulkMove,   setBulkMove]   = useState(false)
  const [lbIndex,    setLbIndex]    = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reload when currentPath changes
  useEffect(() => {
    setSearch('')
    setExtension('all')
    navigate(currentPath)
  }, [currentPath])

  // Search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void load({ page: 1, search: search.trim() || undefined })
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const handleExtensionChange = (val: string) => {
    setExtension(val)
    if (val === 'all')    void load({ page: 1, extension: undefined })
    else if (val === 'images') void load({ page: 1, extension: undefined, search: undefined })
    else                  void load({ page: 1, extension: val })
  }

  const reload = () => void load({ page: 1 })

  // Lightbox: only image files
  const imageItems   = items.filter((f) => isImage(f.extension))
  const lbSlides     = imageItems.map((f) => ({ src: f.url, alt: f.name }))
  const getLbIndex   = (file: StorageFile) => imageItems.findIndex((f) => f.path === file.path)

  const handlePreview = (file: StorageFile) => {
    if (isImage(file.extension)) {
      const idx = getLbIndex(file)
      if (idx >= 0) setLbIndex(idx)
    } else {
      void useStorageFileActionStore.getState().openPreview(file.path_encoded, file.mime_type)
    }
  }

  const handleDownload = (file: StorageFile) => {
    void download(file.path_encoded, file.name)
  }

  const handleBulkDelete = async () => {
    const selected = getSelected()
    const confirmed = await swalDeleteConfirm(
      '¿Eliminar archivos?',
      `Se eliminarán ${selected.length} archivo${selected.length !== 1 ? 's' : ''} permanentemente.`,
    )
    if (!confirmed) return

    const pathEncodeds = selected.map((f) => f.path_encoded)
    const { done, errors } = await deleteBulk(pathEncodeds)
    // Remove deleted items from store
    selected.slice(0, done).forEach((f) => removeItem(f.path))
    clearSelection()

    if (errors === 0) toastSuccess('Archivos eliminados', `${done} archivo${done !== 1 ? 's' : ''} eliminado${done !== 1 ? 's' : ''}.`)
    else toastError('Eliminación parcial', `${done} eliminado${done !== 1 ? 's' : ''}, ${errors} con error.`)
  }

  const selectedCount = selectedPaths.size
  const anySelected   = selectedCount > 0
  const allSelected   = selectedCount === items.length && items.length > 0

  // Pagination dummy table
  const dummyTable = {
    getState:          () => ({ pagination: { pageIndex: (meta?.current_page ?? 1) - 1, pageSize: meta?.per_page ?? 20 } }),
    getPageCount:      () => meta?.last_page ?? 1,
    getCanPreviousPage: () => (meta?.current_page ?? 1) > 1,
    getCanNextPage:    () => (meta?.current_page ?? 1) < (meta?.last_page ?? 1),
    previousPage:      () => { void load({ page: (meta?.current_page ?? 1) - 1 }) },
    nextPage:          () => { void load({ page: (meta?.current_page ?? 1) + 1 }) },
    setPageIndex:      (idx: number) => { void load({ page: idx + 1 }) },
    setPageSize:       (size: number) => { void load({ page: 1, per_page: size }) },
  } as any

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Archivos
          </p>
          {meta?.total !== undefined && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {meta.total}
            </span>
          )}
          {/* Select all toggle */}
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs px-2"
              onClick={allSelected ? clearSelection : selectAll}
            >
              {allSelected
                ? <><CheckSquare2 className="size-3" /> Deseleccionar</>
                : <><SquareDashed className="size-3" /> Seleccionar todo</>
              }
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reload} disabled={isFetching} className="gap-1.5 h-8">
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline text-xs">Actualizar</span>
          </Button>
          <Button size="sm" onClick={() => setUploadOpen(true)} className="gap-1.5 h-8">
            <Upload className="size-3.5" />
            <span className="text-xs">Subir archivo</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar archivo..."
            className="pl-8 h-8 text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={extension} onValueChange={handleExtensionChange}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Extensión" />
          </SelectTrigger>
          <SelectContent>
            {EXTENSION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {!hasLoaded && (
        <div className="flex items-center justify-center gap-2 h-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />Cargando archivos...
        </div>
      )}

      {hasLoaded && isError && (
        <div className="flex flex-col items-center justify-center gap-3 h-24 text-sm text-muted-foreground">
          <p>{message ?? 'Error al cargar archivos.'}</p>
          <Button variant="outline" size="sm" onClick={reload}>Reintentar</Button>
        </div>
      )}

      {hasLoaded && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl border-2 border-dashed border-border text-muted-foreground">
          <FileIcon className="size-8 text-muted-foreground/30" />
          <div className="text-center">
            <p className="text-sm font-medium">{search || extension !== 'all' ? 'Sin resultados' : 'Sin archivos'}</p>
            <p className="text-xs mt-0.5">
              {search || extension !== 'all' ? 'Prueba con otros filtros' : 'Sube el primer archivo aquí'}
            </p>
          </div>
          {!search && extension === 'all' && (
            <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)} className="gap-1.5">
              <Upload className="size-3.5" />Subir archivo
            </Button>
          )}
        </div>
      )}

      {hasLoaded && !isError && items.length > 0 && (
        <div className={cn(
          'grid gap-3',
          'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
          isFetching && 'opacity-60 pointer-events-none',
        )}>
          {items.map((file) => (
            <FileCard
              key={file.path}
              file={file}
              selected={selectedPaths.has(file.path)}
              anySelected={anySelected}
              onSelect={() => toggleSelect(file.path)}
              onPreview={() => handlePreview(file)}
              onDownload={() => handleDownload(file)}
              onRename={() => setRenameFile(file)}
              onMove={() => setMoveFile(file)}
              onDelete={() => setDeleteFile(file)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {hasLoaded && !isError && (meta?.last_page ?? 1) > 1 && (
        <DataTablePagination table={dummyTable} />
      )}

      {/* Modals */}
      <FileUploadModal
        open={uploadOpen}
        currentPath={currentPath}
        onClose={() => setUploadOpen(false)}
        onUploaded={reload}
      />
      <FileRenameModal
        open={renameFile !== null}
        file={renameFile}
        onClose={() => setRenameFile(null)}
      />
      <FileMoveModal
        open={moveFile !== null}
        file={moveFile}
        onClose={() => setMoveFile(null)}
        onMoved={reload}
      />
      <FileDeleteDialog
        open={deleteFile !== null}
        file={deleteFile}
        onClose={() => setDeleteFile(null)}
        onDeleted={() => { if (deleteFile) removeItem(deleteFile.path) }}
      />
      <FileBulkMoveModal
        open={bulkMove}
        onClose={() => setBulkMove(false)}
        onDone={reload}
      />

      {/* Bulk actions bar */}
      <FileBulkActions
        count={selectedCount}
        isActing={isSubmitting}
        onMove={() => setBulkMove(true)}
        onDelete={() => void handleBulkDelete()}
        onClear={clearSelection}
      />

      {/* Lightbox for images */}
      <Lightbox
        open={lbIndex >= 0}
        close={() => setLbIndex(-1)}
        index={lbIndex}
        slides={lbSlides}
        plugins={[Zoom, Thumbnails]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        thumbnails={{ position: 'bottom', width: 72, height: 48, gap: 8, border: 0, borderRadius: 6 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.92)' } }}
      />
    </div>
  )
}
