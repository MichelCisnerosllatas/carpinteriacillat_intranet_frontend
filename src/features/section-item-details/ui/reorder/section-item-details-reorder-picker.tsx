'use client'

import { useState } from 'react'
import { SectionItemSelect } from '@/features/section-items/ui/section-item-select'
import { Card, CardContent } from '@/shared/ui/card'
import { SectionItemDetailsReorderList } from './section-item-details-reorder-list'

/**
 * Cuando se entra a `/section-item-details/reorder` sin `?id_section_item=`, no hay un grupo
 * obvio que reordenar — aquí se le pide primero al usuario que elija el item de sección.
 */
export function SectionItemDetailsReorderPicker() {
  const [idSectionItem, setIdSectionItem] = useState<number | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-2 pt-6">
          <span className="text-sm text-muted-foreground">Elige el item de sección cuyos detalles quieres reordenar.</span>
          <SectionItemSelect value={idSectionItem} onValueChange={setIdSectionItem} placeholder="Seleccionar item de sección" />
        </CardContent>
      </Card>

      {idSectionItem !== null && <SectionItemDetailsReorderList idSectionItem={idSectionItem} />}
    </div>
  )
}
