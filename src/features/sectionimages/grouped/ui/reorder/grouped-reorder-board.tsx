'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Pantalla Reordenar: acordeón por item con fotos arrastrables y "Confirmar orden".
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import { ImageOff, LoaderCircle, MousePointerClick } from 'lucide-react'
import { Accordion } from '@/shared/ui/accordion'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import { useSectionImageReorderStore } from '../../../stores/useSectionImageReorderStore'
import type { SectionImage } from '../../../data/schema'
import { getImageRoles, sortByOrder } from '../../../lib/image-roles'
import { useReorderImages } from '../../../lib/use-reorder-images'
import { usePhotoLightbox } from '../../../lib/use-photo-lightbox'
import { SectionImageLightbox } from '../../../ui/list/section-image-lightbox'
import { getPhotoVariantLabel, type GroupedSectionConfig } from '../../grouped-section.config'
import { useGroupItems } from '../../lib/use-group-items'
import { useGroupItemActions } from '../../lib/use-group-item-actions'
import { GroupedPhotoRow } from '../grouped-photo-row'
import { GroupedReorderItem } from './grouped-reorder-item'
import { SortableGroupedPhotoCard } from './sortable-grouped-photo-card'
import { useGroupedAutoPhotos } from '../auto-photos/use-grouped-auto-photos'

/** Un grupo de fotos: las de un item, o las que no tienen item (item = null). */
type PhotoGroup = {
  key: string
  item: SectionItemApiItem | null
  photos: SectionImage[]
}

interface GroupedReorderBoardProps {
  /** Textos y reglas de la sección (GROUPED_SECTION_CONFIG[typesectionKey]). */
  config: GroupedSectionConfig
  idSection: number
}

/**
 * Pantalla "Reordenar" de una sección agrupada:
 * el mismo acordeón por item del detalle, con las fotos arrastrables dentro de su item.
 * Nada se guarda al soltar: se guarda con "Confirmar orden".
 */
