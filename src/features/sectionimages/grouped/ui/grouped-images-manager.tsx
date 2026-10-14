'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Pestaña Imágenes del detalle: un acordeón por item (servicio / categoría) con sus fotos y acciones.
// Los textos y la regla "sin fotos visibles = oculto" salen de `config` (ver grouped-section.config.ts).
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ImageOff } from 'lucide-react'
import { Accordion } from '@/shared/ui/accordion'
import { cn, formatDatetime } from '@/shared/lib/utils'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'
import { useSectionItemFormStore } from '@/features/section-items/stores/useSectionItemFormStore'
import { useSectionItemDeleteStore } from '@/features/section-items/stores/useSectionItemDeleteStore'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import { useSectionImageListStore } from '../../stores/useSectionImageListStore'
import { useSectionImageDeleteStore } from '../../stores/useSectionImageDeleteStore'
import type { SectionImage } from '../../data/schema'
import { getImageRoles, sortByOrder } from '../../lib/image-roles'
import { usePhotoLightbox } from '../../lib/use-photo-lightbox'
import { SectionImageLightbox } from '../../ui/list/section-image-lightbox'
import { getGroupItemName, getPhotoVariantLabel, type GroupedSectionConfig } from '../grouped-section.config'
import { useGroupItems } from '../lib/use-group-items'
import { useGroupItemActions } from '../lib/use-group-item-actions'
import {
  describeServiceChanges, getServiceStateChanges, photosWithout, photosWithState, type ServiceStateChange,
} from '../lib/sync-service-visibility'
import { usePhotoSelection } from '../lib/use-photo-selection'
import { useGroupedPhotoVisibility } from '../lib/use-grouped-photo-visibility'
import { GroupedPhotoCard, type GroupedPhotoActions } from './grouped-photo-card'
import { GroupedItemAccordion } from './grouped-item-accordion'
import { GroupedPhotoRow } from './grouped-photo-row'
import { GroupedAddItem } from './grouped-add-item'
import { useGroupedAutoPhotos } from './auto-photos/use-grouped-auto-photos'

interface GroupedImagesManagerProps {
  /** Textos y reglas de la sección (GROUPED_SECTION_CONFIG[typesectionKey]). */
  config: GroupedSectionConfig
  idSection: number
  canDelete?: boolean
}

// Se traen todas las fotos de la sección (para agrupar y calcular roles)
const PER_PAGE = 100

/**
 * Pestaña "Imágenes" de una sección agrupada: un acordeón por item con sus fotos.
 * Las fotos se agregan con el botón "Agregar imagen" de arriba (en el formulario se elige el item).
 * Aquí NO se arrastra: el orden se cambia en la pantalla "Reordenar".
 * Se pueden marcar varias fotos (checkbox) para Ocultar / Mostrar / Eliminar juntas.
 * Al ocultar o mostrar, las fotos se mueven (ocultas al final de su item) y se guarda el orden.
 */
