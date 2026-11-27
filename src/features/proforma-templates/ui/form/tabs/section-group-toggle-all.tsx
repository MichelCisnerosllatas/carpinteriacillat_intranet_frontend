'use client'

import { useWatch, type UseFormReturn } from 'react-hook-form'
import { Switch } from '@/shared/ui/switch'
import { FieldTip } from '@/shared/ui/field-tip'
import { type SectionField } from '../../../data/data'
import type { ProformaTemplateFormValues } from '../proforma-template-form.schema'

export function SectionGroupToggleAll({
  form,
  fields,
}: {
  form: UseFormReturn<ProformaTemplateFormValues>
  fields: SectionField[]
}) {
  const values = useWatch({ control: form.control, name: fields.map((f) => f.name) }) as boolean[]
  const allOn = values.every(Boolean)
  return (
    <div className="bg-muted/40 flex items-center justify-between rounded-md border p-3">
      <span className="text-sm font-medium">
        <FieldTip
          label="Activar/desactivar todo"
          tip="Enciende o apaga de un solo golpe todos los elementos de esta sección."
        />
      </span>
      <Switch
        checked={allOn}
        onCheckedChange={(checked) =>
          fields.forEach((f) => form.setValue(f.name, checked as never))
        }
      />
    </div>
  )
}
