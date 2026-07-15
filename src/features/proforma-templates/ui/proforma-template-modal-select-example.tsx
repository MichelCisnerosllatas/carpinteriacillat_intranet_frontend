'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con plantillas de proforma — no se importa
 * desde ninguna página/vista todavía, es solo la referencia de cómo abrir y
 * consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (ProformaTemplateApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useProformaTemplateModalSelectStore } from '../stores/useProformaTemplateModalSelectStore'
import type { ProformaTemplateApiItem } from '../model/proformatemplateget.dto'

interface ProformaTemplateModalSelectExampleProps {
  value?: ProformaTemplateApiItem | null
  onValueChange: (template: ProformaTemplateApiItem) => void
}

export function ProformaTemplateModalSelectExample({
  value,
  onValueChange,
}: ProformaTemplateModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useProformaTemplateModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.name : 'Seleccionar plantilla...'}
      </Button>

      <ModalSelect<ProformaTemplateApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar plantilla"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(template) => template.id}
        columns={[
          { header: 'Nombre', cell: (template) => template.name },
          {
            header: 'Estado',
            cell: (template) => getStateOption(template.status)?.label ?? template.status,
          },
        ]}
        searchPlaceholder="Buscar plantilla..."
        emptyMessage="No se encontraron plantillas."
        onSelect={onValueChange}
      />
    </>
  )
}
