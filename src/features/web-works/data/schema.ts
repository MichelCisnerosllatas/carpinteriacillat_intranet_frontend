import { z } from 'zod'

export const webWorkStatusSchema = z.union([z.literal('visible'), z.literal('hidden')])
export type WebWorkStatus = z.infer<typeof webWorkStatusSchema>

export const webWorkImageSchema = z.object({
  id: z.number(),
  idImage: z.number(),
  url: z.string().nullable(),
  name: z.string(),
  caption: z.string().nullable(),
  order: z.number().nullable(),
  visible: z.boolean(),
})
export type WebWorkImage = z.infer<typeof webWorkImageSchema>

const imageRefSchema = z.object({
  idImage: z.number(),
  url: z.string().nullable(),
  name: z.string(),
})

export const webWorkPairSchema = z.object({
  id: z.number(),
  caption: z.string().nullable(),
  order: z.number().nullable(),
  visible: z.boolean(),
  before: imageRefSchema.nullable(),
  after: imageRefSchema.nullable(),
})
export type WebWorkPair = z.infer<typeof webWorkPairSchema>

/** Trabajo de la galería normalizado para la UI (ver mapWebWorkFromApi en useWebWorkListStore). */
export const webWorkSchema = z.object({
  id: z.number(),
  typeworkId: z.number(),
  typeworkKey: z.string(),
  typeworkName: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  categoryId: z.number().nullable(),
  categoryName: z.string().nullable(),
  woodId: z.number().nullable(),
  woodName: z.string().nullable(),
  furnitureId: z.number().nullable(),
  furnitureName: z.string().nullable(),
  coverId: z.number().nullable(),
  coverUrl: z.string().nullable(),
  style: z.string().nullable(),
  measures: z.string().nullable(),
  finish: z.string().nullable(),
  buildTime: z.string().nullable(),
  location: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  priceApprox: z.number().nullable(),
  order: z.number().nullable(),
  status: webWorkStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  imagesCount: z.number(),
  pairsCount: z.number(),
  testimoniesCount: z.number(),
  ratingAvg: z.number().nullable(),
  /** Solo vienen en show / include=media; si no, arreglo vacío. */
  images: z.array(webWorkImageSchema),
  pairs: z.array(webWorkPairSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type WebWork = z.infer<typeof webWorkSchema>
