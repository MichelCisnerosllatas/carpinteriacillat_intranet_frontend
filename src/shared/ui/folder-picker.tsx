'use client'

import { useEffect, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Folder, FolderOpen, FolderPlus,
  HardDrive, Loader2, X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toastSuccess } from '@/shared/lib/toast'
import apiClient from '@/shared/api/apiClient'
import type { StorageFolderListResponseDto, StorageFolderItem } from '@/features/storage-folders/model/storagefolder.get.dto'

type StorageFolderPostResponse = {
  success: boolean
  status:  number
  message: string
  data:    StorageFolderItem
}

interface FolderPickerProps {
  value?:       string
  onChange:     (path: string) => void
  onClear?:     () => void
  placeholder?: string
  disabled?:    boolean
  className?:   string
  rootPath?:    string
}

type BreadcrumbEntry = { name: string; path: string | null }

export function FolderPicker({
  value, onChange, onClear, placeholder = 'Seleccionar carpeta...', disabled, className, rootPath,
}: FolderPickerProps) {
  const [open, setOpen]           = useState(false)
  const [currentPath, setCurrentPath] = useState<string | null>(rootPath ?? null)
  const [folders, setFolders]     = useState<StorageFolderItem[]>([])
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([{ name: 'Storage', path: null }])
  const [isLoading, setIsLoading] = useState(false)
  const [parentPath, setParentPath] = useState<string | null>(null)
  const [showCreate, setShowCreate]         = useState(false)
  const [newFolderName, setNewFolderName]   = useState('')
  const [isCreating, setIsCreating]         = useState(false)
  const [createError, setCreateError]       = useState<string | null>(null)

  const fetchFolders = async (path: string | null) => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = {}
      if (path) params.path = path
      const { data } = await apiClient.get<StorageFolderListResponseDto>(
        '/v1/intranet/storage/folders',
        { params }
      )
      setFolders(data.data ?? [])
      setParentPath(data.meta?.parent_path ?? null)

      // Build breadcrumb from response meta
      const crumbs: BreadcrumbEntry[] = [{ name: 'Storage', path: null }]
      if (data.meta?.breadcrumb) {
        data.meta.breadcrumb.forEach((b) => crumbs.push({ name: b.name, path: b.path }))
      }
      // When rootPath is set, trim breadcrumb so it starts at rootPath (can't navigate above it)
      const filteredCrumbs = rootPath
        ? crumbs.filter((c) => c.path !== null && (c.path === rootPath || c.path.startsWith(rootPath + '/')))
        : crumbs
      setBreadcrumb(filteredCrumbs)
    } catch {
      setFolders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Reload when popover opens
  useEffect(() => {
    if (open) {
      const initial = rootPath ?? null
      setCurrentPath(initial)
      void fetchFolders(initial)
    } else {
      setShowCreate(false)
      setNewFolderName('')
      setCreateError(null)
    }
  }, [open])

  const navigate = (path: string | null) => {
    setCurrentPath(path)
    setShowCreate(false)
    setNewFolderName('')
    setCreateError(null)
    void fetchFolders(path)
  }

  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim()
    if (!trimmed) return
    setIsCreating(true)
    setCreateError(null)
    try {
      const { data } = await apiClient.post<StorageFolderPostResponse>(
        '/v1/intranet/storage/folders',
        { name: trimmed, parent_path: currentPath ?? undefined },
      )
      if (data.success) {
        toastSuccess('Carpeta creada', `"${trimmed}" fue creada correctamente.`)
        setShowCreate(false)
        setNewFolderName('')
        await fetchFolders(currentPath)
      } else {
        setCreateError(data.message ?? 'No se pudo crear la carpeta.')
      }
    } catch (error: any) {
      setCreateError(error?.response?.data?.message ?? error?.message ?? 'No se pudo crear la carpeta.')
    } finally {
      setIsCreating(false)
    }
  }

  const toRelative = (path: string) => {
    if (!rootPath) return path
    if (path.startsWith(rootPath + '/')) return path.slice(rootPath.length + 1)
    return path
  }

  const handleSelect = () => {
    if (currentPath !== null) {
      onChange(toRelative(currentPath))
    }
    setOpen(false)
  }

  const handleSelectFolder = (folder: StorageFolderItem) => {
    onChange(toRelative(folder.path))
    setOpen(false)
  }

  const displayValue = value || null

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:bg-muted/40',
            'disabled:pointer-events-none disabled:opacity-50',
            !displayValue && 'text-muted-foreground',
            className,
          )}
        >
          <Folder className="size-4 shrink-0 text-amber-500" />
          <span className="flex-1 truncate text-left text-xs">
            {displayValue ?? placeholder}
          </span>
          {displayValue && onClear && !disabled && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  onClick={(e) => { e.stopPropagation(); onClear() }}
                  className="shrink-0 rounded hover:text-foreground text-muted-foreground"
                >
                  <X className="size-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Quitar carpeta seleccionada</TooltipContent>
            </Tooltip>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="start" sideOffset={4}>
        {/* Header */}
        <div className="flex items-center gap-1 border-b px-2 py-2 flex-wrap">
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1
            return (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3 text-muted-foreground/50" />}
                <button
                  type="button"
                  onClick={() => !isLast && navigate(crumb.path)}
                  className={cn(
                    'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors',
                    isLast
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer',
                  )}
                >
                  {i === 0 && <HardDrive className="size-3" />}
                  {crumb.name}
                </button>
              </div>
            )
          })}
        </div>

        {/* Back button */}
        {currentPath !== null && (!rootPath || currentPath !== rootPath) && (
          <div className="px-2 pt-2">
            <button
              type="button"
              onClick={() => navigate(parentPath)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-3.5" />
              Subir un nivel
            </button>
          </div>
        )}

        {/* Crear carpeta rápido, dentro de la carpeta actual */}
        <div className="px-2 pt-1.5">
          {showCreate ? (
            <div className="flex flex-col gap-1 px-2 pb-1">
              <div className="flex items-center gap-1.5">
                <Input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); void handleCreateFolder() }
                    if (e.key === 'Escape') { setShowCreate(false); setNewFolderName(''); setCreateError(null) }
                  }}
                  placeholder="Nombre de la carpeta"
                  disabled={isCreating}
                  maxLength={100}
                  className="h-7 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-7 shrink-0 px-2 text-xs"
                  onClick={handleCreateFolder}
                  disabled={isCreating || !newFolderName.trim()}
                >
                  {isCreating ? <Loader2 className="size-3.5 animate-spin" /> : 'Crear'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 shrink-0 p-0"
                  onClick={() => { setShowCreate(false); setNewFolderName(''); setCreateError(null) }}
                  disabled={isCreating}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              {createError && (
                <p className="rounded bg-destructive/10 px-2 py-1 text-[11px] text-destructive">{createError}</p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] text-primary hover:opacity-80"
            >
              <FolderPlus className="size-3" />
              <span className="underline underline-offset-2">Nueva carpeta</span>
            </button>
          )}
        </div>

        {/* Folder list */}
        <div className="max-h-52 overflow-y-auto px-2 py-2 flex flex-col gap-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Cargando...
            </div>
          ) : folders.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Sin subcarpetas</p>
          ) : (
            folders.map((folder) => (
              <div
                key={folder.path}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted cursor-pointer"
              >
                {/* Navigate into folder */}
                <button
                  type="button"
                  onClick={() => navigate(folder.path)}
                  className="flex flex-1 items-center gap-2 min-w-0"
                >
                  {folder.subdirectories_count > 0
                    ? <FolderOpen className="size-4 shrink-0 text-amber-400" />
                    : <Folder className="size-4 shrink-0 text-amber-400" />
                  }
                  <span className="truncate text-left">{folder.name}</span>
                  {folder.subdirectories_count > 0 && (
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground/50 ml-auto" />
                  )}
                </button>

                {/* Quick select */}
                <button
                  type="button"
                  onClick={() => handleSelectFolder(folder)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground transition-opacity"
                >
                  Selec.
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: select current */}
        <div className="border-t px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground truncate">
            {currentPath ?? 'raíz'}
          </span>
          <Button
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={handleSelect}
            disabled={currentPath === null || (!!rootPath && currentPath === rootPath)}
          >
            Usar esta carpeta
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
