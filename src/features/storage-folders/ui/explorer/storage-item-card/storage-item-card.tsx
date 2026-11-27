'use client'

import { Download, Eye, FolderOpen, MoreVertical, MoveRight, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useLongPress } from '@/shared/lib/use-long-press'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useCan } from '@/features/auth/hooks/usePermission'
import type { StorageFolder } from '../../../data/schema'
import type { StorageFile } from '@/features/storage-files/data/schema'
import { FolderPreview } from './folder-preview'
import { FilePreview } from './file-preview'
import { FolderMeta } from './folder-meta'
import { FileMeta } from './file-meta'

// ── Types ────────────────────────────────────────────────────────────────────

export type FolderEntry = {
  kind:       'folder'
  item:       StorageFolder
  onNavigate: () => void
  onRename:   () => void
  onMove:     () => void
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

// ── Component ────────────────────────────────────────────────────────────────

export function StorageItemCard({
  entry, selected, anySelected, onSelect,
  isDragOver, isDragging, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  canDrag: canDragProp,
}: StorageItemCardProps) {
  const isFolder  = entry.kind === 'folder'
  // Permisos del explorador (ver ROLES_Y_PERMISOS.md): mover/renombrar = update, eliminar = delete
  const canUpdate = useCan('storage_folders.update')
  const canDelete = useCan('storage_folders.delete')
  // Arrastrar mueve el elemento, así que solo se permite con permiso de editar
  const canDrag   = canDragProp ?? canUpdate // both files and folders are draggable

  // En touch no hay :hover para revelar el checkbox: mantener presionado la tarjeta
  // activa selección (igual que en la galería de imágenes). El tap normal conserva su
  // comportamiento de siempre: si ya hay algo seleccionado, alterna selección; si no,
  // navega/abre — así el tap no deja de servir para "ver" mientras se selecciona.
  const tapHandlers = useLongPress({
    onLongPress: onSelect,
    onTap: () => {
      if (anySelected) { onSelect(); return }
      if (isFolder) (entry as FolderEntry).onNavigate()
      else (entry as FileEntry).onPreview()
    },
  })

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
        'hover:shadow-md hover:border-border/80 cursor-pointer select-none touch-manipulation',
        selected  && 'ring-2 ring-primary border-primary/50 shadow-sm',
        isDragOver && 'ring-2 ring-emerald-500 border-emerald-500/60 shadow-lg scale-[1.02] bg-emerald-50/30 dark:bg-emerald-950/20',
        isDragging && 'opacity-40 scale-95',
        canDrag   && 'active:cursor-grabbing',
      )}
      {...tapHandlers}
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

      {/* ── Checkbox (top-left) — en touch siempre visible (pointer-coarse) y con más
          área de toque; con mouse, visible en hover o cuando ya está seleccionada ── */}
      <div
        className={cn(
          'absolute top-1 left-1 z-10 rounded-full p-1 transition-opacity duration-100',
          'pointer-coarse:p-2 pointer-coarse:bg-black/10 pointer-coarse:opacity-100',
          anySelected || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          isDragOver && 'opacity-0',
        )}
        onClick={(e) => { e.stopPropagation(); onSelect() }}
      >
        <Checkbox
          checked={selected}
          className="size-4 rounded-[4px] border-2 bg-background/80 backdrop-blur-sm pointer-coarse:size-5"
        />
      </div>

      {/* ── Context menu (top-right) — en touch siempre visible (pointer-coarse), con
          un botón de 36px de área de toque (antes 24px, inalcanzable con el dedo) ── */}
      <div
        className={cn(
          'absolute top-2 right-2 z-10 transition-opacity duration-100',
          'opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100',
          isDragOver && 'opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 rounded-lg bg-background/70 backdrop-blur-sm hover:bg-background pointer-coarse:size-9"
                  >
                    <MoreVertical className="size-3.5 pointer-coarse:size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent>Más acciones</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-36 [&_[data-slot=dropdown-menu-item]]:pointer-coarse:py-2.5">
            {isFolder ? (
              <>
                <DropdownMenuItem onClick={() => (entry as FolderEntry).onNavigate()}>
                  <FolderOpen className="size-3.5 mr-2" />Abrir
                </DropdownMenuItem>
                {canUpdate && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => (entry as FolderEntry).onRename()}>
                      <Pencil className="size-3.5 mr-2" />Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => (entry as FolderEntry).onMove()}>
                      <MoveRight className="size-3.5 mr-2" />Mover
                    </DropdownMenuItem>
                  </>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => (entry as FolderEntry).onDelete()}
                    >
                      <Trash2 className="size-3.5 mr-2" />Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => (entry as FileEntry).onPreview()}>
                  <Eye className="size-3.5 mr-2" />Vista previa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => (entry as FileEntry).onDownload()}>
                  <Download className="size-3.5 mr-2" />Descargar
                </DropdownMenuItem>
                {canUpdate && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => (entry as FileEntry).onRename()}>
                      <Pencil className="size-3.5 mr-2" />Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => (entry as FileEntry).onMove()}>
                      <MoveRight className="size-3.5 mr-2" />Mover
                    </DropdownMenuItem>
                  </>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => (entry as FileEntry).onDelete()}
                    >
                      <Trash2 className="size-3.5 mr-2" />Eliminar
                    </DropdownMenuItem>
                  </>
                )}
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
