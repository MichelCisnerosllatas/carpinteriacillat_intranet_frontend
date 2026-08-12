// src/features/sales/lib/sale-form/schema.ts
// Definición de datos (Zod) del formulario de cabecera — no es lógica, es la "forma" de los
// datos que el resto de este módulo usa como contrato.
import { z } from 'zod'

export const saleFormSchema = z
  .object({
    // client_id es NULLABLE de negocio (a diferencia de proformas, donde es requerido) — no se
    // valida como obligatorio en el superRefine de abajo.
    client_id: z.number().nullable(),
    sale_document_type_id: z.number().nullable(),
    issue_date: z.string().min(1, 'La fecha de emisión es requerida.'),
    // `due_date` NO es un campo del formulario a propósito — por decisión de producto, no se usa
    // fecha de vencimiento en Ventas. El API la sigue aceptando (opcional) si algún día se
    // reintroduce, pero no se pide ni se envía desde acá.
    // `is_taxed` NO es un campo del formulario a propósito — el API sí admite mandarlo para
    // hacer una excepción puntual por venta (ver sales.md), pero por decisión de producto acá se
    // usa SIEMPRE la Configuración de Ventas (`igv_enabled_default`): un solo lugar donde se
    // controla el IGV, sin selector redundante en cada venta. `build-header-payload` nunca lo
    // incluye en el POST — el servidor decide solo con `igv_enabled_default`.
    payment_method: z.string().optional(),
    currency: z.string().optional(),
    observation: z.string().optional(),
  })
  // superRefine en vez de .refine() por campo: agrega los issues sin cambiar el tipo inferido de
  // cada campo (sigue siendo `number | null`, como espera el resto del form).
  .superRefine((data, ctx) => {
    if (data.sale_document_type_id == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['sale_document_type_id'],
        message: 'El tipo de comprobante es requerido.',
      })
    }
  })

export type SaleFormValues = z.infer<typeof saleFormSchema>
