'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con productos/servicios — no se importa
 * desde ninguna página/vista todavía, es solo la referencia de cómo abrir y
 * consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, precio, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (ProductServiceApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { useProductServiceModalSelectStore } from '../stores/useProductServiceModalSelectStore'
import type { ProductServiceApiItem } from '../model/productserviceget.dto'

interface ProductServiceModalSelectExampleProps {
  value?: ProductServiceApiItem | null
  onValueChange: (productService: ProductServiceApiItem) => void
}

export function ProductServiceModalSelectExample({ value, onValueChange }: ProductServiceModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useProductServiceModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.name : 'Seleccionar producto o servicio...'}
      </Button>

      <ModalSelect<ProductServiceApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar producto o servicio"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(productService) => productService.id}
        columns={[
          { header: 'Nombre', cell: (productService) => productService.name },
          {
            header: 'Precio',
            cell: (productService) => `S/ ${Number(productService.default_price).toFixed(2)}`,
          },
        ]}
        searchPlaceholder="Buscar producto o servicio..."
        emptyMessage="No se encontraron productos o servicios."
        onSelect={onValueChange}
      />
    </>
  )
}
