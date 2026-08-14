'use client'

import { useEffect, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Folder, FolderOpen, FolderPlus,
  HardDrive, Loader2, X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useIsMobile } from '@/shared/lib/use-mobile'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'
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
  const isMobile = useIsMobile()

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

  // "value" guarda la ruta RELATIVA a rootPath (ver toRelative). Para reabrir el picker
  // ya parado en la carpeta elegida, hay que reconstruir la ruta absoluta a partir de ella.
  const toAbsolute = (relPath: string) => {
    if (!rootPath) return relPath
    return relPath ? `${rootPath}/${relPath}` : rootPath
  }

  // Reload when popover/sheet opens — si ya había una carpeta elegida (value), se abre
  // parado ahí en vez de siempre volver a la raíz configurada (rootPath). Antes, cada
  // reapertura ignoraba la selección previa y arrancaba de cero.
  useEffect(() => {
    if (open) {
      const initial = value ? toAbsolute(value) : (rootPath ?? null)
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

  const triggerButton = (
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
  )

  // Cuerpo compartido entre la versión de escritorio (Popover chico) y la versión mobile
  // (Sheet a pantalla casi completa). Los tamaños con pointer-coarse: solo se activan en
  // pantallas táctiles — en mouse, todo queda exactamente igual que antes.
  const body = (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 border-b px-2 py-2 flex-wrap shrink-0">
        {breadcrumb.map((crumb, i) => {
          const isLast = i === breadcrumb.length - 1
          return (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3 text-muted-foreground/50" />}
              <button
                type="button"
                onClick={() => !isLast && navigate(crumb.path)}
                className={cn(
                  'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors pointer-coarse:px-2 pointer-coarse:py-1.5 pointer-coarse:text-sm',
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
        <div className="px-2 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate(parentPath)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors pointer-coarse:py-2.5 pointer-coarse:text-sm"
          >
            <ChevronLeft className="size-3.5" />
            Subir un nivel
          </button>
        </div>
      )}

      {/* Crear carpeta rápido, dentro de la carpeta actual */}
      <div className="px-2 pt-1.5 shrink-0">
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
                className="h-7 text-xs pointer-coarse:h-9 pointer-coarse:text-sm"
              />
              <Button
                type="button"
                size="sm"
                className="h-7 shrink-0 px-2 text-xs pointer-coarse:h-9 pointer-coarse:px-3"
                onClick={handleCreateFolder}
                disabled={isCreating || !newFolderName.trim()}
              >
                {isCreating ? <Loader2 className="size-3.5 animate-spin" /> : 'Crear'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 shrink-0 p-0 pointer-coarse:h-9 pointer-coarse:w-9"
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
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] text-primary hover:opacity-80 pointer-coarse:py-2 pointer-coarse:text-xs"
          >
            <FolderPlus className="size-3" />
            <span className="underline underline-offset-2">Nueva carpeta</span>
          </button>
        )}
      </div>

      {/* Folder list — en desktop una caja chica con scroll (max-h-52); en mobile ocupa
          todo el alto disponible del Sheet (flex-1), mucho más fácil de desplazar */}
      <div className={cn(
        'overflow-y-auto px-2 py-2 flex flex-col gap-0.5',
        isMobile ? 'flex-1' : 'max-h-52',
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Cargando...
          </div>
        ) : folders.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {rootPath && currentPath === rootPath
              ? 'Aún no hay subcarpetas. Crea una con "Nueva carpeta" para poder subir aquí.'
              : 'Sin subcarpetas'}
          </p>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.path}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted cursor-pointer pointer-coarse:py-1"
            >
              {/* Navigate into folder */}
              <button
                type="button"
                onClick={() => navigate(folder.path)}
                className="flex flex-1 items-center gap-2 min-w-0 pointer-coarse:py-1.5"
              >
                {folder.subdirectories_count > 0
                  ? <FolderOpen className="size-4 shrink-0 text-amber-400 pointer-coarse:size-5" />
                  : <Folder className="size-4 shrink-0 text-amber-400 pointer-coarse:size-5" />
                }
                <span className="truncate text-left pointer-coarse:text-sm">{folder.name}</span>
                {folder.subdirectories_count > 0 && (
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground/50 ml-auto" />
                )}
              </button>

              {/* Quick select — antes solo aparecía con :hover (opacity-0 group-hover:opacity-100),
                  invisible e imposible de tocar en touch; ahora siempre visible y más grande
                  en pantallas táctiles */}
              <button
                type="button"
                onClick={() => handleSelectFolder(folder)}
                className="shrink-0 opacity-0 group-hover:opacity-100 rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground transition-opacity pointer-coarse:opacity-100 pointer-coarse:px-2.5 pointer-coarse:py-1.5 pointer-coarse:text-xs"
              >
                Selec.
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer: select current */}
      <div className="border-t px-3 py-2 flex items-center justify-between gap-2 shrink-0">
        <span className="text-[11px] text-muted-foreground truncate">
          {currentPath ?? 'raíz'}
        </span>
        {(() => {
          const atRoot = currentPath === null || (!!rootPath && currentPath === rootPath)
          const button = (
            <Button
              size="sm"
              className="h-7 text-xs shrink-0 pointer-coarse:h-9 pointer-coarse:px-4 pointer-coarse:text-sm"
              onClick={handleSelect}
              disabled={atRoot}
            >
              Usar esta carpeta
            </Button>
          )
          // El botón queda deshabilitado en la raíz a propósito (no se permite subir
          // directo ahí) — sin esta explicación, se ve como si nada respondiera al click.
          if (!atRoot) return button
          return (
            <Tooltip>
              <TooltipTrigger asChild><span>{button}</span></TooltipTrigger>
              <TooltipContent>Elige o crea una subcarpeta — no se puede usar la raíz directamente.</TooltipContent>
            </Tooltip>
          )
        })()}
      </div>
    </>
  )

  // En mobile, un Popover angosto (w-72) anclado a un botón chico es muy difícil de
  // desplazar con el dedo — se reemplaza por un Sheet que ocupa casi toda la pantalla,
  // igual que ya se hace con el filtro de carpetas de la galería de imágenes.
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="bottom" className="flex h-[85vh] flex-col p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-sm">Seleccionar carpeta</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-hidden">
            {body}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" sideOffset={4}>
        {body}
      </PopoverContent>
    </Popover>
  )
}
