import { z } from 'zod'

export const sectionItemDetailStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionItemDetailStatus = z.infer<typeof sectionItemDetailStatusSchema>

export const sectionItemDetailSchema = z.object({
  id: z.number(),
  idSectionItem: z.number(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  order: z.number().nullable(),
  status: sectionItemDetailStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdAtFormatted: z.string().nullable(),
  updatedAtFormatted: z.string().nullable(),
})

export type SectionItemDetail = z.infer<typeof sectionItemDetailSchema>
