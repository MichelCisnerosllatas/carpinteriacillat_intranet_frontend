// src/features/proforma-notes/ui/notes-section.tsx
'use client'

import { Info, StickyNote } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useProformaNotes } from '../hooks/useProformaNotes'
import { ProformaNoteLines } from './proforma-note-lines'

interface NotesSectionProps {
  proformaId: number | null
}

/** Card "Notas adicionales" — lista abierta de líneas que se muestran debajo de "Tiempo de
 * entrega" en el recuadro final del PDF (ej: garantía, validez de la oferta). A diferencia del
 * carrito de productos, son opcionales: no se exige ningún mínimo.
 *
 * Envuelta en el mismo patrón Card+Accordion que usa `sections-tab.tsx` (en vez de la Card lisa
 * anterior) por dos motivos: se distingue mejor del resto de cards del formulario (que no son
 * plegables) y el ícono + badge con el conteo comunican de entrada que ahí se pueden seguir
 * agregando notas. Arranca CONTRAÍDA (sin `defaultValue`) — el badge con el conteo ya avisa si
 * tiene contenido, y así no ocupa espacio vertical de entrada en un formulario ya largo.
 *
 * El hook `useProformaNotes` se llama acá (además de en `ProformaNoteLines`) solo para leer el
 * conteo total para el badge — sus efectos (cargar notas, limpiar pendientes al desmontar) son
 * idempotentes así que duplicarlos entre ambos componentes es inofensivo.
 */
export function NotesSection({ proformaId }: NotesSectionProps) {
  const notes = useProformaNotes({ proformaId })
  const totalCount = notes.savedNotes.length + notes.pendingNotes.length

  return (
    <Card className="py-2">
      <CardContent className="px-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="notes" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <span className="flex items-center gap-3 text-left">
                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                  <StickyNote className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="flex items-center gap-1.5">
                    Notas adicionales
                    {totalCount > 0 && (
                      <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                        {totalCount}
                      </Badge>
                    )}
                    {/* stopPropagation: el ícono vive dentro del botón del AccordionTrigger — sin
                     * esto, pasar el mouse/hacer click para ver el tooltip también abriría o
                     * cerraría el acordeón. */}
                    <span onClick={(e) => e.stopPropagation()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="text-muted-foreground size-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Líneas libres que aparecen debajo de &quot;Tiempo de entrega&quot; en el
                          PDF (ej: garantía, validez de la oferta). Puedes ir agregando notas ya
                          mismo — se guardan solas en cuanto registres la proforma.
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Opcional — agrega tantas notas como necesites.
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ProformaNoteLines proformaId={proformaId} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