export function GroupedReorderBoard({ config, idSection }: GroupedReorderBoardProps) {
  const router = useRouter()
  const { isSubmitting, confirm } = useSectionImageReorderStore()

  // Fotos con su orden local (se cambia al soltar) y si hubo cambios
  const { images, isLoading, isError, hasChanges, moveInGroup, reload } = useReorderImages(idSection)

  // Items (activos e inactivos) y sus acciones del encabezado
  const { items, hasLoaded: itemsLoaded, reload: reloadItems } = useGroupItems(idSection)
  const { handleRename, handleToggleVisible } = useGroupItemActions(config, reloadItems)

  // Visor de fotos en grande
  const lightbox = usePhotoLightbox()

  // Carrusel / Restauración: fotos que la web usa sola si el item no tiene propias (no se arrastran).
  // "Personalizar fotos" recarga las fotos: si hay cambios sin confirmar, se avisa que se pierden.
  const autoPhotos = useGroupedAutoPhotos({
    config,
    idSection,
    onOpenSlides: lightbox.openSlides,
    onReload: reload,
    personalizeExtraText: hasChanges ? 'Se perderá el orden que aún no confirmaste.' : '',
  })

  // Acordeones abiertos: la primera vez, todos
  const [openIds, setOpenIds] = useState<string[]>([])
  const openedOnce = useRef(false)
  useEffect(() => {
    if (openedOnce.current || items.length === 0) return
    openedOnce.current = true
    setOpenIds(items.map((s) => String(s.id_section_item)))
  }, [items])

  // Sensores del arrastre:
  // - MouseSensor con distancia (un clic simple no arrastra).
  // - TouchSensor: mantener presionado ~¼ s; si el dedo se desliza antes, es scroll normal.
  // - KeyboardSensor: ordenar con teclado (Espacio + flechas).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Fotos en el orden que se ve AHORA
  const photos = useMemo(() => sortByOrder(images), [images])

  // Rol de cada foto (Principal ★ / Oculta): se recalcula al soltar
  const roles = useMemo(() => getImageRoles(photos, () => true), [photos])

  // Grupos: un item tras otro y, al final, las fotos sin item (o cuyo item ya no existe)
  const groups = useMemo<PhotoGroup[]>(() => {
    const itemIds = items.map((s) => s.id_section_item)
    const list: PhotoGroup[] = items.map((item) => ({
      key: `item-${item.id_section_item}`,
      item,
      photos: photos.filter((p) => p.idSectionItem === item.id_section_item),
    }))
    const unassigned = photos.filter((p) => p.idSectionItem == null || !itemIds.includes(p.idSectionItem))
    if (unassigned.length > 0) list.push({ key: 'none', item: null, photos: unassigned })
    return list
  }, [items, photos])

  const unassignedGroup = groups.find((g) => g.item === null)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    // Solo dentro del mismo item: si se suelta en otro, se ignora
    const groupKey = active.data.current?.groupKey
    if (groupKey !== over.data.current?.groupKey) return
    const group = groups.find((g) => g.key === groupKey)
    if (group) moveInGroup(group.photos, Number(active.id), Number(over.id))
  }

  const handleConfirm = async () => {
    const confirmed = await swalConfirm({
      title: '¿Confirmar nuevo orden?',
      text: `Se actualizará el orden de ${images.length} imagen(es).`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    // Orden completo de la sección: los grupos uno tras otro, tal como se ven en pantalla
    const ids = groups.flatMap((g) => g.photos.map((p) => p.id))
    const ok = await confirm(idSection, ids)
    if (ok) {
      toastSuccess('Orden actualizado', 'El nuevo orden se guardó correctamente.')
      goBackOrFallback(router, '/section-images')
    } else {
      toastError('Error', 'No se pudo actualizar el orden.')
    }
  }

  if (isLoading || !itemsLoaded) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando imágenes de sección...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar imágenes de sección</p>
        <Button size="sm" variant="outline" onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MousePointerClick className="mt-0.5 size-4 shrink-0" />
            <span>
              Arrastra cada foto desde su asa ⋮⋮ (en celular, mantenla presionada) para cambiar el orden dentro
              de su {config.itemLower}. Toca una foto para verla en grande. Nada se guarda hasta que confirmes.
              La 1ª foto visible de cada {config.itemLower} es la principal.
            </span>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 && photos.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay imágenes para reordenar en esta sección.
        </div>
      ) : (
        // Un solo DndContext; cada item tiene su propio SortableContext
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-3">
            {items.length > 0 && (
              <Accordion type="multiple" value={openIds} onValueChange={setOpenIds} className="flex flex-col gap-3">
                {groups.map((group, index) => {
                  const item = group.item
                  if (!item) return null // el grupo "sin item" va aparte, abajo
                  const auto = autoPhotos.forItem(item, group.photos)
                  return (
                    <GroupedReorderItem
                      key={group.key}
                      config={config}
                      item={item}
                      index={index}
                      photos={group.photos}
                      roles={roles}
                      groupKey={group.key}
                      // El visor muestra solo las fotos de este item
                      onOpenPhoto={(image) => lightbox.open(group.photos, image)}
                      onRename={(title) => handleRename(item, title)}
                      onToggleVisible={(visible) => handleToggleVisible(item, visible)}
                      autoPhotos={auto.block}
                      counterOverride={auto.counter}
                    />
                  )
                })}
              </Accordion>
            )}

            {/* Fotos sin item: también se ordenan entre ellas */}
            {unassignedGroup && (
              <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold"><ImageOff className="size-4" />{config.unassignedTitle}</h4>
                  <p className="text-xs text-muted-foreground">{config.unassignedHelp}</p>
                </div>
                <SortableContext items={unassignedGroup.photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                  <GroupedPhotoRow count={unassignedGroup.photos.length}>
                    {unassignedGroup.photos.map((photo) => (
                      <SortableGroupedPhotoCard
                        key={photo.id}
                        image={photo}
                        // Solo se marca si está oculta; sin item no tiene rol en la web
                        role={roles[photo.id]?.kind === 'hidden' ? roles[photo.id] : null}
                        groupKey={unassignedGroup.key}
                        onOpen={(image) => lightbox.open(unassignedGroup.photos, image)}
                        variantLabel={getPhotoVariantLabel(config, photo)}
                      />
                    ))}
                  </GroupedPhotoRow>
                </SortableContext>
              </div>
            )}
          </div>
        </DndContext>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/section-images')} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="button" disabled={!hasChanges || isSubmitting} onClick={handleConfirm} className="min-w-36">
          {isSubmitting
            ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Guardando...</>
            : 'Confirmar orden'}
        </Button>
      </div>

      <SectionImageLightbox slides={lightbox.slides} index={lightbox.index} onClose={lightbox.close} />
    </div>
  )
}
