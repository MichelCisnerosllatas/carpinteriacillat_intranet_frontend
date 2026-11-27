// src/features/sales/ui/pos/proforma-import-modal.tsx
'use client'

import { useEffect } from 'react'
import { ModalSelect } from '@/shared/ui/modal-select'
import { useAcceptedProformaSelectStore, type AcceptedProformaOption } from '@/features/proformas'
import { formatMoney } from '../../lib/sale-pos'

interface ProformaImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (proformaId: number) => void
}

/** Modal (F4) con las proformas ACEPTADAS sin venta. Mismo manejo de teclado que los demás
 * buscadores: escribir filtra, ↑↓ mueve, Enter elige, Esc cierra. */
export function ProformaImportModal({ open, onOpenChange, onSelect }: ProformaImportModalProps) {
  const { options, isLoading, isError, load } = useAcceptedProformaSelectStore()

  // Se recarga cada vez que se abre: una proforma deja de ser convertible apenas se vende.
  useEffect(() => {
    if (open) void load()
  }, [open])

  return (
    <ModalSelect<AcceptedProformaOption>
      open={open}
      onOpenChange={onOpenChange}
      title="Importar proforma"
      description="Solo se muestran proformas aceptadas que todavía no tienen venta."
      data={options}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void load()}
      getId={(p) => p.id}
      filterFn={(p, search) => {
        const term = search.trim().toLowerCase()
        if (!term) return true
        return p.code.toLowerCase().includes(term) || p.clientName.toLowerCase().includes(term)
      }}
      columns={[
        { header: 'Código', cell: (p) => p.code, className: 'w-32 font-medium' },
        { header: 'Cliente', cell: (p) => p.clientName },
        { header: 'Fecha', cell: (p) => p.issueDate, className: 'w-28' },
        {
          header: 'Total',
          cell: (p) => formatMoney(p.total, p.currency),
          className: 'w-32 text-right tabular-nums',
        },
      ]}
      searchPlaceholder="Buscar por código o cliente..."
      emptyMessage="No hay proformas aceptadas pendientes de venta."
      selectLabel="Importar"
      onSelect={(p) => onSelect(p.id)}
    />
  )
}
