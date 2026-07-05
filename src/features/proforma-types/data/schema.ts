import { z } from 'zod'

export const proformaTypeStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type ProformaTypeStatus = z.infer<typeof proformaTypeStatusSchema>

export const proformaTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  status: proformaTypeStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProformaType = z.infer<typeof proformaTypeSchema>
