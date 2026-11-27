'use client'

import type { ReactNode } from 'react'
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
import { ChevronRight, ImageIcon, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SectionImage } from '../../data/schema'
import type { ImageItemGroup, ImageSectionGroup } from '../../lib/group-section-images'
import { SectionImageGroupHeading } from './sectionimage-group-heading'

interface SectionImagesGroupedGridProps {
  groups: ImageSectionGroup[]
  /** true en la página `/section-images`: muestra "Página › Sección" encima de cada sección. */
  showSectionHeader: boolean
  /** Dibuja la tarjeta de una foto (la tabla decide los handlers). */
  renderCard: (image: SectionImage, group: ImageItemGroup) => ReactNode
  /** Si viene, cada grupo muestra el botón "Agregar foto a este item". */
  onAddToItem?: (idSection: number, idSectionItem: number | null) => void
  /** Se llama al soltar una foto arrastrada sobre otra del MISMO grupo (ids de ambas fotos). */
  onMoveInGroup?: (activeId: number, overId: number) => void
}

const GRID_CLASS = 'grid gap-3 grid-cols-[repeat(auto-fill,minmax(190px,1fr))]'

/** Texto "Servicios › Hero de servicios" (sin la página si no tiene). */
function sectionPath(section: ImageSectionGroup): string[] {
  return [section.navigationName, section.sectionName || `Sección #${section.idSection}`].filter(Boolean) as string[]
}

/**
 * Fotos agrupadas por sección y por item: cada item tiene su bloque con encabezado
 * "01 · Título", sus fotos en orden (la 1ª = Principal) y al final "Sin item asignado".
 */
export function SectionImagesGroupedGrid({ groups, showSectionHeader, renderCard, onAddToItem, onMoveInGroup }: SectionImagesGroupedGridProps) {
  // Sensores del arrastre:
  // - MouseSensor (no PointerSensor): el PointerSensor también toma el dedo y bloquea el scroll en celular.
  // - TouchSensor: hay que mantener presionado ~¼ s; si el dedo se desliza antes, es scroll normal.
  // - KeyboardSensor: ordenar con teclado (Espacio + flechas).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!onMoveInGroup || !over || active.id === over.id) return
    // Solo se ordena dentro del mismo grupo: si se suelta en otro, se ignora
    if (active.data.current?.groupKey !== over.data.current?.groupKey) return
    onMoveInGroup(Number(active.id), Number(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6">
        {groups.map((section) => (
          <div key={section.idSection} className={cn('flex flex-col gap-4', showSectionHeader && 'rounded-xl border p-3 sm:p-4')}>
            {/* Encabezado de la sección (solo en la lista general) */}
            {showSectionHeader && (
              <div className="flex flex-wrap items-center gap-1 text-sm font-semibold">
                {sectionPath(section).map((part, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && <ChevronRight className="size-4 text-muted-foreground" />}
                    {part}
                  </span>
                ))}
              </div>
            )}

            {section.groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                {/* Encabezado del item — las secciones sin items no lo llevan */}
                {group.heading && (
                  <SectionImageGroupHeading
                    group={group}
                    prefix={showSectionHeader ? `${sectionPath(section).join(' › ')} ›` : undefined}
                    action={onAddToItem && (
                      <Button size="sm" variant="outline" onClick={() => onAddToItem(section.idSection, group.idSectionItem)}>
                        <Plus className="mr-1.5 size-4" />
                        {group.idSectionItem != null ? 'Agregar foto a este item' : 'Agregar foto sin item'}
                      </Button>
                    )}
                  />
                )}

                {group.images.length === 0 ? (
                  <div className="flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground">
                    <ImageIcon className="size-5" />
                    <span className="text-xs">Aún no tiene fotos.</span>
                  </div>
                ) : (
                  // Un SortableContext por grupo: cada item se ordena por separado
                  <SortableContext items={group.images.map((image) => image.id)} strategy={rectSortingStrategy}>
                    <div className={GRID_CLASS}>
                      {group.images.map((image) => renderCard(image, group))}
                    </div>
                  </SortableContext>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </DndContext>
  )
}
