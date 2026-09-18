'use client'

import { useState } from 'react'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { Card, CardContent } from '@/shared/ui/card'
import { SectionButtonsReorderList } from './section-buttons-reorder-list'

/**
 * Cuando se entra a `/section-buttons/reorder` sin `?id_section=`, no hay un grupo obvio que
 * reordenar (a diferencia de `sections/reorder`, que sí puede mostrar todo agrupado por
 * navegación) — aquí se le pide primero al usuario que elija la sección.
 */
export function SectionButtonsReorderPicker() {
  const [idSection, setIdSection] = useState<number | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-2 pt-6">
          <span className="text-sm text-muted-foreground">Elige la sección cuyos botones quieres reordenar.</span>
          <SectionSelect value={idSection} onValueChange={setIdSection} placeholder="Seleccionar sección" />
        </CardContent>
      </Card>

      {idSection !== null && <SectionButtonsReorderList idSection={idSection} />}
    </div>
  )
}
