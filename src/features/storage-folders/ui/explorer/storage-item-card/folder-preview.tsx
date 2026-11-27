'use client'

import { cn } from '@/shared/lib/utils'
import type { StorageFolder } from '../../../data/schema'

// ── Folder preview ────────────────────────────────────────────────────────────

export function FolderPreview({ folder, isDragOver }: { folder: StorageFolder; isDragOver: boolean }) {
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
