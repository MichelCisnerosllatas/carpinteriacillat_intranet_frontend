'use client'

import { useState } from 'react'
import {
  AlertTriangle, CheckCircle2, HardDrive, Info,
  LoaderCircle, Trash2, FolderInput,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { StorageDetailDialog } from './storage-detail-dialog'
import { StorageActionDialog } from './storage-action-dialog'
import { StorageMoveDialog } from './storage-move-dialog'
import type { EnrichedStorageFile } from '../data/schema'

interface StorageCardProps {
  file:           EnrichedStorageFile
  isSelected:     boolean
  onToggleSelect: (path: string) => void
  onPreview?:     () => void
}

export function StorageCard({ file, isSelected, onToggleSelect, onPreview }: StorageCardProps) {
  const [imgLoaded,  setImgLoaded]  = useState(false)
  const [imgError,   setImgError]   = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [moveOpen,   setMoveOpen]   = useState(false)

  const isOrphan     = file.status === 'orphan'
  const isRegistered = file.status === 'registered'
  const canPreview   = file.isImage && !imgError

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200',
          'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
          isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-square overflow-hidden bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] bg-[length:16px_16px]">

          {/* Image / placeholder */}
          {canPreview ? (
            <button
              type="button"
              onClick={() => onPreview?.()}
              className="h-full w-full cursor-zoom-in"
            >
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoaderCircle className="size-5 animate-spin text-muted-foreground/40" />
                </div>
              )}
              <img
                src={file.url}
                alt={file.dbRecord?.image_alt ?? file.filename}
                className={cn(
                  'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                  !imgLoaded && 'opacity-0',
                )}
                onLoad={() => setImgLoaded(true)}
                onError={() => { setImgError(true); setImgLoaded(true) }}
              />
            </button>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
              <HardDrive className="size-8" />
              <span className="text-[10px] font-mono uppercase">{file.ext || '?'}</span>
            </div>
          )}

          {/* Status badge — top-left */}
          <div className="absolute left-2 top-2 z-10">
            {isOrphan && (
              <Badge className="gap-1 bg-amber-500/90 text-[10px] text-white hover:bg-amber-500/90 shadow-sm">
                <AlertTriangle className="size-2.5" />Sin registro
              </Badge>
            )}
            {isRegistered && (
              <Badge className="gap-1 bg-emerald-500/90 text-[10px] text-white hover:bg-emerald-500/90 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
                <CheckCircle2 className="size-2.5" />En BD
              </Badge>
            )}
          </div>

          {/* Checkbox — top-right, z-10 para quedar encima del overlay */}
          <div
            className={cn(
              'absolute right-2 top-2 z-10 transition-opacity',
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
            onClick={(e) => { e.stopPropagation(); onToggleSelect(file.path) }}
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border">
              <Checkbox
                checked={isSelected}
                className="size-3.5 border-0 pointer-events-none"
              />
            </div>
          </div>

          {/* Hover overlay — pointer-events-none en el fondo */}
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-black/60 via-transparent to-transparent pb-3 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="pointer-events-auto size-8 rounded-full shadow-md"
                  onClick={(e) => { e.stopPropagation(); setDetailOpen(true) }}
                >
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver detalles</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="pointer-events-auto size-8 rounded-full shadow-md"
                  onClick={(e) => { e.stopPropagation(); setMoveOpen(true) }}
                >
                  <FolderInput className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mover / Renombrar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  className="pointer-events-auto size-8 rounded-full shadow-md"
                  onClick={(e) => { e.stopPropagation(); setActionOpen(true) }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-0.5 px-3 py-2.5">
          <p className="truncate text-xs font-medium leading-snug">{file.filename}</p>
          <div className="flex items-center gap-1.5">
            {file.ext && (
              <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                {file.ext}
              </span>
            )}
            {file.dbRecord?.image_size != null && (
              <span className="text-[10px] text-muted-foreground">
                {file.dbRecord.image_size < 1024
                  ? `${file.dbRecord.image_size} B`
                  : file.dbRecord.image_size < 1024 * 1024
                    ? `${(file.dbRecord.image_size / 1024).toFixed(1)} KB`
                    : `${(file.dbRecord.image_size / (1024 * 1024)).toFixed(2)} MB`}
              </span>
            )}
          </div>
        </div>
      </div>

      <StorageDetailDialog file={file} open={detailOpen} onClose={() => setDetailOpen(false)} />
      <StorageActionDialog file={file} open={actionOpen} onClose={() => setActionOpen(false)} />
      <StorageMoveDialog   file={file} open={moveOpen}   onClose={() => setMoveOpen(false)} />
    </>
  )
}
