'use client'

import { HardDrive } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { FolderTreeItem } from './folder-tree-item'
import type { FolderNode } from './types'

// ─── Folder sidebar (shared between desktop aside + mobile Sheet) ─────────────

export function FolderSidebar({
  folders, activeFolder, onSelect,
}: {
  folders: string[]; activeFolder: string; onSelect: (path: string) => void
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
          activeFolder === 'all'
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <HardDrive className="size-3.5 shrink-0" />
        <span>Todas</span>
      </button>
      {buildFolderTree(folders).map((node) => (
        <FolderTreeItem
          key={node.path}
          node={node}
          activeFolder={activeFolder}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  )
}

function buildFolderTree(folders: string[]): FolderNode[] {
  const root: FolderNode[] = []
  const nodeMap = new Map<string, FolderNode>()

  // Sort ensures parents always come before children
  const sorted = [...folders].filter((f) => f !== '(raíz)').sort()

  for (const folderPath of sorted) {
    const parts      = folderPath.split('/')
    const name       = parts[parts.length - 1]
    const parentPath = parts.slice(0, -1).join('/')
    const node: FolderNode = { name, path: folderPath, children: [] }
    nodeMap.set(folderPath, node)

    const parent = parentPath ? nodeMap.get(parentPath) : null
    if (parent) parent.children.push(node)
    else root.push(node)
  }

  // Add "(raíz)" at the top if present
  if (folders.includes('(raíz)')) {
    root.unshift({ name: '(raíz)', path: '(raíz)', children: [] })
  }

  return root
}
