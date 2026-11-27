import { z } from 'zod'

export const sectionImageStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionImageStatus = z.infer<typeof sectionImageStatusSchema>

export const sectionImageSchema = z.object({
  id: z.number(),
  idSection: z.number(),
  sectionName: z.string(),
  /** Nombre de la página (navegación) de la sección, ej. "Servicios". null si no tiene. */
  navigationName: z.string().nullable(),
  idImage: z.number(),
  imageName: z.string(),
  imageUrl: z.string(),
  /** CSS object-fit ('cover' | 'contain' | 'fill' | 'none' | 'scale-down') — cómo debe encajar la imagen en su contenedor. Viene de `sectionimage_fix`; null = usar 'cover' por defecto. */
  objectFit: z.string().nullable(),
  // Textos opcionales que acompañan a la foto en el sitio web
  title: z.string().nullable(),
  description: z.string().nullable(),
  label: z.string().nullable(),
  link: z.string().nullable(),
  linkLabel: z.string().nullable(),
  variant: z.string().nullable(),
  /** Item de la sección al que pertenece la foto — null = foto general de la sección. */
  idSectionItem: z.number().nullable(),
  sectionItemTitle: z.string().nullable(),
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
