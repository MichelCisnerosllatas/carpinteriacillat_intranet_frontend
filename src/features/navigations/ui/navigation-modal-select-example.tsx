'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con navegaciones — no se importa desde
 * ninguna página/vista todavía, es solo la referencia de cómo abrir y
 * consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (NavigationApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useNavigationModalSelectStore } from '../stores/useNavigationModalSelectStore'
import type { NavigationApiItem } from '../model/navigationget.dto'

interface NavigationModalSelectExampleProps {
  value?: NavigationApiItem | null
  onValueChange: (navigation: NavigationApiItem) => void
}

export function NavigationModalSelectExample({ value, onValueChange }: NavigationModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useNavigationModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.navigation_name : 'Seleccionar navegación...'}
      </Button>

      <ModalSelect<NavigationApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar navegación"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(navigation) => navigation.id_navigation}
        columns={[
          { header: 'Nombre', cell: (navigation) => navigation.navigation_name },
          { header: 'URL', cell: (navigation) => navigation.navigation_url },
          {
            header: 'Estado',
            cell: (navigation) => getStateOption(navigation.navigation_state)?.label ?? navigation.navigation_state,
          },
        ]}
        searchPlaceholder="Buscar navegación..."
        emptyMessage="No se encontraron navegaciones."
        onSelect={onValueChange}
      />
    </>
  )
}
