'use client'

/**
 * EJEMPLO de uso de <ModalSelect /> con firmas de empresa — no se importa desde
 * ninguna página/vista todavía, es solo la referencia de cómo abrir y consumir
 * el modal.
 *
 * Para usarlo de verdad en una vista:
 *   1. Copia este patrón (botón/trigger propio + useState `open`).
 *   2. `useEffect(() => { if (open) load() }, [open])` para cargar solo al abrir
 *      (o quita el `if (open)` si prefieres precargar como los Select normales).
 *   3. Define `columns` con SOLO los campos relevantes para elegir de un vistazo
 *      (nombre, cargo, etc.) — no repliques toda la tabla CRUD completa aquí.
 *   4. `onSelect` recibe el objeto completo (CompanySignatureApiItem), no solo el id.
 */

import { useEffect, useState } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { Button } from '@/shared/ui/button'
import { useCompanySignatureModalSelectStore } from '../stores/useCompanySignatureModalSelectStore'
import type { CompanySignatureApiItem } from '../model/companysignatureget.dto'

interface CompanySignatureModalSelectExampleProps {
  value?: CompanySignatureApiItem | null
  onValueChange: (companySignature: CompanySignatureApiItem) => void
}

export function CompanySignatureModalSelectExample({
  value,
  onValueChange,
}: CompanySignatureModalSelectExampleProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useCompanySignatureModalSelectStore()

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {value ? value.signer_name : 'Seleccionar firma...'}
      </Button>

      <ModalSelect<CompanySignatureApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar firma"
        description="Busca por nombre o navega con las flechas y Enter."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => { setForceReload(true); load() }}
        getId={(companySignature) => companySignature.id}
        columns={[
          { header: 'Nombre', cell: (companySignature) => companySignature.signer_name },
          { header: 'Cargo', cell: (companySignature) => companySignature.position ?? '-' },
        ]}
        searchPlaceholder="Buscar firma..."
        emptyMessage="No se encontraron firmas."
        onSelect={onValueChange}
      />
    </>
  )
}
