'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con roles — no se importa desde ninguna
 * página/vista todavía, es solo la referencia de cómo abrir y consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (RoleType), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useRoleModalSelectStore } from '../stores/useRoleModalSelectStore'
import type { RoleType } from '@/entities/role/model/role.type'

interface RoleModalSelectExampleProps {
  value?: RoleType | null
  onValueChange: (role: RoleType) => void
}

export function RoleModalSelectExample({ value, onValueChange }: RoleModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useRoleModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.role_name : 'Seleccionar rol...'}
      </Button>

      <ModalSelect<RoleType>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar rol"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(role) => role.id_role}
        columns={[
          { header: 'Nombre', cell: (role) => role.role_name },
          {
            header: 'Estado',
            cell: (role) => getStateOption(role.role_state)?.label ?? role.role_state,
          },
        ]}
        searchPlaceholder="Buscar rol..."
        emptyMessage="No se encontraron roles."
        onSelect={onValueChange}
      />
    </>
  )
}
