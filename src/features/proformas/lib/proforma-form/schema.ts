// src/features/proformas/lib/proforma-form/schema.ts
// Definición de datos (Zod) del formulario de cabecera — no es lógica, es la "forma" de los
// datos que el resto de este módulo usa como contrato.
import { z } from 'zod'

export const proformaFormSchema = z
  .object({
    client_id: z.number().nullable(),
    // Campo solo-de-formulario (no se envía en el DTO): el texto libre que escribió/eligió el
    // usuario en <ClientNamePickerField />. `client_id` puede quedar en null hasta que se resuelva
    // en el submit (ver `resolveOrCreateClient` en `submitProformaHeader`).
    client_name: z.string().optional(),
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
    payment_method: z.string().optional(),
  })
  // superRefine en vez de .refine() por campo: agrega los issues sin cambiar el tipo
  // inferido de cada campo (sigue siendo `number | null`, como espera el resto del form).
  .superRefine((data, ctx) => {
    // El cliente ya no exige `client_id` (puede resolverse recién en el submit) — exige que el
    // usuario haya escrito o elegido algún nombre.
    if (!data.client_name || !data.client_name.trim()) {
      ctx.addIssue({ code: 'custom', path: ['client_name'], message: 'El cliente es requerido.' })
    }

    const requiredFields: { key: keyof typeof data; label: string }[] = [
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
