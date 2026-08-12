import { z } from 'zod'

export const salePaymentSchema = z.object({
  id: z.number(),
  saleId: z.number(),
  amount: z.number(),
  paymentDate: z.string(),
  paymentMethod: z.string().nullable(),
  observation: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SalePayment = z.infer<typeof salePaymentSchema>
