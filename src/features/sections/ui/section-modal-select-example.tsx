'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con secciones — no se importa desde
 * ninguna página/vista todavía, es solo la referencia de cómo abrir y
 * consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (SectionApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useSectionModalSelectStore } from '../stores/useSectionModalSelectStore'
import type { SectionApiItem } from '../model/sectionget.dto'

interface SectionModalSelectExampleProps {
  value?: SectionApiItem | null
  onValueChange: (section: SectionApiItem) => void
}

export function SectionModalSelectExample({ value, onValueChange }: SectionModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useSectionModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.section_name : 'Seleccionar sección...'}
      </Button>

      <ModalSelect<SectionApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar sección"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(section) => section.id_section}
        columns={[
          { header: 'Nombre', cell: (section) => section.section_name },
          {
            header: 'Estado',
            cell: (section) => getStateOption(section.section_state)?.label ?? section.section_state,
          },
        ]}
        searchPlaceholder="Buscar sección..."
        emptyMessage="No se encontraron secciones."
        onSelect={onValueChange}
      />
    </>
  )
}
