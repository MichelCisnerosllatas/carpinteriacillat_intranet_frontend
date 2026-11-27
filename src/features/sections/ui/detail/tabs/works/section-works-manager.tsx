'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AlertTriangle, ArrowUpDown, Eye, Hammer, ImageOff, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { cn } from '@/shared/lib/utils'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { getTypeWorkBadge, useWebWorkListStore, webWorksService, type WebWorkApiItem } from '@/features/web-works'
import { useSectionWorksStore } from '../../../../stores/useSectionWorksStore'
import type { SectionWorksConfig } from './section-works.config'
import { useCan } from '@/features/auth/hooks/usePermission'

/** Pares que la web puede mostrar: visibles y con foto Antes y Después. */
const countVisiblePairs = (work: WebWorkApiItem) =>
  (work.pairs ?? []).filter((p) => p.webworkpair_state === 1 && p.before?.url && p.after?.url).length

const countVisiblePhotos = (work: WebWorkApiItem) =>
  (work.images ?? []).filter((i) => i.webworkimage_state === 1).length

/** Portada, o la primera foto visible (mismo criterio que la web). */
const getThumbUrl = (work: WebWorkApiItem) =>
  work.cover?.url ?? (work.images ?? []).find((i) => i.webworkimage_state === 1 && i.url)?.url ?? null

