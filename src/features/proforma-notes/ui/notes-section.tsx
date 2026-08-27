// src/features/proforma-notes/ui/notes-section.tsx
'use client'

import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { ProformaNoteLines } from './proforma-note-lines'

interface NotesSectionProps {
  proformaId: number | null
}

/** Card "Notas adicionales" — lista abierta de líneas que se muestran debajo de "Tiempo de
 * entrega" en el recuadro final del PDF (ej: garantía, validez de la oferta). A diferencia del
 * carrito de productos, son opcionales: no se exige ningún mínimo. */
export function NotesSection({ proformaId }: NotesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          Notas
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Líneas libres que aparecen debajo de &quot;Tiempo de entrega&quot; en el PDF (ej:
              garantía, validez de la oferta). Puedes ir agregando notas ya mismo — se guardan
              solas en cuanto registres la proforma.
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProformaNoteLines proformaId={proformaId} />
      </CardContent>
    </Card>
  )
}
