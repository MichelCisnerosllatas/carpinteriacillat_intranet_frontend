'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con tipografías (TypeFont) — no se importa
 * desde ninguna página/vista todavía, es solo la referencia de cómo abrir y
 * consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (TypeFontApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useTypeFontModalSelectStore } from '../stores/useTypeFontModalSelectStore'
import type { TypeFontApiItem } from '../model/typefontget.dto'

interface TypeFontModalSelectExampleProps {
  value?: TypeFontApiItem | null
  onValueChange: (typefont: TypeFontApiItem) => void
}

export function TypeFontModalSelectExample({ value, onValueChange }: TypeFontModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useTypeFontModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.typefont_name : 'Seleccionar tipografía...'}
      </Button>

      <ModalSelect<TypeFontApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar tipografía"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(typefont) => typefont.id_typefont}
        columns={[
          { header: 'Nombre', cell: (typefont) => typefont.typefont_name },
          {
            header: 'Estado',
            cell: (typefont) => getStateOption(typefont.typefont_state)?.label ?? typefont.typefont_state,
          },
        ]}
        searchPlaceholder="Buscar tipografía..."
        emptyMessage="No se encontraron tipografías."
        onSelect={onValueChange}
      />
    </>
  )
}
