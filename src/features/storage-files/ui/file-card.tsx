'use client'

import { Download, Eye, MoreVertical, MoveRight, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { isImage } from '../data/schema'
import { FileTypeIcon, fileTypeColor } from './file-type-icon'
import type { StorageFile } from '../data/schema'

interface FileCardProps {
  file:         StorageFile
  selected:     boolean
  anySelected:  boolean
  onSelect:     () => void
  onPreview:    () => void
  onDownload:   () => void
  onRename:     () => void
  onMove:       () => void
  onDelete:     () => void
}

export function FileCard({
  file, selected, anySelected, onSelect, onPreview, onDownload, onRename, onMove, onDelete,
}: FileCardProps) {
  const isImg = isImage(file.extension)

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 cursor-pointer select-none',
        'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
        selected && 'border-primary shadow-md ring-2 ring-primary/20',
      )}
      onClick={onPreview}
    >
      {/* Selection checkbox — top-left */}
      <div
        className={cn(
          'absolute left-2 top-2 z-10 transition-opacity',
          anySelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        onClick={(e) => { e.stopPropagation(); onSelect() }}
      >
        <Checkbox
          checked={selected}
          className="size-4 rounded border-white/80 bg-white/90 shadow-sm dark:bg-black/70"
        />
      </div>

      {/* Context menu — top-right */}
      <div className="absolute right-1.5 top-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview() }} className="gap-2 cursor-pointer">
              <Eye className="size-3.5" /> Ver / Previsualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload() }} className="gap-2 cursor-pointer">
              <Download className="size-3.5" /> Descargar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename() }} className="gap-2 cursor-pointer">
              <Pencil className="size-3.5" /> Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove() }} className="gap-2 cursor-pointer">
              <MoveRight className="size-3.5" /> Mover a carpeta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Preview area */}
      <div className={cn(
        'relative flex items-center justify-center h-28 w-full overflow-hidden',
        !isImg && fileTypeColor(file.extension),
      )}>
        {isImg ? (
          <>
            <img
              src={file.url}
              alt={file.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </>
        ) : (
          <FileTypeIcon extension={file.extension} className="size-12 opacity-70" />
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-0.5">
        <p className="truncate text-xs font-medium leading-tight text-foreground" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{file.size_human}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {file.extension}
          </span>
        </div>
      </div>
    </div>
  )
}
