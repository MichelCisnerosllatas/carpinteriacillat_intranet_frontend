import { z } from 'zod'

export const saleSettingSchema = z.object({
  id: z.number(),
  igvRate: z.number(),
  igvEnabledDefault: z.number(),
  igvEnabledDefaultBool: z.boolean(),
  status: z.number(),
  statusLabel: z.string(),
  statusValue: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export type SaleSetting = z.infer<typeof saleSettingSchema>
