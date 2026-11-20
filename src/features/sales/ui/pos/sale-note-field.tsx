// src/features/sales/ui/pos/sale-note-field.tsx
'use client'

import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { useSalePosStore } from '../../stores/useSalePosStore'
import { FieldError } from './field-error'

/** Nota opcional de la venta. Casi nunca se usa: queda plegada salvo que ya tenga texto. */
export function SaleNoteField({ error }: { error?: string }) {
  const { observation, setObservation } = useSalePosStore()
  const [open, setOpen] = useState(false)

  if (!open && observation.trim() === '') {
    return (
      <IconButton
        label="Agregar nota a la venta"
        variant="ghost"
        className="text-muted-foreground w-fit"
        onClick={() => setOpen(true)}
        icon={<StickyNote />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="pos-note">Nota</Label>
      <Textarea
        id="pos-note"
        rows={2}
        className="resize-none"
        placeholder="Observación opcional de la venta"
        value={observation}
        autoFocus={open}
        onChange={(e) => setObservation(e.target.value)}
      />
      <FieldError message={error} />
    </div>
  )
}
