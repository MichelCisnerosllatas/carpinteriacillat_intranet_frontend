'use client'

import { FieldTip } from '@/shared/ui/field-tip'
import { FormLabel } from '@/shared/ui/form'

/** Nombre del campo, con el ícono de ayuda (i) si el tipo de sección trae una ayuda. */
export function FieldLabel({ label, tip }: { label: string; tip?: string }) {
  return <FormLabel>{tip ? <FieldTip label={label} tip={tip} /> : label}</FormLabel>
}
