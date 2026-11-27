'use client'

import type { StorageFile } from '@/features/storage-files/data/schema'

export function FileMeta({ file }: { file: StorageFile }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[10px] text-muted-foreground truncate">{file.size_human}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md shrink-0">
        {file.extension}
      </span>
    </div>
  )
}
