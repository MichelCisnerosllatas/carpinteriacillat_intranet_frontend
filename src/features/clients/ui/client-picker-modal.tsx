'use client'

import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ModalSelect } from '@/shared/ui/modal-select'
import { useClientModalSelectStore } from '../stores/useClientModalSelectStore'
import { ClientQuickCreateDialog } from './client-quick-create-dialog'
import type { ClientApiItem } from '../model/client-api-item.dto'

interface ClientPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (client: ClientApiItem) => void
  /** Texto que el usuario ya venía escribiendo en el input libre antes de abrir el modal (ver
   * `<ClientNamePickerField />`) — se usa para prellenar el quick-create si no encuentra nada. */
  initialSearch?: string
}

/**
 * Modal de búsqueda de cliente para el formulario de proforma — mismo patrón que
 * `<ProductServicePickerModal />`, pero controlado por quien lo usa (no trae su propio botón
 * disparador): `<ClientNamePickerField />` es la que decide cuándo abrirlo.
 */
export function ClientPickerModal({
  open,
  onOpenChange,
  onSelect,
  initialSearch,
}: ClientPickerModalProps) {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useClientModalSelectStore()

  // Se carga al montar (no recién al abrir): así, para cuando el usuario efectivamente toca la
  // lupa, la lista ya está lista o al menos ya arrancó — sin esto, el primer render del modal
  // recién abierto se hacía con isLoading todavía en false (options=[]), que por una vuelta de
  // render mostraba "No se encontraron clientes" antes de que el store avisara que está cargando.
  useEffect(() => {
    void load()
  }, [])

  const handleCreateNew = () => {
    onOpenChange(false)
    setQuickCreateOpen(true)
  }

  const handleCreated = (client: ClientApiItem) => {
    // El cliente recién creado todavía no está en el caché del modal — se recarga para que quede
    // disponible de inmediato si el usuario vuelve a abrir el buscador.
    setForceReload(true)
    void load()
    onSelect(client)
  }

  return (
    <>
      <ModalSelect<ClientApiItem>
        open={open}
        onOpenChange={onOpenChange}
        title="Seleccionar cliente"
        description="Busca por razón social, documento o teléfono."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => {
          setForceReload(true)
          void load()
        }}
        getId={(client) => client.id}
        columns={[
          {
            header: 'Razón social',
            cell: (client) => (
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{client.business_name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {client.document_number ?? 'Sin documento'}
                  {client.phone ? ` · ${client.phone}` : ''}
                </span>
              </div>
            ),
          },
        ]}
        searchPlaceholder="Buscar cliente..."
        emptyMessage="No se encontraron clientes."
        emptyAction={
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleCreateNew}>
            <UserPlus className="size-4" />
            Crear cliente
          </Button>
        }
        selectLabel="Seleccionar"
        onSelect={onSelect}
        onCreateNew={handleCreateNew}
        createLabel="Nuevo"
      />

      <ClientQuickCreateDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        initialName={initialSearch}
        onCreated={handleCreated}
      />
    </>
  )
}
