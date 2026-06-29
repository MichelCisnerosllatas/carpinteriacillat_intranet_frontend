'use client'

import { useEffect, useRef, useState } from 'react'
import { Folder, FolderPlus, Loader2, RefreshCw, Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { useStorageFolderListStore } from '../../stores/useStorageFolderListStore'
import { FolderCard } from './folder-card'
import { FolderBreadcrumb } from './folder-breadcrumb'
import type { StorageFolder } from '../../data/schema'

interface FolderExplorerProps {
  onNavigate:  (path: string | null) => void
  onNewFolder: () => void
  onRename:    (folder: StorageFolder) => void
  onDelete:    (folder: StorageFolder) => void
}

export function FolderExplorer({ onNavigate, onNewFolder, onRename, onDelete }: FolderExplorerProps) {
  const { items, meta, filters, breadcrumb, hasLoaded, isFetching, isError, message, load } =
    useStorageFolderListStore()

  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load on mount
  useEffect(() => { void load() }, [])

  // Search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void load({ page: 1, search: search.trim() || undefined })
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const currentPath = filters.path ?? null

  // Dummy table for DataTablePagination
  const dummyTable = {
    getState: () => ({
      pagination: {
        pageIndex: (meta?.current_page ?? 1) - 1,
        pageSize:  meta?.per_page ?? 20,
      },
    }),
    getPageCount:      () => meta?.last_page ?? 1,
    getCanPreviousPage: () => (meta?.current_page ?? 1) > 1,
    getCanNextPage:    () => (meta?.current_page ?? 1) < (meta?.last_page ?? 1),
    previousPage:      () => { void load({ page: (meta?.current_page ?? 1) - 1 }) },
    nextPage:          () => { void load({ page: (meta?.current_page ?? 1) + 1 }) },
    setPageIndex:      (idx: number) => { void load({ page: idx + 1 }) },
    setPageSize:       (size: number) => { void load({ page: 1, per_page: size }) },
  } as any

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <FolderBreadcrumb
            breadcrumb={breadcrumb}
            currentPath={currentPath}
            onNavigate={(path) => {
              setSearch('')
              onNavigate(path)
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void load({ page: 1 })}
              disabled={isFetching}
              className="gap-1.5"
            >
              <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button size="sm" onClick={onNewFolder} className="gap-1.5">
              <FolderPlus className="size-3.5" />
              <span className="hidden sm:inline">Nueva carpeta</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar carpetas..."
            className="pl-8 h-8 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {/* Loading initial */}
        {!hasLoaded && (
          <div className="flex items-center justify-center gap-2 h-32 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando carpetas...
          </div>
        )}

        {/* Error */}
        {hasLoaded && isError && (
          <div className="flex flex-col items-center justify-center gap-3 h-32 text-sm text-muted-foreground">
            <p>{message ?? 'Error al cargar las carpetas.'}</p>
            <Button variant="outline" size="sm" onClick={() => void load({ page: 1 })}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty */}
        {hasLoaded && !isError && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 h-40 rounded-2xl border-2 border-dashed border-border text-muted-foreground">
            <Folder className="size-10 text-muted-foreground/30" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {search ? 'Sin resultados' : 'Sin carpetas'}
              </p>
              <p className="text-xs mt-0.5">
                {search
                  ? `No hay carpetas que coincidan con "${search}"`
                  : 'Crea la primera carpeta en esta ubicación'}
              </p>
            </div>
            {!search && (
              <Button size="sm" variant="outline" onClick={onNewFolder} className="gap-1.5">
                <FolderPlus className="size-3.5" />
                Nueva carpeta
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {hasLoaded && !isError && items.length > 0 && (
          <div className={cn(
            'grid gap-3',
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
            isFetching && 'opacity-60 pointer-events-none',
          )}>
            {items.map((folder) => (
              <FolderCard
                key={folder.path}
                folder={folder}
                onClick={() => {
                  setSearch('')
                  onNavigate(folder.path)
                }}
                onRename={() => onRename(folder)}
                onDelete={() => onDelete(folder)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasLoaded && !isError && (meta?.last_page ?? 1) > 1 && (
        <DataTablePagination table={dummyTable} />
      )}
    </div>
  )
}
