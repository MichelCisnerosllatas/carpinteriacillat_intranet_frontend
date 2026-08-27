'use client'

import { useEffect, useRef, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  CheckSquare2, Folder, FolderPlus, Loader2, MoveRight,
  RefreshCw, Search, SquareDashed, Trash2, Upload, X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFolderListStore } from '../../stores/useStorageFolderListStore'
import { useStorageFolderActionStore } from '../../stores/useStorageFolderActionStore'
import { useStorageFileListStore } from '@/features/storage-files/stores/useStorageFileListStore'
import { useStorageFileActionStore } from '@/features/storage-files/stores/useStorageFileActionStore'
import { isImage } from '@/features/storage-files/data/schema'
import { FolderBreadcrumb } from './folder-breadcrumb'
import { StorageItemCard, StorageItemSkeleton } from './storage-item-card'
import { FileUploadModal } from '@/features/storage-files/ui/modals/file-upload-modal'
import { FileRenameModal } from '@/features/storage-files/ui/modals/file-rename-modal'
import { FileMoveModal } from '@/features/storage-files/ui/modals/file-move-modal'
import { FileDeleteDialog } from '@/features/storage-files/ui/modals/file-delete-dialog'
import { FolderMoveModal } from '../modals/folder-move-modal'
import { StorageBulkMoveModal } from './storage-bulk-move-modal'
import type { StorageFolder } from '../../data/schema'
import type { StorageFile } from '@/features/storage-files/data/schema'

// ── Constants ────────────────────────────────────────────────────────────────

const EXTENSION_OPTIONS = [
  { label: 'Todos los tipos', value: 'all' },
  { label: 'PNG',   value: 'png'  },
  { label: 'JPG',   value: 'jpg'  },
  { label: 'WEBP',  value: 'webp' },
  { label: 'PDF',   value: 'pdf'  },
  { label: 'ZIP',   value: 'zip'  },
  { label: 'DOCX',  value: 'docx' },
  { label: 'XLSX',  value: 'xlsx' },
]

// drag payload stored in dataTransfer — both files and folders
type DragPayload = { kind: 'file' | 'folder'; paths: string[]; encodeds: string[] }

type SelectedKind = 'folder' | 'file'

interface StorageExplorerProps {
  onNavigate:  (path: string | null) => void
  onNewFolder: () => void
  onRename:    (folder: StorageFolder) => void
  onDelete:    (folder: StorageFolder) => void
  onMutation?: () => void  // called after any data mutation so parent can refresh tree
}

// ── Component ────────────────────────────────────────────────────────────────

