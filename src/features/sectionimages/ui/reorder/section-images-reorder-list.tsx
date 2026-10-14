'use client'

import { useMemo } from 'react'
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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { LoaderCircle, MousePointerClick } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { useSectionImageReorderStore } from '../../stores/useSectionImageReorderStore'
import { getImageRoles } from '../../lib/image-roles'
import { groupSectionImages, type ImageItemGroup } from '../../lib/group-section-images'
import { useSectionItemsMap } from '../../lib/use-section-items-map'
import { useReorderImages } from '../../lib/use-reorder-images'
import { useSectionTypeKey } from '../../lib/use-section-type-key'
import { SectionImagesReorderGroup } from './section-images-reorder-group'
// Pantallas propias de las secciones especiales (todo lo exclusivo vive en ../../grouped)
import { GroupedReorderBoard, getGroupedSectionConfig } from '../../grouped'

/**
 * Pantalla "Reordenar" de las fotos de UNA sección (`idSection` requerido).
 * - Secciones especiales (hero de Servicios, carrusel de categorías — ver `getGroupedSectionConfig`):
 *   acordeón por item con tarjetas arrastrables.
 * - Cualquier otra sección: la lista de siempre (filas agrupadas por item).
 */
export function SectionImagesReorderList({ idSection }: { idSection: number }) {
  const { typeKey, hasLoaded } = useSectionTypeKey(idSection)

  if (!hasLoaded) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando imágenes de sección...</p>
      </div>
    )
  }

  // Secciones especiales: hero de Servicios y carrusel de categorías (ver features/sectionimages/grouped)
  const groupedConfig = getGroupedSectionConfig(typeKey)
  if (groupedConfig) return <GroupedReorderBoard config={groupedConfig} idSection={idSection} />

  // Resto de secciones: vista general
  return <SectionImagesReorderDefault idSection={idSection} />
}

/**
 * Lista de siempre: las fotos se muestran agrupadas por item ("01 · Título", ..., "Sin item asignado")
 * y solo se pueden ordenar dentro de su grupo. Nada se guarda hasta confirmar.
 */
function SectionImagesReorderDefault({ idSection }: { idSection: number }) {
  const router = useRouter()
  const { isSubmitting, confirm } = useSectionImageReorderStore()

  // Fotos con su orden local (`order` = posición en pantalla), si hubo cambios y cómo mover dentro de un grupo
  const { images, isLoading, isError, hasChanges, moveInGroup } = useReorderImages(idSection)

  // Sensores del arrastre (igual que la vista agrupada):
  // - MouseSensor (no PointerSensor): el PointerSensor también toma el dedo y bloquea el scroll en celular.
  // - TouchSensor: hay que mantener presionado ~¼ s; si el dedo se desliza antes, es scroll normal.
  // - KeyboardSensor: ordenar con teclado (Espacio + flechas).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Items de la sección, para los encabezados "01 · Título"
  const itemsMap = useSectionItemsMap([idSection])

  // Grupos por item (reutiliza el mismo agrupado que la vista agrupada)
  const section = useMemo(
    () => groupSectionImages(images, itemsMap, false, [idSection])[0],
    [images, itemsMap, idSection],
  )
  const groups = section?.groups ?? []
  const hasItems = section?.hasItems ?? false

  // Rol de cada foto según el orden que se ve AHORA (cambia al soltar o al usar las flechas)
  const roles = useMemo(() => getImageRoles(images, () => hasItems), [images, hasItems])

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    // Solo se ordena dentro del mismo grupo: si se suelta en otro, se ignora
    const groupKey = active.data.current?.groupKey
    if (groupKey !== over.data.current?.groupKey) return
    const group = groups.find((g) => g.key === groupKey)
    if (group) moveInGroup(group.images, Number(active.id), Number(over.id))
  }

  // Flechas subir/bajar: alternativa al arrastre que siempre funciona
  const handleMove = (group: ImageItemGroup, id: number, direction: -1 | 1) => {
    const idx = group.images.findIndex((img) => img.id === id)
    const target = group.images[idx + direction]
    if (idx < 0 || !target) return
    moveInGroup(group.images, id, target.id)
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
    const ids = groups.flatMap((g) => g.images.map((img) => img.id))
    const ok = await confirm(idSection, ids)
    if (ok) {
      toastSuccess('Orden actualizado', 'El nuevo orden se guardó correctamente.')
      goBackOrFallback(router, '/section-images')
    } else {
      toastError('Error', 'No se pudo actualizar el orden.')
    }
  }

  if (isLoading) {
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
              Arrastra desde el asa ⋮⋮ (en celular, mantenla presionada) o usa las flechas para cambiar el orden
              dentro de cada item. Nada se guarda hasta que confirmes. La 1ª foto visible de cada item es la
              principal.
            </span>
          </div>
        </CardContent>
      </Card>

      {images.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay imágenes para reordenar en esta sección.
        </div>
      ) : (
        // Un solo DndContext; cada grupo tiene su propio SortableContext
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              // Con items, cada grupo va en su propio recuadro
              <div key={group.key} className={cn(hasItems && 'rounded-xl border bg-muted/30 p-3 sm:p-4')}>
                <SectionImagesReorderGroup group={group} roles={roles} onMove={handleMove} />
              </div>
            ))}
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
    </div>
  )
}
