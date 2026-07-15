'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con imágenes — no se importa desde ninguna
 * página/vista todavía, es solo la referencia de cómo abrir y consumir el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (miniatura, nombre, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (ImageApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { getImageUrl, getImageDisplayName, formatBytes } from '../lib/image-url'
import { useImageModalSelectStore } from '../stores/useImageModalSelectStore'
import type { ImageApiItem } from '../model/imageget.dto'

interface ImageModalSelectExampleProps {
  value?: ImageApiItem | null
  onValueChange: (image: ImageApiItem) => void
}

export function ImageModalSelectExample({ value, onValueChange }: ImageModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useImageModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? getImageDisplayName(value) : 'Seleccionar imagen...'}
      </Button>

      <ModalSelect<ImageApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar imagen"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(image) => image.id_image}
        columns={[
          {
            header: '',
            cell: (image) => (
              <img
                src={getImageUrl(image.image_patch)}
                alt={getImageDisplayName(image)}
                className="size-8 rounded object-cover"
              />
            ),
            className: 'w-12',
          },
          { header: 'Nombre', cell: (image) => getImageDisplayName(image) },
          { header: 'Tamaño', cell: (image) => formatBytes(image.image_size) },
        ]}
        searchPlaceholder="Buscar imagen..."
        emptyMessage="No se encontraron imágenes."
        onSelect={onValueChange}
      />
    </>
  )
}