export function StorageExplorer({ onNavigate, onNewFolder, onRename, onDelete, onMutation }: StorageExplorerProps) {
  // ── Stores ────────────────────────────────────────────────────────────────
  const {
    items: folders, filters: folderFilters, breadcrumb,
    hasLoaded: foldersLoaded, isFetching: foldersFetching, load: loadFolders,
  } = useStorageFolderListStore()

  const folderActionStore = useStorageFolderActionStore()

  const {
    items: files, meta: fileMeta, hasLoaded: filesLoaded,
    isFetching: filesFetching, load: loadFiles, navigate: navigateFiles,
  } = useStorageFileListStore()

  const fileActionStore = useStorageFileActionStore()

  // ── Selection: Map<path, kind> ────────────────────────────────────────────
  const [selected, setSelected] = useState<Map<string, SelectedKind>>(new Map())

  // ── Drag state ────────────────────────────────────────────────────────────
  const [draggingPaths, setDraggingPaths] = useState<Set<string>>(new Set())
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState('')
  const [extension,   setExtension]   = useState('all')
  const [uploadOpen,  setUploadOpen]  = useState(false)
  const [renameFile,  setRenameFile]  = useState<StorageFile | null>(null)
  const [moveFile,    setMoveFile]    = useState<StorageFile | null>(null)
  const [moveFolder,  setMoveFolder]  = useState<StorageFolder | null>(null)
  const [deleteFile,  setDeleteFile]  = useState<StorageFile | null>(null)
  const [bulkMove,    setBulkMove]    = useState(false)
  const [lbIndex,     setLbIndex]     = useState(-1)
  const [isActing,    setIsActing]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPath  = folderFilters.path ?? null
  const bothLoaded   = foldersLoaded && filesLoaded
  const isFetching   = foldersFetching || filesFetching

  // ── Loads ─────────────────────────────────────────────────────────────────

  useEffect(() => { void loadFolders({ per_page: 100 }) }, [])

  useEffect(() => {
    navigateFiles(currentPath)
    setSelected(new Map())
    setSearch('')
    setExtension('all')
  }, [currentPath])

  // Debounced file search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void loadFiles({ page: 1, search: search.trim() || undefined })
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const handleExtensionChange = (val: string) => {
    setExtension(val)
    void loadFiles({ page: 1, extension: val === 'all' ? undefined : val })
  }

  // Refreshes everything: folder list, files, and notifies parent to reload tree
  const mutateRefresh = async () => {
    await Promise.all([
      loadFolders({ page: 1, per_page: 100 }),
      loadFiles({ page: 1 }),
    ])
    onMutation?.()
  }

  const refreshAll = async () => {
    await mutateRefresh()
    setSelected(new Map())
  }

  // ── Filtered folders (client-side search) ────────────────────────────────

  const filteredFolders = search.trim()
    ? folders.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase()))
    : folders

  // ── Selection helpers ─────────────────────────────────────────────────────

  const toggleSelect = (path: string, kind: SelectedKind) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(path)) next.delete(path)
      else next.set(path, kind)
      return next
    })
  }

  const selectAll = () => {
    const next = new Map<string, SelectedKind>()
    filteredFolders.forEach((f) => next.set(f.path, 'folder'))
    files.forEach((f) => next.set(f.path, 'file'))
    setSelected(next)
  }

  const clearSelection = () => setSelected(new Map())

  const selectedCount   = selected.size
  const anySelected     = selectedCount > 0
  const totalItems      = filteredFolders.length + files.length
  const allSelected     = selectedCount === totalItems && totalItems > 0
  const selectedFolders = filteredFolders.filter((f) => selected.get(f.path) === 'folder')
  const selectedFiles   = files.filter((f) => selected.get(f.path) === 'file')

  // ── Bulk delete (folders + files mixed) ──────────────────────────────────

  const handleBulkDelete = async () => {
    const fCount  = selectedFolders.length
    const fxCount = selectedFiles.length
    const total   = fCount + fxCount
    let description = `Se eliminarán ${total} elemento${total !== 1 ? 's' : ''} permanentemente.`
    if (fCount > 0 && fxCount > 0)
      description = `${fCount} carpeta${fCount !== 1 ? 's' : ''} (con todo su contenido) y ${fxCount} archivo${fxCount !== 1 ? 's' : ''} serán eliminados permanentemente.`
    else if (fCount > 0)
      description = `${fCount} carpeta${fCount !== 1 ? 's' : ''} serán eliminadas con todo su contenido permanentemente.`

    const confirmed = await swalDeleteConfirm('¿Eliminar seleccionados?', description)
    if (!confirmed) return

    setIsActing(true)
    let done = 0, errors = 0

    for (const folder of selectedFolders) {
      const ok = await folderActionStore.deleteFolder({ path_encoded: folder.path_encoded, force: true })
      if (ok) done++; else errors++
    }

    if (selectedFiles.length > 0) {
      const { done: fd, errors: fe } = await fileActionStore.deleteBulk(selectedFiles.map((f) => f.path_encoded))
      done += fd; errors += fe
    }

    setIsActing(false)

    clearSelection()
    await mutateRefresh()

    if (errors === 0) toastSuccess('Eliminados', `${done} elemento${done !== 1 ? 's' : ''} eliminado${done !== 1 ? 's' : ''}.`)
    else toastError('Eliminación parcial', `${done} ok, ${errors} con error.`)
  }

  // ── File preview ──────────────────────────────────────────────────────────

  const handleFilePreview = (file: StorageFile) => {
    if (isImage(file.extension)) {
      const imgs = files.filter((f) => isImage(f.extension))
      const idx  = imgs.findIndex((f) => f.path === file.path)
      if (idx >= 0) setLbIndex(idx)
    } else {
      window.open(file.url, '_blank', 'noopener,noreferrer')
    }
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────

  const buildFileDragPayload = (file: StorageFile): DragPayload => {
    if (selected.get(file.path) === 'file' && selectedFiles.length > 1) {
      return { kind: 'file', paths: selectedFiles.map((f) => f.path), encodeds: selectedFiles.map((f) => f.path_encoded) }
    }
    return { kind: 'file', paths: [file.path], encodeds: [file.path_encoded] }
  }

  const buildFolderDragPayload = (folder: StorageFolder): DragPayload => {
    if (selected.get(folder.path) === 'folder' && selectedFolders.length > 1) {
      return { kind: 'folder', paths: selectedFolders.map((f) => f.path), encodeds: selectedFolders.map((f) => f.path_encoded) }
    }
    return { kind: 'folder', paths: [folder.path], encodeds: [folder.path_encoded] }
  }

  const startDrag = (e: React.DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'move'
    setDraggingPaths(new Set(payload.paths))
  }

  const handleDragEnd = () => setDraggingPaths(new Set())

  const handleFolderDragOver = (e: React.DragEvent, folder: StorageFolder) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverFolder !== folder.path) setDragOverFolder(folder.path)
  }

  const handleFolderDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverFolder(null)
    }
  }

  const handleFolderDrop = async (e: React.DragEvent, targetFolder: StorageFolder) => {
    e.preventDefault()
    setDragOverFolder(null)
    setDraggingPaths(new Set())

    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    const payload: DragPayload = JSON.parse(raw)
    if (payload.encodeds.length === 0) return

    // Prevent dropping a folder onto itself
    if (payload.kind === 'folder' && payload.paths.includes(targetFolder.path)) return

    let done = 0, errors = 0

    if (payload.kind === 'file') {
      const result = await fileActionStore.moveBulk(
        payload.encodeds.map((enc) => ({ pathEncoded: enc, newFolder: targetFolder.path }))
      )
      done = result.done; errors = result.errors
    } else {
      const result = await folderActionStore.moveFoldersBulk(
        payload.encodeds.map((enc) => ({ path_encoded: enc, new_folder: targetFolder.path }))
      )
      done = result.done; errors = result.errors
      if (errors > 0 && result.lastError) {
        if (selected.size > 0) clearSelection()
        await mutateRefresh()
        toastError('Error al mover carpeta', result.lastError)
        return
      }
    }

    const label = payload.kind === 'file' ? 'archivo' : 'carpeta'
    if (selected.size > 0) clearSelection()
    await mutateRefresh()

    if (errors === 0)
      toastSuccess(`${payload.kind === 'file' ? 'Archivos' : 'Carpetas'} movidos`, `${done} ${label}${done !== 1 ? 's' : ''} movido${done !== 1 ? 's' : ''} a "${targetFolder.name}".`)
    else
      toastError('Movimiento parcial', `${done} de ${payload.encodeds.length} ok, ${errors} con error.`)
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────

  const imageFiles = files.filter((f) => isImage(f.extension))
  const lbSlides   = imageFiles.map((f) => ({ src: f.url, alt: f.name }))

  // ── Pagination dummy ──────────────────────────────────────────────────────

  const dummyTable = {
    getState:           () => ({ pagination: { pageIndex: (fileMeta?.current_page ?? 1) - 1, pageSize: fileMeta?.per_page ?? 20 } }),
    getPageCount:       () => fileMeta?.last_page ?? 1,
    getCanPreviousPage: () => (fileMeta?.current_page ?? 1) > 1,
    getCanNextPage:     () => (fileMeta?.current_page ?? 1) < (fileMeta?.last_page ?? 1),
    previousPage:       () => { void loadFiles({ page: (fileMeta?.current_page ?? 1) - 1 }) },
    nextPage:           () => { void loadFiles({ page: (fileMeta?.current_page ?? 1) + 1 }) },
    setPageIndex:       (idx: number) => { void loadFiles({ page: idx + 1 }) },
    setPageSize:        (size: number) => { void loadFiles({ page: 1, per_page: size }) },
  } as any

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <FolderBreadcrumb
            breadcrumb={breadcrumb}
            currentPath={currentPath}
            onNavigate={(path) => onNavigate(path)}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshAll} disabled={isFetching} className="gap-1.5 h-8">
              <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
              <span className="hidden sm:inline text-xs">Actualizar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onNewFolder} className="gap-1.5 h-8">
              <FolderPlus className="size-3.5" />
              <span className="hidden sm:inline text-xs">Nueva carpeta</span>
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(true)} className="gap-1.5 h-8">
              <Upload className="size-3.5" />
              <span className="text-xs">Subir archivo</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar carpetas y archivos..."
              className="pl-8 h-8 text-xs"
            />
            {search && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Limpiar búsqueda</TooltipContent>
              </Tooltip>
            )}
          </div>

          <Select value={extension} onValueChange={handleExtensionChange}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Tipo de archivo" />
            </SelectTrigger>
            <SelectContent>
              {EXTENSION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {totalItems > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs px-2"
              onClick={allSelected ? clearSelection : selectAll}
            >
              {allSelected
                ? <><CheckSquare2 className="size-3.5" />Deseleccionar todo</>
                : <><SquareDashed className="size-3.5" />Seleccionar todo</>
              }
            </Button>
          )}
        </div>
      </div>

      {/* ── Grid: skeleton → real content ────────────────────────────── */}
      <div className={cn(
        'grid gap-3 transition-opacity duration-200',
        'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        // Dim (not hide) when re-fetching after first load
        isFetching && bothLoaded && 'opacity-50 pointer-events-none',
      )}>

        {/* Skeleton on first load */}
        {!bothLoaded && Array.from({ length: 12 }).map((_, i) => (
          <StorageItemSkeleton key={i} />
        ))}

        {/* Folders */}
        {bothLoaded && filteredFolders.map((folder) => (
          <StorageItemCard
            key={folder.path}
            entry={{
              kind:       'folder',
              item:       folder,
              onNavigate: () => onNavigate(folder.path),
              onRename:   () => onRename(folder),
              onMove:     () => setMoveFolder(folder),
              onDelete:   () => onDelete(folder),
            }}
            selected={selected.has(folder.path)}
            anySelected={anySelected}
            onSelect={() => toggleSelect(folder.path, 'folder')}
            isDragOver={dragOverFolder === folder.path}
            isDragging={draggingPaths.has(folder.path)}
            onDragStart={(e) => startDrag(e, buildFolderDragPayload(folder))}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleFolderDragOver(e, folder)}
            onDragLeave={handleFolderDragLeave}
            onDrop={(e) => void handleFolderDrop(e, folder)}
          />
        ))}

        {/* Files */}
        {bothLoaded && files.map((file) => (
          <StorageItemCard
            key={file.path}
            entry={{
              kind:       'file',
              item:       file,
              onPreview:  () => handleFilePreview(file),
              onDownload: () => void fileActionStore.download(file.path_encoded, file.name),
              onRename:   () => setRenameFile(file),
              onMove:     () => setMoveFile(file),
              onDelete:   () => setDeleteFile(file),
            }}
            selected={selected.has(file.path)}
            anySelected={anySelected}
            onSelect={() => toggleSelect(file.path, 'file')}
            isDragging={draggingPaths.has(file.path)}
            onDragStart={(e) => startDrag(e, buildFileDragPayload(file))}
            onDragEnd={handleDragEnd}
          />
        ))}

        {/* Empty state inside the grid */}
        {bothLoaded && !isFetching && filteredFolders.length === 0 && files.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 h-52 rounded-2xl border-2 border-dashed border-border text-muted-foreground">
            {search
              ? <Search className="size-10 text-muted-foreground/25" />
              : <Folder className="size-10 text-muted-foreground/25" />
            }
            <div className="text-center">
              <p className="text-sm font-medium">
                {search ? 'Sin resultados' : 'Carpeta vacía'}
              </p>
              <p className="text-xs mt-0.5">
                {search
                  ? `Nada coincide con "${search}"`
                  : 'Crea una carpeta o sube el primer archivo'}
              </p>
            </div>
            {!search && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={onNewFolder} className="gap-1.5">
                  <FolderPlus className="size-3.5" />Nueva carpeta
                </Button>
                <Button size="sm" onClick={() => setUploadOpen(true)} className="gap-1.5">
                  <Upload className="size-3.5" />Subir archivo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {bothLoaded && (fileMeta?.last_page ?? 1) > 1 && (
        <DataTablePagination table={dummyTable} />
      )}

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <FileUploadModal
        open={uploadOpen}
        currentPath={currentPath}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => mutateRefresh()}
      />
      <FileRenameModal
        open={renameFile !== null}
        file={renameFile}
        onClose={() => { setRenameFile(null); mutateRefresh() }}
      />
      <FileMoveModal
        open={moveFile !== null}
        file={moveFile}
        onClose={() => { setMoveFile(null); clearSelection() }}
        onMoved={() => mutateRefresh()}
      />
      <FolderMoveModal
        open={moveFolder !== null}
        folder={moveFolder}
        onClose={() => { setMoveFolder(null); clearSelection() }}
        onMoved={() => mutateRefresh()}
      />
      <FileDeleteDialog
        open={deleteFile !== null}
        file={deleteFile}
        onClose={() => { setDeleteFile(null); clearSelection() }}
        onDeleted={() => mutateRefresh()}
      />
      <StorageBulkMoveModal
        open={bulkMove}
        folders={selectedFolders}
        files={selectedFiles}
        onClose={() => { setBulkMove(false); clearSelection() }}
        onDone={() => { clearSelection(); mutateRefresh() }}
      />

      {/* ── Floating bulk actions ─────────────────────────────────────── */}
      {anySelected && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200 sm:bottom-6">
          {/* Fondo invertido (bg-foreground/text-background): bg-background/95 queda
              casi idéntico al fondo de la página en modo oscuro y la barra se vuelve
              invisible. max-w + overflow-x-auto + textos ocultos en mobile: con
              "Mover"/"Eliminar" completos + tamaños pointer-coarse, el contenido
              superaba el ancho de pantalla y los botones quedaban cortados. */}
          <div className="flex max-w-[calc(100vw-2rem)] items-center gap-2 overflow-x-auto no-scrollbar rounded-2xl border border-foreground/10 bg-foreground px-3 py-2 text-background shadow-lg shadow-black/30 dark:shadow-black/60 sm:gap-3 sm:px-4 sm:py-2.5">
            <div className="mr-1 flex shrink-0 flex-col whitespace-nowrap leading-tight">
              <span className="text-sm font-semibold">
                {selectedCount}<span className="hidden sm:inline"> seleccionado{selectedCount !== 1 ? 's' : ''}</span>
              </span>
              {selectedFolders.length > 0 && selectedFiles.length > 0 && (
                <span className="hidden text-[10px] text-background/60 sm:block">
                  {selectedFolders.length} carpeta{selectedFolders.length !== 1 ? 's' : ''} · {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <Button size="sm" variant="outline" className="shrink-0 gap-1.5 h-8 px-2 text-foreground pointer-coarse:h-10 pointer-coarse:px-4" disabled={isActing} onClick={() => setBulkMove(true)}>
              <MoveRight className="size-3.5" />
              <span className="hidden sm:inline">Mover</span>
            </Button>

            <Button size="sm" variant="destructive" className="shrink-0 gap-1.5 h-8 px-2 pointer-coarse:h-10 pointer-coarse:px-4" disabled={isActing} onClick={() => void handleBulkDelete()}>
              {isActing ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              <span className="hidden sm:inline">Eliminar</span>
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="size-8 shrink-0 pointer-coarse:size-10" disabled={isActing} onClick={clearSelection}>
                  <X className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deseleccionar todo</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* ── Drag hint (shown while dragging) ─────────────────────────── */}
      {draggingPaths.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 rounded-xl border bg-background/95 backdrop-blur-md shadow-md px-3 py-2 text-xs text-muted-foreground">
            <MoveRight className="size-3.5 text-primary" />
            Suelta sobre una carpeta para mover
            {draggingPaths.size > 1 ? ` (${draggingPaths.size} elementos)` : ''}
          </div>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
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
