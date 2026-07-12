// src/features/proformas/lib/proforma-form/schema.ts
// Definición de datos (Zod) del formulario de cabecera — no es lógica, es la "forma" de los
// datos que el resto de este módulo usa como contrato.
import { z } from 'zod'

export const proformaFormSchema = z
  .object({
    client_id: z.number().nullable(),
    proforma_type_id: z.number().nullable(),
    template_id: z.number().nullable(),
    signature_id: z.number().nullable(),
    series: z.string().max(20, 'Máximo 20 caracteres.').optional(),
    issue_date: z.string().min(1, 'La fecha de emisión es requerida.'),
    due_date: z.string().optional(),
    place_of_issue: z.string().optional(),
    client_attention: z.string().optional(),
    delivery_time: z.string().optional(),
    currency: z.string().optional(),
    observation: z.string().optional(),
  })
  // superRefine en vez de .refine() por campo: agrega los issues sin cambiar el tipo
  // inferido de cada campo (sigue siendo `number | null`, como espera el resto del form).
  .superRefine((data, ctx) => {
    const requiredFields: { key: keyof typeof data; label: string }[] = [
      { key: 'client_id', label: 'El cliente' },
      { key: 'proforma_type_id', label: 'El tipo de proforma' },
      { key: 'template_id', label: 'La plantilla' },
      { key: 'signature_id', label: 'La firma' },
    ]
    for (const { key, label } of requiredFields) {
      if (data[key] == null) {
        ctx.addIssue({ code: 'custom', path: [key], message: `${label} es requerido.` })
      }
    }
  })

export type ProformaFormValues = z.infer<typeof proformaFormSchema>
