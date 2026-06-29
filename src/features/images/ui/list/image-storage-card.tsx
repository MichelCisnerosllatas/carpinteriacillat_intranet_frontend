'use client'

import { useState } from 'react'
import { LoaderCircle, HardDrive, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { StorageFileItem } from '../../model/imagestorage.dto'

export function ImageStorageCard({ file, onDelete }: { file: StorageFileItem; onDelete: (file: StorageFileItem) => void }) {
  const [imgError, setImgError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const filename = file.path.split('/').pop() ?? file.path
  const ext = filename.split('.').pop()?.toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext ?? '')

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        {isImage && !imgError ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <img
              src={file.url}
              alt={filename}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              onLoad={() => setLoaded(true)}
              onError={() => { setImgError(true); setLoaded(true) }}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <HardDrive className="size-8" />
            {ext && <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono uppercase">{ext}</span>}
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="size-8" asChild>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver archivo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                className="size-8"
                onClick={() => onDelete(file)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar del servidor</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="truncate text-xs font-medium">{filename}</p>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs break-all">{file.path}</p>
          </TooltipContent>
        </Tooltip>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{file.path}</p>
      </div>
    </div>
  )
}
