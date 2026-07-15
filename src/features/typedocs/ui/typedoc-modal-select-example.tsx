'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con tipos de documento — no se importa
 * desde ninguna página/vista todavía, es solo la referencia de cómo abrir y
 * consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (TypeDocApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useTypeDocModalSelectStore } from '../stores/useTypeDocModalSelectStore'
import type { TypeDocApiItem } from '../model/typedocget.dto'

interface TypeDocModalSelectExampleProps {
  value?: TypeDocApiItem | null
  onValueChange: (typedoc: TypeDocApiItem) => void
}

export function TypeDocModalSelectExample({ value, onValueChange }: TypeDocModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useTypeDocModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.typedoc_name : 'Seleccionar documento...'}
      </Button>

      <ModalSelect<TypeDocApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar tipo de documento"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(typedoc) => typedoc.id_typedoc}
        columns={[
          { header: 'Nombre', cell: (typedoc) => typedoc.typedoc_name },
          {
            header: 'Estado',
            cell: (typedoc) => getStateOption(typedoc.typedoc_state)?.label ?? typedoc.typedoc_state,
          },
        ]}
        searchPlaceholder="Buscar documento..."
        emptyMessage="No se encontraron tipos de documento."
        onSelect={onValueChange}
      />
    </>
  )
}
