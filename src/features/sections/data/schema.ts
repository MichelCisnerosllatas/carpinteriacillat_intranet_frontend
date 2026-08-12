import { z } from 'zod'

export const sectionStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionStatus = z.infer<typeof sectionStatusSchema>

export const sectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  idTypesection: z.number(),
  typesectionName: z.string(),
  idNavigation: z.number().nullable(),
  navigationName: z.string().nullable(),
  order: z.number().nullable(),
  status: sectionStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Section = z.infer<typeof sectionSchema>
