'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { LoaderCircle, Quote } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { testimonyService } from '../../../services/testimony.service'
import { useTestimonyReorderStore } from '../../../stores/useTestimonyReorderStore'
import { useTestimonySectionStore } from '../../../stores/useTestimonySectionStore'
import { useTestimonyWebSettingStore } from '../../../stores/useTestimonyWebSettingStore'
import { useCan } from '@/features/auth/hooks/usePermission'
import type { ReorderItem } from './types'
import { SortableRow } from './sortable-row'

/**
 * En la práctica existe una única sección de testimonios en todo el sitio (`useTestimonySectionStore`
 * la resuelve por su tipo, sin que el usuario tenga que elegirla) — así que esta pantalla es una
 * lista plana con un único `<DndContext>`, sin nivel de agrupación ni selector de sección.
 */
export function TestimonyReorderList() {
  const router = useRouter()
  const canReorder = useCan('testimonies.reorder')
  const { isSubmitting, confirm } = useTestimonyReorderStore()
  const { idSection, isError: isSectionError, error: sectionError, get: getSection } = useTestimonySectionStore()
  const { setting, get: getSetting } = useTestimonyWebSettingStore()
  const testimonyLimit = setting?.testimony_limit ?? null

  const [items, setItems]                 = useState<ReorderItem[]>([])
  const [originalItems, setOriginalItems] = useState<ReorderItem[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [isError, setIsError]             = useState(false)

  // PointerSensor cubre mouse; TouchSensor aparte con activación por demora (en vez de
  // distancia) para que intentar hacer scroll no dispare un arrastre por error en touch;
  // KeyboardSensor para reordenar con flechas sin necesidad de arrastrar.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => { void getSection() }, [])
  useEffect(() => { void getSetting() }, [])

  useEffect(() => {
    if (idSection === null) return
    let cancelled = false
    testimonyService.getList({ id_section: idSection, per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setIsError(true); return }

        const built: ReorderItem[] = [...res.data]
          .sort((a, b) => (a.testimony_order ?? 0) - (b.testimony_order ?? 0))
          .map((t) => ({ id: t.id_testimony_web, name: t.testimony_name, stateValue: t.testimony_state }))

        setItems(built)
        setOriginalItems([...built])
      })
      .catch(() => { if (!cancelled) setIsError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [idSection])

  const hasChanges = items.some((item, idx) => item.id !== originalItems[idx]?.id)

  // El sitio público solo toma los primeros `testimony_limit` testimonios ACTIVOS según este
  // mismo orden (ver WebSiteSectionResource::testimonies en el backend) — los inactivos no
  // consumen cupo, así que pueden quedar "de por medio" sin correr a los activos que sí caben.
  // Sin límite configurado, todos los activos se muestran.
  const isVisibleOnWeb = (idx: number) => {
    if (items[idx].stateValue !== 1) return false
    if (testimonyLimit == null) return true
    let activeCount = 0
    for (let i = 0; i <= idx; i++) if (items[i].stateValue === 1) activeCount++
    return activeCount <= testimonyLimit
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    setItems((prev) => arrayMove(prev, oldIdx, newIdx))
  }

  // Alternativa al arrastre que siempre funciona, sin depender de dnd-kit ni del handle.
  const moveItem = (id: number, direction: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id)
    const newIdx = idx + direction
    if (idx < 0 || newIdx < 0 || newIdx >= items.length) return
    setItems((prev) => arrayMove(prev, idx, newIdx))
  }

  const handleConfirm = async () => {
    const confirmed = await swalConfirm({
      title: '¿Confirmar nuevo orden?',
      text: `Se actualizará el orden de ${items.length} testimonio(s).`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
    })
    if (!confirmed || idSection === null) return

    const ok = await confirm(idSection, items.map((i) => i.id))
    if (ok) {
      toastSuccess('Orden actualizado', 'El nuevo orden se guardó correctamente.')
      goBackOrFallback(router, '/testimony')
    } else {
      toastError('Error', 'No se pudo actualizar el orden.')
    }
  }

  // Sin permiso de reordenar solo mostramos un aviso (ver ROLES_Y_PERMISOS.md)
  if (!canReorder) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No tienes permiso para reordenar.
      </div>
    )
  }

  if (isSectionError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">{sectionError}</p>
        <Button size="sm" variant="outline" onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    )
  }

  if (isLoading || idSection === null) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando testimonios de sección...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar testimonios de sección</p>
        <Button size="sm" variant="outline" onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Quote className="size-4" />
            Arrastra para cambiar el orden de los testimonios. Nada se guarda hasta que confirmes.
          </div>
          <div className="text-xs text-muted-foreground">
            {testimonyLimit == null
              ? 'El sitio web muestra todos los testimonios activos (sin límite configurado).'
              : <>El sitio web solo muestra los primeros <strong>{testimonyLimit}</strong> testimonios activos según este orden — el resto queda marcado como &quot;No visible&quot;. Puedes cambiar el límite desde <em>Configuración</em>.</>}
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay testimonios para reordenar en esta sección.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  isVisibleOnWeb={isVisibleOnWeb(idx)}
                  onMoveUp={idx > 0 ? () => moveItem(item.id, -1) : undefined}
                  onMoveDown={idx < items.length - 1 ? () => moveItem(item.id, 1) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/testimony')} disabled={isSubmitting}>
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
