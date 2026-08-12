import { z } from 'zod'

export const saleDetailSchema = z.object({
  id: z.number(),
  saleId: z.number(),
  productServiceId: z.number().nullable(),
  description: z.string(),
  unit: z.string().nullable(),
  quantity: z.number(),
  unitPrice: z.number(),
  subtotal: z.number(),
  tax: z.number().nullable(),
  total: z.number(),
  order: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SaleDetail = z.infer<typeof saleDetailSchema>
