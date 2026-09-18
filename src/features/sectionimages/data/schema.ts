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
  /** CSS object-fit ('cover' | 'contain' | 'fill' | 'none' | 'scale-down') — cómo debe encajar la imagen en su contenedor. Viene de `sectionimage_fix`; null = usar 'cover' por defecto. */
  objectFit: z.string().nullable(),
  order: z.number().nullable(),
  status: sectionImageStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdAtFormatted: z.string().nullable(),
  updatedAtFormatted: z.string().nullable(),
})

export type SectionImage = z.infer<typeof sectionImageSchema>