export function GroupedImagesManager({ config, idSection, canDelete = true }: GroupedImagesManagerProps) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  // Fotos (store compartido con /section-images y la vista de siempre)
  const { items, hasLoaded, isFetching, isError, message, load, reset, setCurrentItem } = useSectionImageListStore()
  const { deleteItem: deletePhoto, bulkDeleteItems: deletePhotos } = useSectionImageDeleteStore()

  // Items de la sección (servicios / categorías) — los stores de section-items también refrescan la pestaña "Items"
  const { items: groupItems, hasLoaded: itemsLoaded, reload: reloadItems } = useGroupItems(idSection)
  const { handleRename, handleToggleVisible, applyServiceStateChanges } = useGroupItemActions(config, reloadItems)
  const createItem = useSectionItemFormStore((s) => s.create)
  const deleteItem = useSectionItemDeleteStore((s) => s.deleteItem)
  const getName = (item: SectionItemApiItem) => getGroupItemName(config, item)

  // Visor de fotos en grande
  const lightbox = usePhotoLightbox()

  // Fotos marcadas con el checkbox (acciones masivas)
  const selection = usePhotoSelection()
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Acordeones abiertos (ids de item como texto)
  const [openIds, setOpenIds] = useState<string[]>([])
  const openedOnce = useRef(false)

  // Carga las fotos de esta sección, sin filtros
  const loadPhotos = () => load({ id_section: idSection, per_page: PER_PAGE, page: 1, search: '', state: undefined, date_from: '', date_to: '' })
  useEffect(() => { void loadPhotos() }, [idSection])

  // Ocultar / Mostrar (una o varias) + guardar el orden "ocultas al final"
  const { changeState, isSaving } = useGroupedPhotoVisibility(config, idSection, loadPhotos)

  // Carrusel / Restauración: fotos que la web usa sola si el item no tiene propias (config.autoPhotos)
  const autoPhotos = useGroupedAutoPhotos({ config, idSection, onOpenSlides: lightbox.openSlides, onReload: loadPhotos })

  // La primera vez que llegan los items, todos quedan abiertos
  useEffect(() => {
    if (openedOnce.current || groupItems.length === 0) return
    openedOnce.current = true
    setOpenIds(groupItems.map((s) => String(s.id_section_item)))
  }, [groupItems])

  // Fotos de esta sección, en el orden del servidor
  const photos = useMemo(() => sortByOrder(items.filter((i) => i.idSection === idSection)), [items, idSection])

  // Rol de cada foto: en esta sección todas las fotos deberían tener item
  const roles = useMemo(() => getImageRoles(photos, () => true), [photos])

  // Fotos de cada item y las que no tienen (o cuyo item ya no existe)
  const itemIds = groupItems.map((s) => s.id_section_item)
  const photosOf = (idItem: number) => photos.filter((p) => p.idSectionItem === idItem)
  const unassigned = photos.filter((p) => p.idSectionItem == null || !itemIds.includes(p.idSectionItem))

  // Fotos marcadas (solo las que siguen existiendo) y qué botones de la barra se pueden usar
  const selectedPhotos = photos.filter((p) => selection.isSelected(p.id))
  const canHideSelected = selectedPhotos.some((p) => p.stateValue === 1)
  const canShowSelected = selectedPhotos.some((p) => p.stateValue !== 1)

  /**
   * Regla SOLO del hero de Servicios (config.hideItemWithoutVisiblePhotos):
   * qué servicios se ocultan/muestran después de la acción y el texto para avisarlo.
   * En las demás secciones agrupadas no cambia ningún item (lista vacía, sin texto extra).
   */
  const getItemChanges = (photosAfter: SectionImage[], affectedIds: number[]): { changes: ServiceStateChange[]; extra: string } => {
    if (!config.hideItemWithoutVisiblePhotos) return { changes: [], extra: '' }
    const changes = getServiceStateChanges(groupItems, photos, photosAfter, affectedIds)
    return { changes, extra: describeServiceChanges(changes, getName) }
  }

  // ── "Editar" del menú ⋮ de un item (ver config.itemMenuEdit) ──
  //  - 'item'   → formulario del item (hero: descripción y botón; carrusel: categoría).
  //  - 'photos' → formulario de FOTOS del item (Restauración: par Antes/Después).
  //    Si ya tiene fotos se abre el editar (carga el par desde cualquiera de ellas);
  //    si no tiene, se abre el agregar con la sección y el trabajo ya elegidos.
  const handleEditItem = (item: SectionItemApiItem, itemPhotos: SectionImage[]) => {
    if (config.itemMenuEdit === 'item') {
      goTo(`/section-items/edit/${item.id_section_item}`)
      return
    }
    const firstPhoto = itemPhotos[0]
    if (firstPhoto) {
      setCurrentItem(firstPhoto)
      goTo(`/section-images/edit/${firstPhoto.id}`)
    } else {
      goTo(`/section-images/create?id_section=${idSection}&id_section_item=${item.id_section_item}`)
    }
  }

  // Abre el formulario de una foto (editar)
  const editPhoto = (image: SectionImage) => { setCurrentItem(image); goTo(`/section-images/edit/${image.id}`) }

  // ── Acciones de cada foto ──
  const photoActions: GroupedPhotoActions = {
    onView: (image) => { setCurrentItem(image); goTo(`/section-images/${image.id}`) },
    // Restauración (photoMenuEdit false): sin "Editar" por foto; se edita el par desde el menú del trabajo
    onEdit: config.photoMenuEdit ? editPhoto : undefined,
    // Misma regla que la barra: al ocultar pasa al final de su item, al mostrar al final de las visibles
    // Pide confirmación antes, igual que los demás módulos (*-row-actions)
    onToggleState: async (image) => {
      const newState = image.stateValue === 1 ? 0 : 1
      await confirmStateChange([image.id], newState)
    },
    onDelete: async (image: SectionImage) => {
      // Hero: si era la última foto visible del servicio, el servicio también se oculta
      const { changes, extra } = getItemChanges(photosWithout(photos, [image.id]), [image.id])

      await swalDeleteConfirm(
        '¿Eliminar esta foto?', `Esta acción no se puede deshacer. ${extra}`.trim(),
        async ({ close, showError }) => {
          const ok = await deletePhoto(image.id)
          if (ok) {
            toastSuccess('Foto eliminada')
            close()
            await applyServiceStateChanges(changes)
          } else {
            showError('No se pudo eliminar la foto.')
          }
        },
        { title: 'Eliminando...' }
      )
    },
  }

  // ── Ocultar / Mostrar con confirmación ──
  // Se usa para una foto (menú ⋮) y para las marcadas (barra). Siempre pregunta antes,
  // como el resto de módulos. Al ocultar, las fotos pasan al final de su item; al
  // mostrar, al final de las visibles (eso lo hace changeState).
  const confirmStateChange = async (ids: number[], newState: number) => {
    const count = ids.length
    const isHide = newState === 0
    const what = count === 1 ? 'esta foto' : `${count} fotos`

    // Hero: ¿algún servicio se queda sin fotos visibles (se oculta) o vuelve a tener (se muestra)?
    // Se calcula ANTES para avisarlo en la misma pregunta.
    const { changes, extra } = getItemChanges(photosWithState(photos, ids, newState), ids)
    const baseText = isHide
      ? `No se verán en la web y pasarán al final de su ${config.itemLower}.`
      : `Se verán en la web, después de las fotos visibles de su ${config.itemLower}.`

    await swalConfirmAction({
      title: isHide ? `¿Ocultar ${what}?` : `¿Mostrar ${what}?`,
      text: `${baseText} ${extra}`.trim(),
      confirmText: isHide ? 'Sí, ocultar' : 'Sí, mostrar',
      loading: { title: isHide ? 'Ocultando...' : 'Mostrando...' },
      action: async ({ close, showError }) => {
        const ok = await changeState(photos, itemIds, ids, newState)
        if (ok) {
          selection.clear()
          close()
          // Después de las fotos, el servicio (si quedó sin fotos visibles o volvió a tener)
          await applyServiceStateChanges(changes)
        } else {
          showError('No se pudo completar la acción.')
        }
      },
    })
  }

  // ── Acciones de la barra (fotos marcadas) ──
  const handleBulkState = (newState: number) =>
    confirmStateChange(selectedPhotos.map((p) => p.id), newState)

  const handleBulkDelete = async () => {
    const count = selectedPhotos.length
    const ids = selectedPhotos.map((p) => p.id)
    // Hero: si algún servicio se queda sin fotos visibles, también se oculta
    const { changes, extra } = getItemChanges(photosWithout(photos, ids), ids)

    await swalDeleteConfirm(
      `¿Eliminar ${count} foto(s)?`, `Esta acción no se puede deshacer. ${extra}`.trim(),
      async ({ close, showError }) => {
        setIsBulkDeleting(true)
        const ok = await deletePhotos(ids)
        setIsBulkDeleting(false)
        if (ok) {
          toastSuccess('Fotos eliminadas', `${count} foto(s) eliminada(s).`)
          selection.clear()
          close()
          await applyServiceStateChanges(changes)
        } else {
          await loadPhotos()
          showError('No se pudieron eliminar todas las fotos.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  // ── Acciones de cada item (renombrar y Visible/Oculto vienen de useGroupItemActions) ──
  const handleDeleteItem = async (item: SectionItemApiItem) => {
    const name = getName(item)
    const itemPhotos = photosOf(item.id_section_item)
    const text = itemPhotos.length > 0
      ? `También se eliminarán sus ${itemPhotos.length} foto(s). Esta acción no se puede deshacer.`
      : 'Esta acción no se puede deshacer.'

    await swalDeleteConfirm(
      `¿Eliminar ${config.theItem} "${name}"?`, text,
      async ({ close, showError }) => {
        // 1) Primero sus fotos, para que no queden sueltas
        if (itemPhotos.length > 0) {
          const okPhotos = await deletePhotos(itemPhotos.map((p) => p.id))
          if (!okPhotos) { showError(`No se pudieron eliminar las fotos ${config.ofTheItem}.`); return }
        }
        // 2) Luego el item
        const ok = await deleteItem(item.id_section_item)
        if (!ok) { showError(`No se pudo eliminar ${config.theItem}.`); return }
        await Promise.all([reloadItems(), loadPhotos()])
        toastSuccess(config.deletedToast, name)
        close()
      },
      { title: 'Eliminando...' }
    )
  }

  // Modo 'inline' (hero): crea el item con el nombre escrito
  const handleCreateItem = async (title: string) => {
    const before = new Set(itemIds)
    const ok = await createItem({
      id_section: idSection,
      sectionitem_type: config.itemType,
      sectionitem_title: title,
      // Hero: nace OCULTO (aún no tiene fotos). Se muestra solo cuando se le agrega/muestra una foto
      // (ver lib/sync-service-visibility.ts y lib/show-service-if-hidden.ts).
      sectionitem_state: config.hideItemWithoutVisiblePhotos ? 0 : 1,
      sectionitem_created_at: formatDatetime(),
    })
    if (!ok) {
      toastError('Error', useSectionItemFormStore.getState().error ?? `No se pudo crear ${config.theItem}.`)
      return false
    }
    // Recarga y abre el acordeón del item nuevo
    const fresh = await reloadItems()
    const created = fresh.find((s) => !before.has(s.id_section_item))
    if (created) setOpenIds((prev) => [...prev, String(created.id_section_item)])
    toastSuccess(
      `${config.itemLabel} creado`,
      config.hideItemWithoutVisiblePhotos ? `«${title}» se mostrará en la web cuando le agregues fotos.` : `«${title}»`,
    )
    return true
  }

  // ── Estados de carga / error ──
  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title="Error al cargar las fotos"
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { reset(); void loadPhotos() }}
      />
    )
  }

  if (!hasLoaded || !itemsLoaded) return <CircleProgressIndicatorPage />

  return (
    // La barra flota abajo (igual que en los demás módulos): se deja espacio para que no
    // tape la última fila de fotos mientras hay fotos marcadas.
    <div className={cn('flex flex-col gap-3', selection.isActive && 'pb-20')}>
      {/* Misma barra de acciones masivas que el resto del intranet. Un botón que no aplica
          (ej. "Activar" cuando todas ya están visibles) no se muestra. */}
      <DataTableBulkActions
        selectedCount={selectedPhotos.length}
        isLoading={isSaving || isBulkDeleting}
        onActivate={canShowSelected ? () => handleBulkState(1) : undefined}
        onDeactivate={canHideSelected ? () => handleBulkState(0) : undefined}
        onDelete={canDelete ? handleBulkDelete : undefined}
        onClear={selection.clear}
      />

      {groupItems.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          {config.emptyItemsText}
        </p>
      ) : (
        <Accordion type="multiple" value={openIds} onValueChange={setOpenIds} className="flex flex-col gap-3">
          {groupItems.map((item, index) => {
            const itemPhotos = photosOf(item.id_section_item)
            const auto = autoPhotos.forItem(item, itemPhotos)
            return (
              <GroupedItemAccordion
                key={item.id_section_item}
                config={config}
                item={item}
                index={index}
                photos={itemPhotos}
                roles={roles}
                canDeletePhotos={canDelete}
                photoActions={photoActions}
                selection={selection}
                // El visor muestra solo las fotos de este item
                onOpenPhoto={(image) => lightbox.open(itemPhotos, image)}
                onRename={(title) => handleRename(item, title)}
                onToggleVisible={(visible) => handleToggleVisible(item, visible)}
                onEditDetails={() => handleEditItem(item, itemPhotos)}
                onDelete={() => void handleDeleteItem(item)}
                autoPhotos={auto.block}
                counterOverride={auto.counter}
              />
            )
          })}
        </Accordion>
      )}

      {/* Fotos sin item: no salen en la web */}
      {unassigned.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold"><ImageOff className="size-4" />{config.unassignedTitle}</h4>
            <p className="text-xs text-muted-foreground">{config.unassignedHelp} {config.unassignedAssignHint}</p>
          </div>
          <GroupedPhotoRow count={unassigned.length}>
            {unassigned.map((photo) => (
              <GroupedPhotoCard
                key={photo.id}
                image={photo}
                // Solo se marca si está oculta; sin item no tiene rol en la web
                role={roles[photo.id]?.kind === 'hidden' ? roles[photo.id] : null}
                onOpen={(image) => lightbox.open(unassigned, image)}
                // Fotos sueltas: SIEMPRE con "Editar" (es la forma de asignarlas a un item),
                // aunque la sección no tenga "Editar" por foto (Restauración).
                actions={{ ...photoActions, onEdit: editPhoto }}
                canDelete={canDelete}
                selected={selection.isSelected(photo.id)}
                selectionActive={selection.isActive}
                onSelectChange={(checked) => selection.toggle(photo.id, checked)}
                variantLabel={getPhotoVariantLabel(config, photo)}
              />
            ))}
          </GroupedPhotoRow>
        </div>
      )}

      <GroupedAddItem
        config={config}
        onCreate={handleCreateItem}
        // Modo 'form' (carrusel): el formulario de item con la sección ya elegida
        onOpenForm={() => goTo(`/section-items/create?id_section=${idSection}`)}
      />

      <SectionImageLightbox slides={lightbox.slides} index={lightbox.index} onClose={lightbox.close} />
    </div>
  )
}
