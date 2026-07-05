import { z } from 'zod'

export const companyBankAccountSchema = z.object({
  id: z.number(),
  bank: z.string(),
  accountNumber: z.string(),
  accountType: z.string().nullable(),
  currency: z.string(),
  logo: z.string().nullable(),
  order: z.number(),
  status: z.number(),
  statusLabel: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CompanyBankAccount = z.infer<typeof companyBankAccountSchema>
