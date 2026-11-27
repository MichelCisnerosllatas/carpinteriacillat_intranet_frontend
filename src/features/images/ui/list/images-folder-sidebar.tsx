'use client'

import { useEffect, useState } from 'react'
import { HardDrive, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { storageFoldersService } from '@/features/storage-folders'
import type { StorageFolderTreeNode } from '@/features/storage-folders'
import { FolderNode } from './folder-node'

export function useImageFolderTree() {
  const [tree,      setTree]      = useState<StorageFolderTreeNode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    storageFoldersService.getAll({ path: 'images' })
      .then((res) => { if (alive) setTree(res.success ? (res.data ?? []) : []) })
      .catch(() => { if (alive) setTree([]) })
      .finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [])

  return { tree, isLoading }
}

interface ImagesFolderSidebarProps {
  tree:         StorageFolderTreeNode[]
  isLoading:    boolean
  activeFolder: string
  totalCount:   number
  onSelect:     (relativePath: string) => void
}

export function ImagesFolderSidebar({ tree, isLoading, activeFolder, totalCount, onSelect }: ImagesFolderSidebarProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => onSelect('')}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
          activeFolder === ''
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <HardDrive className="size-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">Todas las imágenes</span>
        <span className={cn('shrink-0 text-[10px]', activeFolder === '' ? 'text-primary-foreground/80' : 'text-muted-foreground/70')}>
          {totalCount}
        </span>
      </button>

      {isLoading ? (
        <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Cargando carpetas...
        </div>
      ) : tree.length === 0 ? (
        <p className="px-2 py-3 text-xs text-muted-foreground">Sin subcarpetas todavía.</p>
      ) : (
        tree.map((node) => (
          <FolderNode key={node.path} node={node} activeFolder={activeFolder} onSelect={onSelect} depth={0} />
        ))
      )}
    </div>
  )
}
