import { z } from 'zod'

export const typeWoodStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type TypeWoodStatus = z.infer<typeof typeWoodStatusSchema>

export const typeWoodSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: typeWoodStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TypeWood = z.infer<typeof typeWoodSchema>
