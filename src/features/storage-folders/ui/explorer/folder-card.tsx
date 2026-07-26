'use client'

import { FileStack, Folder, FolderOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { StorageFolder } from '../../data/schema'

interface FolderCardProps {
  folder:    StorageFolder
  isActive?: boolean
  onClick:   () => void
  onRename:  () => void
  onDelete:  () => void
}

export function FolderCard({ folder, isActive, onClick, onRename, onDelete }: FolderCardProps) {
  const hasChildren = folder.subdirectories_count > 0

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card p-4 transition-all duration-200 cursor-pointer select-none',
        'hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5',
        isActive && 'border-amber-400/60 shadow-md shadow-amber-500/10 bg-amber-50/50 dark:bg-amber-950/20',
      )}
      onDoubleClick={onClick}
      onClick={onClick}
    >
      {/* Menu */}
      <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent>Más acciones</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onRename() }}
              className="gap-2 cursor-pointer"
            >
              <Pencil className="size-3.5" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Folder Icon */}
      <div className="mb-3 flex items-end justify-between">
        <div className={cn(
          'flex items-center justify-center rounded-xl transition-colors duration-200',
          'size-14',
          isActive
            ? 'text-amber-500'
            : 'text-amber-400 group-hover:text-amber-500',
        )}>
          {hasChildren
            ? <FolderOpen className="size-14 fill-amber-100 dark:fill-amber-950/50 stroke-[1.5]" />
            : <Folder className="size-14 fill-amber-100 dark:fill-amber-950/50 stroke-[1.5]" />
          }
        </div>

        {/* Subdirectories badge */}
        {folder.subdirectories_count > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {folder.subdirectories_count} sub
          </span>
        )}
      </div>

      {/* Name */}
      <p className="truncate text-sm font-semibold leading-tight text-foreground mb-1">
        {folder.name}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <FileStack className="size-3 shrink-0" />
        <span>
          {folder.files_count === 0
            ? 'Sin archivos'
            : `${folder.files_count} archivo${folder.files_count !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Last modified */}
      {folder.last_modified && (
        <p className="mt-2 text-[10px] text-muted-foreground/70 truncate">
          {new Date(folder.last_modified).toLocaleDateString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </p>
      )}
    </div>
  )
}
