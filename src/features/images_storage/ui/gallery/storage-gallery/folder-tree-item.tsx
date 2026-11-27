'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { FolderNode } from './types'

const ChevronRightIcon = ChevronRight

export function FolderTreeItem({
  node, activeFolder, onSelect, depth = 0,
}: {
  node: FolderNode; activeFolder: string
  onSelect: (path: string) => void; depth?: number
}) {
  const isActive   = activeFolder === node.path
  const isAncestor = activeFolder.startsWith(node.path + '/')
  const [open, setOpen] = useState(isActive || isAncestor)
  const hasChildren = node.children.length > 0

  // Auto-expand when descendant becomes active
  useEffect(() => {
    if (isActive || isAncestor) setOpen(true)
  }, [isActive, isAncestor])

  return (
    <div>
      <div
        className={cn(
          'flex w-full items-center rounded-lg text-xs transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {/* Expand toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => hasChildren && setOpen((p) => !p)}
              className={cn('flex size-5 shrink-0 items-center justify-center', !hasChildren && 'cursor-default opacity-0')}
              tabIndex={-1}
            >
              {open ? <ChevronDown className="size-3" /> : <ChevronRightIcon className="size-3" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{open ? 'Colapsar carpeta' : 'Expandir carpeta'}</TooltipContent>
        </Tooltip>

        {/* Folder label (click = filter) */}
        <button
          onClick={() => onSelect(node.path)}
          className="flex flex-1 items-center gap-1.5 overflow-hidden py-1.5 pr-2 text-left"
        >
          {open && hasChildren
            ? <FolderOpen className="size-3.5 shrink-0" />
            : <Folder className="size-3.5 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.path}
              node={child}
              activeFolder={activeFolder}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
