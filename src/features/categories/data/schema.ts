import { z } from 'zod'

export const categoryStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type CategoryStatus = z.infer<typeof categoryStatusSchema>

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: categoryStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Category = z.infer<typeof categorySchema>
