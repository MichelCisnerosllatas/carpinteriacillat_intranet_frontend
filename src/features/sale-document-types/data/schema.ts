import { z } from 'zod'

export const saleDocumentTypeStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SaleDocumentTypeStatus = z.infer<typeof saleDocumentTypeStatusSchema>

export const saleDocumentTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  series: z.string(),
  status: saleDocumentTypeStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SaleDocumentType = z.infer<typeof saleDocumentTypeSchema>
