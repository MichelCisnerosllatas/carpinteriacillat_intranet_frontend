import { z } from 'zod'

export const companySettingSchema = z.object({
  id: z.number(),
  businessName: z.string(),
  tradeName: z.string().nullable(),
  taxId: z.string().nullable(),
  taxAddress: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  facebook: z.string().nullable(),
  website: z.string().nullable(),
  logo: z.string().nullable(),
  status: z.number(),
  statusLabel: z.string(),
  statusValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
})

export type CompanySetting = z.infer<typeof companySettingSchema>
