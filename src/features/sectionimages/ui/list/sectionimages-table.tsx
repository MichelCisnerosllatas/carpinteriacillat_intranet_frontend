'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { useSectionImageListStore } from '../../stores/useSectionImageListStore'
import { useSectionImageDeleteStore } from '../../stores/useSectionImageDeleteStore'
import { SectionImageCard } from './sectionimage-card'
import type { SectionImage } from '../../data/schema'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'

interface SectionImagesTableProps {
  /** Cuando se pasa, la vista queda filtrada a las imágenes de esa sección (uso embebido en el tab "Imágenes" del detalle de Section) y oculta el badge de sección en cada tarjeta. Sin esta prop, carga todas las imágenes (uso en la página standalone `/section-images`). */
  idSection?: number
  /** `web_settings.images_delete` — oculta "Eliminar" por tarjeta y la acción masiva. Default `true` (comportamiento de siempre, y el único caso en la página standalone, que no tiene ese contexto). */
  canDelete?: boolean
}

export function SectionImagesTable({ idSection, canDelete = true }: SectionImagesTableProps = {}) {
  const router = useRouter()
  const {
    items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message,
    load, reset, setCurrentItem,
  } = useSectionImageListStore()
  const { toggleState, deleteItem, bulkToggleState, bulkDeleteItems } = useSectionImageDeleteStore()

  const [selected, setSelected]         = useState<Set<number>>(new Set())
  const [lightboxIdx, setLightboxIdx]   = useState(-1)
  const [search, setSearch]             = useState(filters.search ?? '')
  const [state, setState]               = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [dateFrom, setDateFrom]         = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]             = useState(filters.date_to ?? '')
  /** Filtro de sección de la página standalone `/section-images` (selector propio, independiente
   * del `idSection` de prop — ese ya viene fijo cuando la tabla está embebida en un tab). */
  const [sectionFilter, setSectionFilter] = useState<number | null>(null)
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching] = useState(false)

  const appliedSearch = useRef(search)

  // `id_section: idSection ?? undefined` explícito (no simplemente omitir la clave) — el store
  // de la lista es un singleton compartido: si antes se visitó el tab "Imágenes" de una sección
  // (que deja `id_section` fijado ahí), sin este reset explícito la página global heredaría
  // ese filtro sin que el usuario haya elegido nada.
  useEffect(() => { void load({ id_section: idSection ?? undefined }) }, [idSection])

  useEffect(() => { setSelected(new Set()) }, [items])

  // "Buscar" es texto libre: se espera a que el usuario deje de escribir (debounce) antes de
  // disparar la petición y encender la barra, para no parpadear en cada tecla.
  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({
        search,
        state: state === 'all' ? undefined : Number(state),
        date_from: dateFrom,
        date_to: dateTo,
        id_section: idSection ?? sectionFilter ?? undefined,
        page: 1,
      }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

  // Estado/Fecha/Sección son acciones discretas (un clic o una selección), no texto que se esté
  // escribiendo: se disparan de inmediato, sin esperar el debounce de "Buscar".
  const applyFilters = (overrides: { state?: string; dateFrom?: string; dateTo?: string; section?: number | null }) => {
    const nextState = overrides.state ?? state
    const nextDateFrom = overrides.dateFrom ?? dateFrom
    const nextDateTo = overrides.dateTo ?? dateTo
    const nextSection = overrides.section !== undefined ? overrides.section : sectionFilter
    setIsUserFetching(true)
    void load({
      search,
      state: nextState === 'all' ? undefined : Number(nextState),
      date_from: nextDateFrom,
      date_to: nextDateTo,
      id_section: idSection ?? nextSection ?? undefined,
      page: 1,
    }).finally(() => setIsUserFetching(false))
  }

  const handleStateChange = (value: string) => { setState(value); applyFilters({ state: value }) }
  const handleDateFromChange = (value: string) => { setDateFrom(value); applyFilters({ dateFrom: value }) }
  const handleDateToChange = (value: string) => { setDateTo(value); applyFilters({ dateTo: value }) }
  const handleSectionFilterChange = (value: number | null) => { setSectionFilter(value); applyFilters({ section: value }) }

  const resetFilters = () => {
    appliedSearch.current = ''
    setSearch(''); setState('all'); setDateFrom(''); setDateTo(''); setSectionFilter(null)
    setIsUserFetching(true)
    void load({ search: '', state: undefined, date_from: '', date_to: '', id_section: idSection ?? undefined, page: 1 }).finally(() => setIsUserFetching(false))
  }

  const toggleSelect = (item: SectionImage) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      return next
    })
  }

  const openLightbox = (item: SectionImage) => {
    const idx = items.filter((i) => i.imageUrl).findIndex((i) => i.id === item.id)
    if (idx >= 0) setLightboxIdx(idx)
  }

  const handleView = (item: SectionImage) => {
    setCurrentItem(item)
    NProgress.start()
    router.push(`/section-images/${item.id}`)
  }

  const handleEdit = (item: SectionImage) => {
    setCurrentItem(item)
    NProgress.start()
    router.push(`/section-images/edit/${item.id}`)
  }

  const handleToggleState = async (item: SectionImage) => {
    const isActive = item.stateValue === 1
    const newState = isActive ? 0 : 1
    const actionLabel = newState === 1 ? 'Activar' : 'Desactivar'
    const resultLabel = newState === 1 ? 'activado' : 'desactivado'
    const label = `${item.sectionName} — ${item.imageName}`
    await swalConfirmAction({
      title: `¿${actionLabel} este registro?`,
      text: label,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(item.id, newState)
        if (ok) {
          toastSuccess(`Registro ${resultLabel}`, label)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async (item: SectionImage) => {
    const label = `${item.sectionName} — ${item.imageName}`
    await swalDeleteConfirm(
      '¿Eliminar este registro?', 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(item.id)
        if (ok) {
          toastSuccess('Registro eliminado', label)
          close()
        } else {
          showError('No se pudo eliminar el registro.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    try {
      const ids = Array.from(selected)
      const ok = await bulkToggleState(ids, 1)
      if (ok) { toastSuccess('Activados', `${ids.length} registro(s) activado(s).`); setSelected(new Set()) }
      else toastError('Error', 'No se pudieron activar todos los registros.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    try {
      const ids = Array.from(selected)
      const ok = await bulkToggleState(ids, 0)
      if (ok) { toastSuccess('Desactivados', `${ids.length} registro(s) desactivado(s).`); setSelected(new Set()) }
      else toastError('Error', 'No se pudieron desactivar todos los registros.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDelete = async () => {
    const count = selected.size
    await swalDeleteConfirm(
      `¿Eliminar ${count} registro(s)?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ids = Array.from(selected)
        const ok = await bulkDeleteItems(ids)
        if (ok) {
          toastSuccess('Eliminados', `${count} registro(s) eliminado(s).`)
          setSelected(new Set())
          close()
        } else {
          showError('No se pudieron eliminar todos los registros.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  const currentPage = filters.page ?? 1
  const lastPage    = meta?.last_page ?? 1

  const lightboxSlides = items
    .filter((i) => i.imageUrl)
    .map((i) => ({ src: i.imageUrl, alt: i.imageName }))

  if (!hasLoaded && !isInitialLoading) {
    return (
      <CircleProgressIndicatorPage/>
    )
  }

  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title='Error al cargar registros'
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => {
          reset();
          void load({ id_section: idSection ?? undefined })
        }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

      <div className="flex flex-wrap items-end gap-2">
        {/* El filtro de sección solo tiene sentido en la página standalone `/section-images`
            — cuando la tabla está embebida en el tab "Imágenes" de una Section (prop `idSection`),
            ya está implícitamente filtrada a esa sección y este selector sería redundante. */}
        {idSection == null && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Sección</span>
            <div className="w-full sm:w-[220px]">
              <SectionSelect
                value={sectionFilter}
                onValueChange={handleSectionFilterChange}
                placeholder="Todas las secciones"
                showAll
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Buscar</span>
          <Input placeholder="Nombre de imagen o sección..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[220px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Estado</span>
          <Select value={state} disabled={isFetching} onValueChange={handleStateChange}>
            <SelectTrigger className="h-8 w-full sm:w-[155px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {ENTITY_STATES.map((s) => <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Fecha desde</span>
          <Input type="date" value={dateFrom} disabled={isFetching} onChange={(e) => handleDateFromChange(e.target.value)} className="h-8 w-full sm:w-[145px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Fecha hasta</span>
          <Input type="date" value={dateTo} disabled={isFetching} onChange={(e) => handleDateToChange(e.target.value)} className="h-8 w-full sm:w-[145px]" />
        </div>
        <div className="flex flex-col justify-end">
          <Button variant="ghost" size="sm" disabled={isFetching} onClick={resetFilters}>Limpiar</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
          <ImageIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay imágenes para mostrar.</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
          {items.map((item) => (
            <SectionImageCard
              key={item.id}
              item={item}
              hideSectionBadge={idSection != null}
              canDelete={canDelete}
              isSelected={selected.has(item.id)}
              onToggleSelect={toggleSelect}
              onOpenLightbox={openLightbox}
              onView={handleView}
              onEdit={handleEdit}
              onToggleState={(i) => void handleToggleState(i)}
              onDelete={(i) => void handleDelete(i)}
            />
          ))}
        </div>
      )}

      {hasLoaded && meta && (
        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {meta.from ?? 0} - {meta.to ?? 0} de {meta.total ?? 0} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm" variant="outline"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => { setIsUserFetching(true); void load({ page: currentPage - 1 }).finally(() => setIsUserFetching(false)) }}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {currentPage} de {lastPage}</span>
            <Button
              size="sm" variant="outline"
              disabled={currentPage >= lastPage || isFetching}
              onClick={() => { setIsUserFetching(true); void load({ page: currentPage + 1 }).finally(() => setIsUserFetching(false)) }}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <DataTableBulkActions
        selectedCount={selected.size}
        isLoading={isBulkLoading}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={canDelete ? handleBulkDelete : undefined}
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
