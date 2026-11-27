import { z } from 'zod'

export const typeWorkStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type TypeWorkStatus = z.infer<typeof typeWorkStatusSchema>

export const typeWorkSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: typeWorkStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  webWorksCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TypeWork = z.infer<typeof typeWorkSchema>
