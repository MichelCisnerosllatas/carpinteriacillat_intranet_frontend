'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle, HardDrive, RefreshCw, ServerCrash } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useImageStorageStore } from '../../stores/useImageStorageStore'
import type { StorageFileItem } from '../../model/imagestorage.dto'
import { ImageStorageCard } from './image-storage-card'

export function ImageStorageGallery() {
  const {
    items, meta, filters, hasLoaded, isFetching, isError, message,
    load, deleteFile, reset,
  } = useImageStorageStore()

  /** true solo mientras hay un fetch disparado por el usuario (paginación/recarga manual) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching] = useState(false)

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
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsUserFetching(true)
              void load({ page: 1 }).finally(() => setIsUserFetching(false))
            }}
          >
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
            <ImageStorageCard key={file.path} file={file} onDelete={handleDelete} />
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
              onClick={() => {
                setIsUserFetching(true)
                void load({ page: currentPage - 1 }).finally(() => setIsUserFetching(false))
              }}
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
              onClick={() => {
                setIsUserFetching(true)
                void load({ page: currentPage + 1 }).finally(() => setIsUserFetching(false))
              }}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
