import { z } from 'zod'

export const productServiceStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type ProductServiceStatus = z.infer<typeof productServiceStatusSchema>

export const productServiceTypeSchema = z.union([z.literal('product'), z.literal('service')])
export type ProductServiceTypeUi = z.infer<typeof productServiceTypeSchema>

const lightboxImageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
})

export const productServiceSchema = z.object({
  id: z.number(),
  furnitureId: z.number().nullable(),
  furnitureName: z.string().nullable(),
  furnitureCategory: z.string().nullable(),
  furnitureColor: z.string().nullable(),
  furnitureWood: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  galleryImages: z.array(lightboxImageSchema),
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string().nullable(),
  defaultPrice: z.number(),
  type: productServiceTypeSchema,
  status: productServiceStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProductService = z.infer<typeof productServiceSchema>
