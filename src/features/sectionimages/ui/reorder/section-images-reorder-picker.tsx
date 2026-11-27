'use client'

import { useState } from 'react'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { Card, CardContent } from '@/shared/ui/card'
import { SectionImagesReorderList } from './section-images-reorder-list'

/**
 * Cuando se entra a `/section-images/reorder` sin `?id_section=`, no hay un grupo obvio que
 * reordenar — igual que `SectionButtonsReorderPicker`, se le pide primero al usuario que elija
 * la sección.
 */
export function SectionImagesReorderPicker() {
  const [idSection, setIdSection] = useState<number | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-2 pt-6">
          <span className="text-sm text-muted-foreground">Elige la sección cuyas imágenes quieres reordenar.</span>
          <SectionSelect value={idSection} onValueChange={setIdSection} placeholder="Seleccionar sección" />
        </CardContent>
      </Card>

      {idSection !== null && <SectionImagesReorderList idSection={idSection} />}
    </div>
  )
}
