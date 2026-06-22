import { z } from 'zod'

export const sectionImageStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionImageStatus = z.infer<typeof sectionImageStatusSchema>

export const sectionImageSchema = z.object({
  id: z.number(),
  idSection: z.number(),
  sectionName: z.string(),
  idImage: z.number(),
  imageName: z.string(),
  imageUrl: z.string(),
  status: sectionImageStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SectionImage = z.infer<typeof sectionImageSchema>
