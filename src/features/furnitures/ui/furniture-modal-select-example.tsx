'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con muebles — no se importa desde ninguna
 * página/vista todavía, es solo la referencia de cómo abrir y consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (FurnitureJoinApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useFurnitureModalSelectStore } from '../stores/useFurnitureModalSelectStore'
import type { FurnitureJoinApiItem } from '../model/furniture-api-item.dto'

interface FurnitureModalSelectExampleProps {
  value?: FurnitureJoinApiItem | null
  onValueChange: (furniture: FurnitureJoinApiItem) => void
}

export function FurnitureModalSelectExample({ value, onValueChange }: FurnitureModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useFurnitureModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.furniture_name : 'Seleccionar mueble...'}
      </Button>

      <ModalSelect<FurnitureJoinApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar mueble"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(furniture) => furniture.id_furniture}
        columns={[
          { header: 'Nombre', cell: (furniture) => furniture.furniture_name },
          {
            header: 'Estado',
            cell: (furniture) => getStateOption(furniture.furniture_state)?.label ?? furniture.furniture_state,
          },
        ]}
        searchPlaceholder="Buscar mueble..."
        emptyMessage="No se encontraron muebles."
        onSelect={onValueChange}
      />
    </>
  )
}
