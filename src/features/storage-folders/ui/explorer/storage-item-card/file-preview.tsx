'use client'

import { cn } from '@/shared/lib/utils'
import { FileTypeIcon, fileTypeColor } from '@/features/storage-files/ui/grid/file-type-icon'
import { isImage } from '@/features/storage-files/data/schema'
import type { StorageFile } from '@/features/storage-files/data/schema'

// ── File preview ──────────────────────────────────────────────────────────────

export function FilePreview({ file }: { file: StorageFile }) {
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
