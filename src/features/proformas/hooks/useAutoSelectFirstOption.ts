// src/features/proformas/hooks/useAutoSelectFirstOption.ts
import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ProformaFormValues } from '../lib/proforma-form'

type SelectableField = 'client_id' | 'proforma_type_id' | 'template_id' | 'signature_id'

/**
 * Autoselecciona el primer ítem de un combobox en cuanto sus opciones cargan — agiliza el
 * llenado al crear. Se llama una vez por combobox en vez de repetir el mismo useEffect para
 * cada uno. El guard `getValues(field) == null` evita pisar una elección manual del usuario si
 * el efecto vuelve a dispararse.
 */
export function useAutoSelectFirstOption(
  form: UseFormReturn<ProformaFormValues>,
  field: SelectableField,
  enabled: boolean,
  options: { id: number }[]
) {
  useEffect(() => {
    if (enabled && options.length > 0 && form.getValues(field) == null) {
      form.setValue(field, options[0].id)
    }
  }, [enabled, options])
}
