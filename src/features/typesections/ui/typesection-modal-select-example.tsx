'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con tipos de sección — no se importa desde
 * ninguna página/vista todavía, es solo la referencia de cómo abrir y consumir
 * el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (TypeSectionApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useTypeSectionModalSelectStore } from '../stores/useTypeSectionModalSelectStore'
import type { TypeSectionApiItem } from '../model/typesectionget.dto'

interface TypeSectionModalSelectExampleProps {
  value?: TypeSectionApiItem | null
  onValueChange: (typesection: TypeSectionApiItem) => void
}

export function TypeSectionModalSelectExample({ value, onValueChange }: TypeSectionModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useTypeSectionModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.typesection_name : 'Seleccionar sección...'}
      </Button>

      <ModalSelect<TypeSectionApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar sección"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(typesection) => typesection.id_typesection}
        columns={[
          { header: 'Nombre', cell: (typesection) => typesection.typesection_name },
          {
            header: 'Estado',
            cell: (typesection) => getStateOption(typesection.typesection_state)?.label ?? typesection.typesection_state,
          },
        ]}
        searchPlaceholder="Buscar sección..."
        emptyMessage="No se encontraron secciones."
        onSelect={onValueChange}
      />
    </>
  )
}
