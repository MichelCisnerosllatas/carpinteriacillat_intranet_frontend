'use client'

import { Calendar, Download, Eye, FolderOpen, MoreVertical, MoveRight, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { FileTypeIcon, fileTypeColor } from '@/features/storage-files/ui/file-type-icon'
import { isImage } from '@/features/storage-files/data/schema'
import type { StorageFolder } from '../data/schema'
import type { StorageFile } from '@/features/storage-files/data/schema'

// ── Types ────────────────────────────────────────────────────────────────────

export type FolderEntry = {
  kind:       'folder'
  item:       StorageFolder
  onNavigate: () => void
  onRename:   () => void
  onDelete:   () => void
}

export type FileEntry = {
  kind:       'file'
  item:       StorageFile
  onPreview:  () => void
  onDownload: () => void
  onRename:   () => void
  onMove:     () => void
  onDelete:   () => void
}

interface StorageItemCardProps {
  entry:        FolderEntry | FileEntry
  selected:     boolean
  anySelected:  boolean
  onSelect:     () => void
  // Drag & drop (both folders and files can be dragged; only folders receive drops)
  isDragOver?:  boolean
  isDragging?:  boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?:   (e: React.DragEvent) => void
  onDragOver?:  (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?:      (e: React.DragEvent) => void
  canDrag?:     boolean  // override default (files=true, folders=true now)
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

export function StorageItemSkeleton() {
  return (
    <div className="rounded-2xl border bg-card animate-pulse">
      <div className="h-28 rounded-t-2xl bg-muted/70" />
      <div className="px-3 pb-3 pt-2 flex flex-col gap-2">
        <div className="h-3 bg-muted rounded-full w-3/4" />
        <div className="h-2 bg-muted rounded-full w-1/2" />
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export function StorageItemCard({
  entry, selected, anySelected, onSelect,
  isDragOver, isDragging, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  canDrag: canDragProp,
}: StorageItemCardProps) {
  const isFolder  = entry.kind === 'folder'
  const canDrag   = canDragProp ?? true // both files and folders are draggable

  const handleCardClick = () => {
    if (anySelected) { onSelect(); return }
    if (isFolder) (entry as FolderEntry).onNavigate()
    else (entry as FileEntry).onPreview()
  }

  return (
    <div
      draggable={canDrag}
      onDragStart={canDrag ? onDragStart : undefined}
      onDragEnd={canDrag ? onDragEnd : undefined}
      onDragOver={isFolder ? onDragOver : undefined}
      onDragLeave={isFolder ? onDragLeave : undefined}
      onDrop={isFolder ? onDrop : undefined}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card transition-all duration-150',
        'hover:shadow-md hover:border-border/80 cursor-pointer select-none',
        selected  && 'ring-2 ring-primary border-primary/50 shadow-sm',
        isDragOver && 'ring-2 ring-emerald-500 border-emerald-500/60 shadow-lg scale-[1.02] bg-emerald-50/30 dark:bg-emerald-950/20',
        isDragging && 'opacity-40 scale-95',
        canDrag   && 'active:cursor-grabbing',
      )}
      onClick={handleCardClick}
      onDoubleClick={() => {
        if (isFolder) (entry as FolderEntry).onNavigate()
      }}
    >
      {/* Drag-over overlay label */}
      {isDragOver && isFolder && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl pointer-events-none">
          <div className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            Mover aquí
          </div>
        </div>
      )}

      {/* ── Checkbox (top-left) ─────────────────────────────────────── */}
      <div
        className={cn(
          'absolute top-2 left-2 z-10 transition-opacity duration-100',
          anySelected || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          isDragOver && 'opacity-0',
        )}
        onClick={(e) => { e.stopPropagation(); onSelect() }}
      >
        <Checkbox
          checked={selected}
          className="size-4 rounded-[4px] border-2 bg-background/80 backdrop-blur-sm"
        />
      </div>

      {/* ── Context menu (top-right) ─────────────────────────────────── */}
      <div
        className={cn(
          'absolute top-2 right-2 z-10 transition-opacity duration-100',
          'opacity-0 group-hover:opacity-100',
          isDragOver && 'opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-lg bg-background/70 backdrop-blur-sm hover:bg-background"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {isFolder ? (
              <>
                <DropdownMenuItem onClick={() => (entry as FolderEntry).onNavigate()}>
                  <FolderOpen className="size-3.5 mr-2" />Abrir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => (entry as FolderEntry).onRename()}>
                  <Pencil className="size-3.5 mr-2" />Renombrar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => (entry as FolderEntry).onDelete()}
                >
                  <Trash2 className="size-3.5 mr-2" />Eliminar
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => (entry as FileEntry).onPreview()}>
                  <Eye className="size-3.5 mr-2" />Vista previa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => (entry as FileEntry).onDownload()}>
                  <Download className="size-3.5 mr-2" />Descargar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => (entry as FileEntry).onRename()}>
                  <Pencil className="size-3.5 mr-2" />Renombrar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => (entry as FileEntry).onMove()}>
                  <MoveRight className="size-3.5 mr-2" />Mover
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => (entry as FileEntry).onDelete()}
                >
                  <Trash2 className="size-3.5 mr-2" />Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Preview area ─────────────────────────────────────────────── */}
      {isFolder ? (
        <FolderPreview folder={(entry as FolderEntry).item} isDragOver={!!isDragOver} />
      ) : (
        <FilePreview file={(entry as FileEntry).item} />
      )}

      {/* ── Info area ────────────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 flex flex-col gap-1">
        <p className="text-xs font-medium leading-tight truncate" title={entry.item.name}>
          {entry.item.name}
        </p>
        {isFolder ? (
          <FolderMeta folder={(entry as FolderEntry).item} />
        ) : (
          <FileMeta file={(entry as FileEntry).item} />
        )}
      </div>
    </div>
  )
}

// ── Folder preview ────────────────────────────────────────────────────────────

function FolderPreview({ folder, isDragOver }: { folder: StorageFolder; isDragOver: boolean }) {
  return (
    <div className={cn(
      'flex items-center justify-center h-28 rounded-t-2xl transition-colors',
      isDragOver
        ? 'bg-emerald-100 dark:bg-emerald-900/40'
        : 'bg-amber-50 dark:bg-amber-950/30',
    )}>
      <div className="relative">
        <svg viewBox="0 0 64 52" className="w-16 h-16 drop-shadow-sm" fill="none">
          <path
            d="M2 10C2 6.686 4.686 4 8 4H24L30 12H56C59.314 12 62 14.686 62 18V46C62 49.314 59.314 52 56 52H8C4.686 52 2 49.314 2 46V10Z"
            fill={isDragOver ? '#6ee7b7' : '#FCD34D'}
          />
          <path
            d="M2 18C2 14.686 4.686 12 8 12H56C59.314 12 62 14.686 62 18V46C62 49.314 59.314 52 56 52H8C4.686 52 2 49.314 2 46V18Z"
            fill={isDragOver ? '#a7f3d0' : '#FDE68A'}
          />
        </svg>
        {folder.subdirectories_count > 0 && (
          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
            {folder.subdirectories_count > 9 ? '9+' : folder.subdirectories_count}
          </span>
        )}
      </div>
    </div>
  )
}

function FolderMeta({ folder }: { folder: StorageFolder }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[10px] text-muted-foreground truncate">
        {folder.files_count > 0
          ? `${folder.files_count} archivo${folder.files_count !== 1 ? 's' : ''}`
          : 'Vacía'}
      </span>
      {folder.last_modified && (
        <span className="text-[10px] text-muted-foreground/70 shrink-0 flex items-center gap-0.5">
          <Calendar className="size-2.5" />
          {new Date(folder.last_modified).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
        </span>
      )}
    </div>
  )
}

// ── File preview ──────────────────────────────────────────────────────────────

function FilePreview({ file }: { file: StorageFile }) {
  if (isImage(file.extension)) {
    return (
      <div className="h-28 rounded-t-2xl overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center h-28 rounded-t-2xl', fileTypeColor(file.extension))}>
      <FileTypeIcon extension={file.extension} className="size-10 opacity-90" />
    </div>
  )
}

function FileMeta({ file }: { file: StorageFile }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[10px] text-muted-foreground truncate">{file.size_human}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md shrink-0">
        {file.extension}
      </span>
    </div>
  )
}
