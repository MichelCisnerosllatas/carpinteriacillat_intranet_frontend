import { z } from 'zod'

export const typeSectionStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type TypeSectionStatus = z.infer<typeof typeSectionStatusSchema>

export const typeSectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: typeSectionStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TypeSection = z.infer<typeof typeSectionSchema>
