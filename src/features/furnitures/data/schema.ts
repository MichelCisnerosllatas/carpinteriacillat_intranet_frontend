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

export const furnitureSchema = z.object({
  id: z.number(),
  name: z.string(),
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
  status: furnitureStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Furniture = z.infer<typeof furnitureSchema>
