import { z } from 'zod'

export const typeFontStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type TypeFontStatus = z.infer<typeof typeFontStatusSchema>

export const typeFontSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: typeFontStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TypeFont = z.infer<typeof typeFontSchema>
