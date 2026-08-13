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
  typesectionDescription: z.string().nullable(),
  typesectionStateValue: z.number().nullable(),
  typesectionStateLabel: z.string().nullable(),
  typesectionStateBadge: z.string().nullable(),
  idNavigation: z.number().nullable(),
  navigationName: z.string().nullable(),
  navigationDescription: z.string().nullable(),
  navigationUrl: z.string().nullable(),
  navigationOrder: z.number().nullable(),
  navigationStateValue: z.number().nullable(),
  navigationStateLabel: z.string().nullable(),
  navigationStateBadge: z.string().nullable(),
  order: z.number().nullable(),
  status: sectionStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdAtFormatted: z.string().nullable(),
  updatedAtFormatted: z.string().nullable(),
})

export type Section = z.infer<typeof sectionSchema>
