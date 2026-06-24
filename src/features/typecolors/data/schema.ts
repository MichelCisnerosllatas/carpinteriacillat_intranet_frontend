import { z } from 'zod'

export const typeColorStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type TypeColorStatus = z.infer<typeof typeColorStatusSchema>

export const typeColorSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  hex: z.string().nullable(),
  image: z.string().nullable(),
  sortOrder: z.number(),
  description: z.string().nullable(),
  status: typeColorStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TypeColor = z.infer<typeof typeColorSchema>
