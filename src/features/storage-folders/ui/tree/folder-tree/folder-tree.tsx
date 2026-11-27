'use client'

import { useState } from 'react'
import { Folder, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { StorageFolderTreeNode } from '../../../data/schema'
import type { DragPayload } from './types'
import { FolderTreeNode } from './folder-tree-node'

// ── Public tree ───────────────────────────────────────────────────────────────

interface FolderTreeProps {
  tree:         StorageFolderTreeNode[]
  activePath:   string | null
  isLoading:    boolean
  onNavigate:   (path: string | null) => void
  onItemDrop?:  (targetPath: string | null, payload: DragPayload) => void
  /** @deprecated use onItemDrop — kept for backwards compat */
  onFileDrop?:  (targetPath: string | null, encodeds: string[]) => void
}

export function FolderTree({ tree, activePath, isLoading, onNavigate, onItemDrop, onFileDrop }: FolderTreeProps) {
  const [rootDragOver, setRootDragOver] = useState(false)

  // Bridge: if consumer only passes onFileDrop, wrap it into onItemDrop shape
  const handleItemDrop = (targetPath: string | null, payload: DragPayload) => {
    if (onItemDrop) { onItemDrop(targetPath, payload); return }
    if (onFileDrop && payload.kind === 'file') onFileDrop(targetPath, payload.encodeds)
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/json')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setRootDragOver(true)
  }

  const handleRootDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setRootDragOver(false)
    }
  }

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setRootDragOver(false)
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    try {
      const payload: DragPayload = JSON.parse(raw)
      if (payload.encodeds?.length) handleItemDrop(null, payload)
    } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto">
      {/* Root entry */}
      <button
        type="button"
        onClick={() => onNavigate(null)}
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors text-left',
          activePath === null
            ? 'bg-amber-100 text-amber-800 font-medium dark:bg-amber-950/40 dark:text-amber-300'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground',
          rootDragOver && 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300',
        )}
      >
        <span className="size-4 shrink-0" />
        <Folder className={cn('size-4 shrink-0', rootDragOver ? 'text-emerald-500' : activePath === null ? 'text-amber-500' : 'text-amber-400')} />
        <span className="text-xs font-medium">Storage (raíz)</span>
        {rootDragOver && (
          <span className="ml-auto shrink-0 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-full">
            Mover aquí
          </span>
        )}
      </button>

      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Cargando árbol...
        </div>
      ) : (
        tree.map((node) => (
          <FolderTreeNode
            key={node.path}
            node={node}
            activePath={activePath}
            onNavigate={onNavigate}
            onItemDrop={handleItemDrop}
          />
        ))
      )}
    </div>
  )
}
