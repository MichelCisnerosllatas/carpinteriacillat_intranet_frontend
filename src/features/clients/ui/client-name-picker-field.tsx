'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { ClientPickerModal } from './client-picker-modal'
import type { ClientApiItem } from '../model/client-api-item.dto'

interface ClientNamePickerFieldProps {
  clientId: number | null
  clientName: string
  onChange: (next: { clientId: number | null; clientName: string }) => void
  disabled?: boolean
  /** Refleja el estado de error del <FormField /> que lo envuelve — como este componente no pasa
   * por <FormControl /> (su render no usa `field`, así que nada le inyecta `aria-invalid` solo),
   * el borde rojo hay que pedirlo explícito. */
  'aria-invalid'?: boolean
}

/**
 * Reemplazo de `<ClientSelect />` SOLO dentro del formulario de proforma: en vez de forzar elegir
 * de una lista, deja escribir el nombre del cliente libremente + un botón de lupa que abre
 * `<ClientPickerModal />` para buscar y elegir uno existente (o crear uno nuevo sin salir del
 * modal). Si el usuario escribe a mano sin usar el modal, `clientId` queda en `null` — se resuelve
 * recién al enviar el formulario (ver `resolveOrCreateClient` en `submitProformaHeader`).
 */
export function ClientNamePickerField({
  clientId,
  clientName,
  onChange,
  disabled,
  'aria-invalid': ariaInvalid,
}: ClientNamePickerFieldProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        <Input
          value={clientName}
          placeholder="Nombre del cliente"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          onChange={(e) => onChange({ clientId: null, clientName: e.target.value })}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={() => setModalOpen(true)}
          className="shrink-0"
        >
          <Search className="size-4" />
        </Button>
      </div>

      <ClientPickerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialSearch={clientName}
        onSelect={(client: ClientApiItem) => {
          onChange({ clientId: client.id, clientName: client.business_name })
        }}
      />
    </>
  )
}
