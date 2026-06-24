'use client'

import { ChevronRight, HardDrive } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { StorageFolderBreadcrumbItem } from '../model/storagefolder.get.dto'

interface FolderBreadcrumbProps {
  breadcrumb:  StorageFolderBreadcrumbItem[]
  onNavigate:  (path: string | null) => void
  currentPath: string | null
}

export function FolderBreadcrumb({ breadcrumb, onNavigate, currentPath }: FolderBreadcrumbProps) {
  const isRoot = currentPath === null

  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      {/* Root */}
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors text-xs font-medium',
          isRoot
            ? 'text-foreground bg-muted'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        )}
      >
        <HardDrive className="size-3.5" />
        Storage
      </button>

      {breadcrumb.map((crumb, i) => {
        const isLast = i === breadcrumb.length - 1
        return (
          <div key={crumb.path} className="flex items-center gap-1">
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            <button
              type="button"
              onClick={() => !isLast && onNavigate(crumb.path)}
              className={cn(
                'rounded-md px-2 py-1 transition-colors text-xs font-medium',
                isLast
                  ? 'text-foreground bg-muted cursor-default'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer',
              )}
            >
              {crumb.name}
            </button>
          </div>
        )
      })}
    </nav>
  )
}
