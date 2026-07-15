'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con tipos de proforma — no se importa desde
 * ninguna página/vista todavía, es solo la referencia de cómo abrir y consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (ProformaTypeApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useProformaTypeModalSelectStore } from '../stores/useProformaTypeModalSelectStore'
import type { ProformaTypeApiItem } from '../model/proformatypeget.dto'

interface ProformaTypeModalSelectExampleProps {
  value?: ProformaTypeApiItem | null
  onValueChange: (proformaType: ProformaTypeApiItem) => void
}

export function ProformaTypeModalSelectExample({ value, onValueChange }: ProformaTypeModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useProformaTypeModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.name : 'Seleccionar tipo de proforma...'}
      </Button>

      <ModalSelect<ProformaTypeApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar tipo de proforma"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(proformaType) => proformaType.id}
        columns={[
          { header: 'Nombre', cell: (proformaType) => proformaType.name },
          { header: 'Código', cell: (proformaType) => proformaType.code ?? '—' },
          {
            header: 'Estado',
            cell: (proformaType) => getStateOption(proformaType.status)?.label ?? proformaType.status,
          },
        ]}
        searchPlaceholder="Buscar tipo de proforma..."
        emptyMessage="No se encontraron tipos de proforma."
        onSelect={onValueChange}
      />
    </>
  )
}
