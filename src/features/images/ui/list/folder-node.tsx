'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { StorageFolderTreeNode } from '@/features/storage-folders'

// Las rutas que devuelve el módulo de carpetas son absolutas ("images/muebles/2024").
// ImagesGrid trabaja con rutas relativas a "images" (ver getImageFolder en lib/image-url),
// así que esta es la única traducción entre ambos mundos.
const toRelative = (path: string) =>
  path === 'images' ? '' : path.replace(/^images\//, '')

export function FolderNode({
  node, activeFolder, onSelect, depth,
}: {
  node: StorageFolderTreeNode; activeFolder: string; onSelect: (path: string) => void; depth: number
}) {
  const relPath     = toRelative(node.path)
  const isActive    = activeFolder === relPath
  const isAncestor  = activeFolder.startsWith(relPath + '/')
  const [open, setOpen] = useState(isActive || isAncestor)
  const hasChildren  = node.children.length > 0

  useEffect(() => { if (isActive || isAncestor) setOpen(true) }, [isActive, isAncestor])

  return (
    <div>
      <div
        className={cn(
          'flex w-full items-center rounded-lg text-xs transition-colors',
          isActive
            ? 'bg-amber-100 text-amber-800 font-medium dark:bg-amber-950/40 dark:text-amber-300'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {/* Botón de expandir/colapsar — hit-target ampliado (antes 20px de ancho): con un
            objetivo tan chico, un toque para explorar subcarpetas caía fácilmente sobre el
            botón de nombre de al lado y filtraba+cerraba el panel sin querer. Misma altura
            que el botón de nombre (py-2.5) para no invadir filas vecinas. */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); hasChildren && setOpen((v) => !v) }}
          tabIndex={-1}
          className={cn(
            'flex w-8 shrink-0 items-center justify-center py-2.5',
            !hasChildren && 'cursor-default opacity-0',
          )}
        >
          <ChevronRight className={cn('size-3.5 transition-transform', open && 'rotate-90')} />
        </button>

        <button
          type="button"
          onClick={() => onSelect(relPath)}
          className="flex flex-1 items-center gap-1.5 overflow-hidden py-2.5 pr-2 text-left"
        >
          {open && hasChildren
            ? <FolderOpen className="size-3.5 shrink-0 text-amber-500" />
            : <Folder className="size-3.5 shrink-0 text-amber-400" />}
          <span className="truncate">{node.name}</span>
          {node.files_count > 0 && (
            <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/70">{node.files_count}</span>
          )}
        </button>
      </div>

      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <FolderNode key={child.path} node={child} activeFolder={activeFolder} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
