import { z } from 'zod'

export const furnitureStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type FurnitureStatus = z.infer<typeof furnitureStatusSchema>

export const galleryImageSchema = z.object({
  id: z.number(),
  imageId: z.number(),
  imageUrl: z.string().nullable(),
  imageName: z.string().nullable(),
})

export type GalleryImage = z.infer<typeof galleryImageSchema>

// Trabajo de la galería web (web_works) que usa este mueble — solo lectura.
export const furnitureWebWorkSchema = z.object({
  id: z.number(),
  title: z.string(),
  /** 1 = publicado en la web · 0 = oculto. */
  state: z.number(),
  /** 'manufacture' | 'restoration' (o null si el backend no lo mandó). */
  typeworkKey: z.string().nullable(),
})

export type FurnitureWebWork = z.infer<typeof furnitureWebWorkSchema>

export const furnitureSchema = z.object({
  id: z.number(),
  name: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  largo: z.number().nullable(),
  ancho: z.number().nullable(),
  idCategory: z.number(),
  categoryName: z.string(),
  idTypecolor: z.number(),
  typecolorName: z.string(),
  idTypewood: z.number(),
  typewoodName: z.string(),
  idImage: z.number().nullable(),
  imageName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  galleryImages: z.array(galleryImageSchema),
  /** Trabajos de la galería web que usan este mueble ([] si ninguno). */
  webWorks: z.array(furnitureWebWorkSchema),
  status: furnitureStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Furniture = z.infer<typeof furnitureSchema>
