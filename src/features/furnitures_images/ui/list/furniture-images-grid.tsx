'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageOff, LoaderCircle } from 'lucide-react'
import NProgress from 'nprogress'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalConfirm, swalDeleteConfirm } from '@/shared/lib/swal'
import { useFurnitureImageListStore } from '../../stores/useFurnitureImageListStore'
import { useFurnitureImageFormStore } from '../../stores/useFurnitureImageFormStore'
import type { FurnitureImage } from '../../data/schema'
import { FurnitureImageCard } from './furniture-image-card'
import { FurnitureImagesPagination } from './furniture-images-pagination'

export function FurnitureImagesGrid() {
  const router = useRouter()
  const {
    items, meta, filters, hasLoaded, isFetching, isError, message,
    load, reset, setCurrentItem,
  } = useFurnitureImageListStore()
  const { toggleState, remove, bulkRemove } = useFurnitureImageFormStore()

  const [selected, setSelected]           = useState<Set<number>>(new Set())
  const [stateFilter, setStateFilter]     = useState<string>(
    filters.state !== undefined ? String(filters.state) : 'all'
  )
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [lightboxIdx, setLightboxIdx]     = useState(-1)
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching] = useState(false)

  const appliedFilters = useRef({ stateFilter })

  useEffect(() => { void load() }, [])

  useEffect(() => {
    const prev = appliedFilters.current
    const changed = prev.stateFilter !== stateFilter
    appliedFilters.current = { stateFilter }
    if (!changed) return

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({ state: stateFilter === 'all' ? undefined : Number(stateFilter), page: 1 }).finally(() => setIsUserFetching(false))
    }, 300)
    return () => window.clearTimeout(t)
  }, [stateFilter])

  useEffect(() => { setSelected(new Set()) }, [filters.page])

  const toggleSelect   = (id: number) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allSelected    = items.length > 0 && items.every((i) => selected.has(i.id))
  const someSelected   = items.some((i) => selected.has(i.id))
  const toggleAll      = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))

  const resetFilters   = () => {
    setStateFilter('all')
    setIsUserFetching(true)
    void load({ state: undefined, page: 1 }).finally(() => setIsUserFetching(false))
  }

  const handleView = (item: FurnitureImage) => {
    setCurrentItem(item)
    NProgress.start()
    router.push(`/furniture-images/${item.id}`)
  }

  const handleEdit = (item: FurnitureImage) => {
    setCurrentItem(item)
    NProgress.start()
    router.push(`/furniture-images/edit/${item.id}`)
  }

  const handleToggleState = async (item: FurnitureImage) => {
    const newState    = item.stateValue === 1 ? 0 : 1
    const actionLabel = newState === 1 ? 'Activar' : 'Desactivar'
    const confirmed   = await swalConfirm({
      title: `¿${actionLabel} esta imagen?`,
      text: item.furnitureName,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return
    const ok = await toggleState(item.id, newState)
    if (ok) toastSuccess(`Imagen ${newState === 1 ? 'activada' : 'desactivada'}`)
    else    toastError('Error', 'No se pudo cambiar el estado.')
  }

  const handleDelete = async (item: FurnitureImage) => {
    const confirmed = await swalDeleteConfirm(
      `¿Eliminar imagen de "${item.furnitureName}"?`,
      'Esta acción no se puede deshacer.'
    )
    if (!confirmed) return
    const ok = await remove(item.id)
    if (ok) toastSuccess('Imagen eliminada')
    else    toastError('Error', 'No se pudo eliminar.')
  }

  const selectedIds   = Array.from(selected)
  const selectedCount = selectedIds.length

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    try {
      const results = await Promise.all(selectedIds.map((id) => toggleState(id, 1)))
      if (results.every(Boolean)) {
        toastSuccess('Activadas', `${selectedCount} imagen(es) activada(s).`)
        setSelected(new Set())
      } else {
        toastError('Error', 'No se pudieron activar todos los registros.')
      }
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    try {
      const results = await Promise.all(selectedIds.map((id) => toggleState(id, 0)))
      if (results.every(Boolean)) {
        toastSuccess('Desactivadas', `${selectedCount} imagen(es) desactivada(s).`)
        setSelected(new Set())
      } else {
        toastError('Error', 'No se pudieron desactivar todos los registros.')
      }
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    const confirmed = await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} imagen(es)?`,
      'Esta acción no se puede deshacer.'
    )
    if (!confirmed) return
    setIsBulkLoading(true)
    try {
      const ok = await bulkRemove(selectedIds)
      if (ok) { toastSuccess('Eliminadas', `${selectedCount} imagen(es) eliminada(s).`); setSelected(new Set()) }
      else toastError('Error', 'No se pudieron eliminar todos los registros.')
    } finally {
      setIsBulkLoading(false)
    }
  }

  // Lightbox slides
  const lightboxSlides = items
    .filter((i) => i.imageUrl)
    .map((i) => ({ src: i.imageUrl!, alt: i.imageName ?? '' }))

  if (!hasLoaded) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando imágenes...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Estado</span>
          <Select value={stateFilter} disabled={isFetching} onValueChange={setStateFilter}>
            <SelectTrigger className="h-8 w-[155px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {ENTITY_STATES.map((s) => (
                <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col justify-end">
          <Button variant="ghost" size="sm" disabled={isFetching} onClick={resetFilters}>
            Limpiar
          </Button>
        </div>
        {items.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={toggleAll}
              id="select-all-fi"
            />
            <label htmlFor="select-all-fi" className="cursor-pointer select-none text-xs text-muted-foreground">
              Seleccionar página
            </label>
          </div>
        )}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <ImageOff className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay imágenes para mostrar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, idx) => (
            <FurnitureImageCard
              key={item.id}
              item={item}
              isSelected={selected.has(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
              onView={() => handleView(item)}
              onEdit={() => handleEdit(item)}
              onToggleState={() => void handleToggleState(item)}
              onDelete={() => void handleDelete(item)}
              onOpenLightbox={() => {
                const lbIdx = lightboxSlides.findIndex((s) => s.src === item.imageUrl)
                setLightboxIdx(lbIdx >= 0 ? lbIdx : idx)
              }}
            />
          ))}
        </div>
      )}

      {meta && (
        <FurnitureImagesPagination
          meta={meta}
          onPageChange={(page) => { setIsUserFetching(true); void load({ page }).finally(() => setIsUserFetching(false)) }}
          onPageSizeChange={(per_page) => { setIsUserFetching(true); void load({ per_page, page: 1 }).finally(() => setIsUserFetching(false)) }}
        />
      )}

      <DataTableBulkActions
        selectedCount={selectedCount}
        isLoading={isBulkLoading}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onClear={() => setSelected(new Set())}
      />

      <Lightbox
        open={lightboxIdx >= 0}
        close={() => setLightboxIdx(-1)}
        index={lightboxIdx}
        slides={lightboxSlides}
        plugins={[Zoom]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
      />
    </div>
  )
}
