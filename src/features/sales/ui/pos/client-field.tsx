// src/features/sales/ui/pos/client-field.tsx
'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import { Label } from '@/shared/ui/label'
import {
  ClientPickerModal,
  ClientQuickCreateDialog,
  useClientSelectStore,
} from '@/features/clients'
import type { ClientApiItem, ClientJoinApiItem } from '@/features/clients/model/clientget.dto'
import { useSalePosStore } from '../../stores/useSalePosStore'
import { AutocompleteInput } from './autocomplete-input'
import { FieldError } from './field-error'

// "Cliente varios" se ofrece como una opción más de la lista (no como estado por defecto).
type ClientOption = { kind: 'generic' } | { kind: 'client'; client: ClientJoinApiItem }

const GENERIC_LABEL = 'Cliente varios'
const MAX_RESULTS = 8

interface ClientFieldProps {
  inputRef: RefObject<HTMLInputElement | null>
  /** Factura (code "01") no admite "Cliente varios". */
  allowGeneric: boolean
  modalOpen: boolean
  onModalOpenChange: (open: boolean) => void
  /** Se llama después de elegir un cliente — la pantalla mueve el foco al buscador de productos. */
  onPicked: () => void
  error?: string
  disabled?: boolean
  /** Botones extra al lado de la lupa (ej. "Importar proforma"). */
  trailing?: ReactNode
}

/** Campo "Cliente": autocompletado por nombre o RUC/DNI + lupa que abre el buscador completo. */
export function ClientField({
  inputRef,
  allowGeneric,
  modalOpen,
  onModalOpenChange,
  onPicked,
  error,
  disabled,
  trailing,
}: ClientFieldProps) {
  const { client, isGenericClient, setClient, setGenericClient } = useSalePosStore()
  const { options, load, setForceReload } = useClientSelectStore()
  const [query, setQuery] = useState('')
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  // true cuando la selección se soltó porque el usuario está escribiendo: en ese caso NO se debe
  // borrar lo que escribió (solo se borra al limpiar la venta completa).
  const typingRef = useRef(false)

  useEffect(() => {
    void load()
  }, [])

  // El texto del input refleja siempre lo elegido (al importar proforma, al editar, al limpiar).
  useEffect(() => {
    if (typingRef.current) {
      typingRef.current = false
      return
    }
    setQuery(client ? client.name : isGenericClient ? GENERIC_LABEL : '')
  }, [client?.id, isGenericClient])

  const items = useMemo<ClientOption[]>(() => {
    const term = query.trim().toLowerCase()
    // Si el texto es justo lo ya elegido, se muestra la lista completa (para poder cambiarlo).
    const isSelectedLabel = term === (client?.name ?? GENERIC_LABEL).toLowerCase()
    const matches = options
      .filter(
        (c) =>
          !term ||
          isSelectedLabel ||
          c.business_name.toLowerCase().includes(term) ||
          (c.document_number ?? '').toLowerCase().includes(term)
      )
      .slice(0, MAX_RESULTS)
      .map((c): ClientOption => ({ kind: 'client', client: c }))
    const showGeneric =
      allowGeneric && (!term || isSelectedLabel || GENERIC_LABEL.toLowerCase().includes(term))
    return showGeneric ? [{ kind: 'generic' }, ...matches] : matches
  }, [options, query, allowGeneric, client?.name])

  const pickClient = (c: { id: number; business_name: string; document_number: string | null }) => {
    setClient({ id: c.id, name: c.business_name, document: c.document_number })
    onPicked()
  }

  // Cliente elegido en el buscador o recién creado: si es nuevo, el autocompletado también
  // debe conocerlo, por eso se recarga la lista.
  const handleSelectedFromDialog = (selected: ClientApiItem) => {
    setForceReload(true)
    void load()
    pickClient(selected)
  }

  const handlePick = (option: ClientOption) => {
    if (option.kind === 'generic') {
      setGenericClient()
      onPicked()
    } else {
      pickClient(option.client)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="pos-client">
        Cliente <span className="text-muted-foreground text-xs font-normal">(F3)</span>
      </Label>
      <div className="flex gap-2">
        <AutocompleteInput<ClientOption>
          id="pos-client"
          inputRef={inputRef}
          query={query}
          onQueryChange={(value) => {
            setQuery(value)
            // Si había algo elegido y el usuario vuelve a escribir, se suelta la selección.
            if (client || isGenericClient) {
              typingRef.current = true
              setClient(null)
            }
          }}
          items={items}
          getKey={(o) => (o.kind === 'generic' ? 'generic' : o.client.id)}
          renderItem={(o) =>
            o.kind === 'generic' ? (
              <span className="flex items-center gap-2 font-medium">
                <Users className="size-4" />
                {GENERIC_LABEL}
                <span className="text-muted-foreground text-xs font-normal">(sin datos, solo boleta)</span>
              </span>
            ) : (
              <span className="flex flex-col">
                <span className="font-medium">{o.client.business_name}</span>
                <span className="text-muted-foreground text-xs">
                  {o.client.document_number ?? 'Sin documento'}
                </span>
              </span>
            )
          }
          onPick={handlePick}
          placeholder="Nombre o RUC/DNI del cliente..."
          emptyText="No se encontró. Usa la lupa para crear uno nuevo."
          openOnFocus
          disabled={disabled}
          invalid={Boolean(error)}
        />
        <IconButton
          label="Buscar cliente"
          className="shrink-0"
          disabled={disabled}
          onClick={() => onModalOpenChange(true)}
          icon={<Search />}
        />
        {/* Atajo directo para registrar un cliente sin pasar por el buscador. */}
        <IconButton
          label="Nuevo cliente"
          className="shrink-0"
          disabled={disabled}
          onClick={() => setQuickCreateOpen(true)}
          icon={<UserPlus />}
        />
        {trailing}
      </div>
      {client?.document && (
        <span className="text-muted-foreground text-xs">Documento: {client.document}</span>
      )}
      <FieldError message={error} />

      <ClientPickerModal
        open={modalOpen}
        onOpenChange={onModalOpenChange}
        initialSearch={client ? '' : query}
        onSelect={handleSelectedFromDialog}
      />

      <ClientQuickCreateDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        // Lo que ya se escribió en el campo sirve como razón social inicial.
        initialName={client || isGenericClient ? '' : query}
        onCreated={handleSelectedFromDialog}
      />
    </div>
  )
}
