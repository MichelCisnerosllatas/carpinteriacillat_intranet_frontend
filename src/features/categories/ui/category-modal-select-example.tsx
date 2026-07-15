'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con categorías — no se importa desde ninguna
 * página/vista todavía, es solo la referencia de cómo abrir y consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, estado, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (CategoryApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getStateOption } from '@/shared/config/entity-states'
import { useCategoryModalSelectStore } from '../stores/useCategoryModalSelectStore'
import type { CategoryApiItem } from '../model/categoryget.dto'

interface CategoryModalSelectExampleProps {
  value?: CategoryApiItem | null
  onValueChange: (category: CategoryApiItem) => void
}

export function CategoryModalSelectExample({ value, onValueChange }: CategoryModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useCategoryModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.category_name : 'Seleccionar categoría...'}
      </Button>

      <ModalSelect<CategoryApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar categoría"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(category) => category.id_category}
        columns={[
          { header: 'Nombre', cell: (category) => category.category_name },
          {
            header: 'Estado',
            cell: (category) => getStateOption(category.category_state)?.label ?? category.category_state,
          },
        ]}
        searchPlaceholder="Buscar categoría..."
        emptyMessage="No se encontraron categorías."
        onSelect={onValueChange}
      />
    </>
  )
}