export function SectionWorksManager({ config }: { config: SectionWorksConfig }) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  // Los trabajos son del módulo Galería → Trabajos: cada acción pide su permiso (ver ROLES_Y_PERMISOS.md)
  const canView = useCan('web_works.view')
  const canCreate = useCan('web_works.create')
  const canEdit = useCan('web_works.update')
  const canState = useCan('web_works.state')
  const canDelete = useCan('web_works.delete')
  const canReorder = useCan('web_works.reorder')

  // Datos en memoria (useSectionWorksStore): al volver a esta pestaña se ven al instante y se
  // refrescan por detrás, sin volver a mostrar la carga.
  const storeKey = config.typeworkKey ?? 'all'
  const entry = useSectionWorksStore((s) => s.lists[storeKey])
  const isFetching = useSectionWorksStore((s) => Boolean(s.listFetching[storeKey]))
  const isError = useSectionWorksStore((s) => Boolean(s.listError[storeKey]))
  const loadList = useSectionWorksStore((s) => s.loadList)
  // Barrita de "actualizando" solo cuando el usuario cambió algo (mostrar/ocultar/eliminar).
  const [isUserFetching, setIsUserFetching] = useState(false)

  const works = entry?.works ?? []
  const total = entry?.total ?? 0
  const isLoading = !entry && !isError

  const typeQuery = config.typeworkKey ? `?typework_key=${config.typeworkKey}` : ''

  // Al entrar a la pestaña: pide la versión nueva (en silencio si ya había datos)
  useEffect(() => { void loadList(config.typeworkKey) }, [config.typeworkKey, loadList])

  const reload = () => {
    // La lista de Galería → Trabajos también debe volver a pedir al entrar
    useWebWorkListStore.getState().setForceReload(true)
    setIsUserFetching(true)
    void loadList(config.typeworkKey).finally(() => setIsUserFetching(false))
  }

  const handleToggle = async (work: WebWorkApiItem, visible: boolean) => {
    await swalConfirmAction({
      title: visible ? '¿Mostrar este trabajo en la web?' : '¿Ocultar este trabajo de la web?',
      text: work.webwork_title,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: visible ? 'Mostrando...' : 'Ocultando...' },
      action: async ({ close, showError }) => {
        try {
          // PATCH solo con el estado: no toca fotos ni pares
          await webWorksService.patch(work.id_web_work, { webwork_state: visible ? 1 : 0 })
          toastSuccess(visible ? 'Trabajo visible' : 'Trabajo oculto', `"${work.webwork_title}"`)
          close()
          reload()
        } catch (e: any) {
          showError(e?.response?.data?.message ?? 'No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async (work: WebWorkApiItem) => {
    await swalDeleteConfirm(
      `¿Eliminar "${work.webwork_title}"?`,
      'Se borran también sus fotos de galería y pares Antes/Después (las imágenes siguen en el banco). Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        try {
          await webWorksService.delete(work.id_web_work)
          toastSuccess('Trabajo eliminado', `"${work.webwork_title}" fue eliminado.`)
          close()
          reload()
        } catch (e: any) {
          showError(e?.response?.data?.message ?? 'No se pudo eliminar el trabajo.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <div className="relative flex flex-col gap-3">
      <TableLoadingBar active={isUserFetching && isFetching} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Hammer className="size-4" />{config.title}
          {!isLoading && !isError && <span className="text-muted-foreground">({total})</span>}
        </h3>
        <div className="flex items-center gap-2">
          {works.length > 1 && canReorder && (
            <Button size="sm" variant="outline" onClick={() => goTo(`/web-works/reorder${typeQuery}`)}>
              <ArrowUpDown className="mr-1.5 size-4" />Reordenar
            </Button>
          )}
          {canCreate && (
            <Button size="sm" onClick={() => goTo(`/web-works/create${typeQuery}`)}>
              <Plus className="mr-1.5 size-4" />Nuevo trabajo
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {config.description}{' '}
        También puedes verlos en{' '}
        <Link href={`/web-works${typeQuery}`} className="underline underline-offset-2 hover:text-foreground">Galería → Trabajos</Link>.
      </p>

      {isLoading ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border">
          <p className="text-sm text-muted-foreground">No se pudieron cargar los trabajos.</p>
          <Button size="sm" variant="outline" disabled={isFetching} onClick={() => void loadList(config.typeworkKey)}>Reintentar</Button>
        </div>
      ) : works.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {config.emptyText}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {works.map((work, idx) => {
            const thumb = getThumbUrl(work)
            const visiblePairs = countVisiblePairs(work)
            const visiblePhotos = countVisiblePhotos(work)
            const isVisible = work.webwork_state === 1
            const hiddenOnWeb = config.requiresPairs && visiblePairs === 0
            return (
              <div key={work.id_web_work} className={cn('flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-sm', !isVisible && 'opacity-70')}>
                <span className="w-6 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{idx + 1}</span>
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                  {thumb ? <img src={thumb} alt={work.webwork_title} className="h-full w-full object-cover" /> : <ImageOff className="size-4 text-muted-foreground" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goTo(`/web-works/edit/${work.id_web_work}`)}
                      // Sin permiso de editar, el título no lleva al formulario
                      disabled={!canEdit}
                      className="truncate text-left text-sm font-medium hover:underline"
                    >
                      {work.webwork_title}
                    </button>
                    {config.showTypeBadge && work.type && (
                      <Badge variant="outline" className={cn('text-xs', getTypeWorkBadge(work.type.typework_key))}>{work.type.typework_name}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {work.category && <span>{work.category.category_name}</span>}
                    <span>{visiblePhotos} foto{visiblePhotos !== 1 ? 's' : ''}</span>
                    {(config.requiresPairs || visiblePairs > 0) && (
                      <span>{visiblePairs} par{visiblePairs !== 1 ? 'es' : ''} Antes/Después</span>
                    )}
                    {hiddenOnWeb && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="size-3.5" />Sin pares visibles: no se muestra en la web
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <VisibilityToggle checked={isVisible} onCheckedChange={(v) => void handleToggle(work, v)} disabled={!canState} />
                </div>
                {(canView || canEdit || canDelete) && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex h-8 w-8 shrink-0 p-0 data-[state=open]:bg-muted">
                      <DotsHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {canView && (
                      <DropdownMenuItem onClick={() => goTo(`/web-works/${work.id_web_work}`)}>
                        Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                    {canEdit && (
                      <DropdownMenuItem onClick={() => goTo(`/web-works/edit/${work.id_web_work}`)}>
                        Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        {(canView || canEdit) && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={() => void handleDelete(work)} className="text-red-500!">
                          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                )}
              </div>
            )
          })}
          {total > works.length && (
            <p className="text-xs text-muted-foreground">
              Se muestran los primeros {works.length} de {total}.{' '}
              <Link href={`/web-works${typeQuery}`} className="underline underline-offset-2 hover:text-foreground">Ver todos</Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
