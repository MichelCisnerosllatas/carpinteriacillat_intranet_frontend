import { z } from 'zod'

export const furnitureImageSchema = z.object({
  id: z.number(),
  furnitureId: z.number(),
  furnitureName: z.string(),
  imageId: z.number(),
  imageUrl: z.string().nullable(),
  imagePatch: z.string().nullable(),
  imageName: z.string().nullable(),
  imageTitle: z.string().nullable(),
  imageAlt: z.string().nullable(),
  order: z.number().nullable(),
  stateValue: z.number(),
  statusLabel: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export type FurnitureImage = z.infer<typeof furnitureImageSchema>
