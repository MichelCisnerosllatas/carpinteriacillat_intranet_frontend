'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con typecolors — no se importa desde ninguna
 * página/vista todavía, es solo la referencia de cómo abrir y consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (color, nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (TypeColorApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useTypeColorModalSelectStore } from '../stores/useTypeColorModalSelectStore'
import type { TypeColorApiItem } from '../model/typecolorget.dto'

interface TypeColorModalSelectExampleProps {
  value?: TypeColorApiItem | null
  onValueChange: (typecolor: TypeColorApiItem) => void
}

export function TypeColorModalSelectExample({ value, onValueChange }: TypeColorModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useTypeColorModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.typecolor_name : 'Seleccionar color...'}
      </Button>

      <ModalSelect<TypeColorApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar color"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(typecolor) => typecolor.id_typecolor}
        columns={[
          {
            header: 'Color',
            cell: (typecolor) => (
              <span
                className="inline-block size-5 rounded-md border"
                style={{ backgroundColor: typecolor.typecolor_hex ?? undefined }}
                title={typecolor.typecolor_hex ?? 'Sin color definido'}
              />
            ),
          },
          { header: 'Nombre', cell: (typecolor) => typecolor.typecolor_name },
          {
            header: 'Estado',
            cell: (typecolor) => getStateOption(typecolor.typecolor_state)?.label ?? typecolor.typecolor_state,
          },
        ]}
        searchPlaceholder="Buscar color..."
        emptyMessage="No se encontraron colores."
        onSelect={onValueChange}
      />
    </>
  )
}
