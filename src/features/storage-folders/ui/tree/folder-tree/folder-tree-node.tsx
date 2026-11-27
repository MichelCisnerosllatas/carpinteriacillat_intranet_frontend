'use client'

import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useCan } from '@/features/auth/hooks/usePermission'
import type { StorageFolderTreeNode } from '../../../data/schema'
import type { DragPayload } from './types'

// ── Tree node ─────────────────────────────────────────────────────────────────

interface FolderTreeNodeProps {
  node:          StorageFolderTreeNode
  activePath:    string | null
  onNavigate:    (path: string) => void
  onItemDrop?:   (targetPath: string | null, payload: DragPayload) => void
  level?:        number
}

export function FolderTreeNode({ node, activePath, onNavigate, onItemDrop, level = 0 }: FolderTreeNodeProps) {
  const [expanded,   setExpanded]   = useState(activePath?.startsWith(node.path) ?? false)
  const [isDragOver, setIsDragOver] = useState(false)
  // Arrastrar una carpeta la mueve: solo con permiso de editar (ver ROLES_Y_PERMISOS.md)
  const canUpdate = useCan('storage_folders.update')

  const hasChildren = node.children.length > 0
  const isActive    = activePath === node.path

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded((v) => !v)
  }

  // ── Drag source (this node is a folder being dragged) ────────────────────

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    const payload: DragPayload = {
      kind:     'folder',
      paths:    [node.path],
      encodeds: [node.path_encoded],
    }
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'move'
  }

  // ── Drop target ──────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/json')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const raw = e.dataTransfer.getData('application/json')
    if (!raw || !onItemDrop) return
    try {
      const payload: DragPayload = JSON.parse(raw)
      // Prevent dropping a folder onto itself
      if (payload.kind === 'folder' && payload.paths.includes(node.path)) return
      if (payload.encodeds?.length) onItemDrop(node.path, payload)
    } catch { /* ignore malformed */ }
  }

  return (
    <div>
      <button
        type="button"
        draggable={canUpdate}
        onDragStart={canUpdate ? handleDragStart : undefined}
        onClick={() => onNavigate(node.path)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors text-left',
          isActive
            ? 'bg-amber-100 text-amber-800 font-medium dark:bg-amber-950/40 dark:text-amber-300'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground',
          isDragOver && !isActive && 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300',
          isDragOver && isActive  && 'ring-1 ring-emerald-400',
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <span
            onClick={toggle}
            className="shrink-0 flex items-center justify-center size-4 rounded hover:bg-muted-foreground/20"
          >
            <ChevronRight className={cn('size-3 transition-transform', expanded && 'rotate-90')} />
          </span>
        ) : (
          <span className="size-4 shrink-0" />
        )}

        {/* Icon */}
        {isActive || expanded
          ? <FolderOpen className={cn('size-4 shrink-0', isDragOver ? 'text-emerald-500' : 'text-amber-500')} />
          : <Folder    className={cn('size-4 shrink-0', isDragOver ? 'text-emerald-500' : 'text-amber-400 group-hover:text-amber-500')} />
        }

        {/* Name */}
        <span className="truncate text-xs leading-tight">{node.name}</span>

        {/* Drop hint badge */}
        {isDragOver && (
          <span className="ml-auto shrink-0 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-full">
            Mover aquí
          </span>
        )}

        {/* File count badge (hidden while drag-over) */}
        {!isDragOver && node.files_count > 0 && (
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/60">
            {node.files_count}
          </span>
        )}
      </button>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FolderTreeNode
              key={child.path}
              node={child}
              activePath={activePath}
              onNavigate={onNavigate}
              onItemDrop={onItemDrop}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
