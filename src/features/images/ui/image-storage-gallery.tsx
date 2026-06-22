'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle, HardDrive, Trash2, ExternalLink, RefreshCw, ServerCrash } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Badge } from '@/shared/ui/badge'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useImageStorageStore } from '../stores/useImageStorageStore'
import type { StorageFileItem } from '../model/imagestorage.dto'

function StorageCard({ file, onDelete }: { file: StorageFileItem; onDelete: (file: StorageFileItem) => void }) {
  const [imgError, setImgError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const filename = file.path.split('/').pop() ?? file.path
  const ext = filename.split('.').pop()?.toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext ?? '')

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        {isImage && !imgError ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <img
              src={file.url}
              alt={filename}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              onLoad={() => setLoaded(true)}
              onError={() => { setImgError(true); setLoaded(true) }}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <HardDrive className="size-8" />
            {ext && <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono uppercase">{ext}</span>}
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="size-8" asChild>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver archivo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                className="size-8"
                onClick={() => onDelete(file)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar del servidor</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="truncate text-xs font-medium">{filename}</p>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs break-all">{file.path}</p>
          </TooltipContent>
        </Tooltip>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{file.path}</p>
      </div>
    </div>
  )
}

export function ImageStorageGallery() {
  const {
    items, meta, filters, hasLoaded, isFetching, isError, message,
    load, deleteFile, reset,
  } = useImageStorageStore()

  useEffect(() => { void load() }, [])

  const handleDelete = async (file: StorageFileItem) => {
    const filename = file.path.split('/').pop() ?? file.path
    const confirmed = await swalDeleteConfirm(
      `¿Eliminar "${filename}" del servidor?`,
      'Se eliminará el archivo físico del almacenamiento. Esta acción no se puede deshacer.'
    )
    if (!confirmed) return
    const ok = await deleteFile(file.path)
    if (ok) toastSuccess('Archivo eliminado', `"${filename}" fue eliminado del servidor.`)
    else toastError('Error al eliminar', 'No se pudo eliminar el archivo del servidor.')
  }

  const currentPage = filters.page ?? 1
  const lastPage    = meta?.last_page ?? 1

  if (!hasLoaded && !isFetching) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando archivos del servidor...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <ServerCrash className="size-10 text-muted-foreground" />
        <p className="text-sm font-semibold">Error al cargar almacenamiento</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total ?? 0} archivo(s) en el servidor` : 'Cargando...'}
          </p>
          <Badge variant="outline" className="text-xs">
            <HardDrive className="size-3 mr-1" />Storage
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" />Actualizando...
            </div>
          )}
          <Button size="sm" variant="outline" onClick={() => void load({ page: 1 })}>
            <RefreshCw className="size-3.5 mr-1.5" />Recargar
          </Button>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
          <HardDrive className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay archivos en el servidor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((file) => (
            <StorageCard key={file.path} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {meta ? `Mostrando ${meta.from ?? 0} – ${meta.to ?? 0} de ${meta.total ?? 0}` : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => void load({ page: currentPage - 1 })}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {lastPage}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= lastPage || isFetching}
              onClick={() => void load({ page: currentPage + 1 })}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
