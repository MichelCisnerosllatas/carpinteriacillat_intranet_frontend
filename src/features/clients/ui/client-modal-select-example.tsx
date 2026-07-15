'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con clientes — no se importa desde ninguna
 * página/vista todavía, es solo la referencia de cómo abrir y consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, documento, email...) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (ClientJoinApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { useClientModalSelectStore } from '../stores/useClientModalSelectStore'
import type { ClientJoinApiItem } from '@/features/clients/model/clientget.dto'

interface ClientModalSelectExampleProps {
  value?: ClientJoinApiItem | null
  onValueChange: (client: ClientJoinApiItem) => void
}

export function ClientModalSelectExample({ value, onValueChange }: ClientModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useClientModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.business_name : 'Seleccionar cliente...'}
      </Button>

      <ModalSelect<ClientJoinApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar cliente"
        description="Busca por nombre, documento o correo y navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(client) => client.id}
        columns={[
          { header: 'Nombre / Razón social', cell: (client) => client.business_name },
          { header: 'Documento', cell: (client) => client.document_number ?? '-' },
          { header: 'Correo', cell: (client) => client.email ?? '-' },
        ]}
        searchPlaceholder="Buscar cliente..."
        emptyMessage="No se encontraron clientes."
        onSelect={onValueChange}
      />
    </>
  )
}
