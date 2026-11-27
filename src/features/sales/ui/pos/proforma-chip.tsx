// src/features/sales/ui/pos/proforma-chip.tsx
import { FileText, X } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'

interface ProformaChipProps {
  code: string
  /** Si no se pasa, el chip es solo informativo (sin botón para quitar). */
  onRemove?: () => void
}

/** "Desde proforma PF26-000012" — indica que la venta se registrará vinculada a esa proforma. */
export function ProformaChip({ code, onRemove }: ProformaChipProps) {
  return (
    <div className="bg-primary/5 text-primary flex w-fit items-center gap-2 rounded-full border py-0.5 pr-1 pl-3 text-xs">
      <FileText className="size-3.5" />
      Desde proforma <span className="font-semibold">{code}</span>
      {onRemove && (
        <IconButton
          label="Quitar vínculo con la proforma (las líneas se mantienen)"
          variant="ghost"
          className="hover:text-destructive size-6 rounded-full"
          onClick={onRemove}
          icon={<X className="size-3.5" />}
        />
      )}
    </div>
  )
}
