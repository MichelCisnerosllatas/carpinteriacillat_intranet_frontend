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
  // Datos web: pie de foto y variante ('before' | 'after' | null = foto normal)
  caption: z.string().nullable(),
  variant: z.string().nullable(),
  stateValue: z.number(),
  statusLabel: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export type FurnitureImage = z.infer<typeof furnitureImageSchema>
