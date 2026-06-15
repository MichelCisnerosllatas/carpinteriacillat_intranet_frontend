import { z } from 'zod'

export const typeDocStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type TypeDocStatus = z.infer<typeof typeDocStatusSchema>

export const typeDocSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: typeDocStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TypeDoc = z.infer<typeof typeDocSchema>
