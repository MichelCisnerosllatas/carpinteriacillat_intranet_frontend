'use client'

import { Calendar } from 'lucide-react'
import type { StorageFolder } from '../../../data/schema'

export function FolderMeta({ folder }: { folder: StorageFolder }) {
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
