import { z } from 'zod'

export const categoryStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type CategoryStatus = z.infer<typeof categoryStatusSchema>

// Tarjeta de la categoría en el carrusel «Muebles a medida» de la web (atajo "Mostrar en la web").
export const categoryWebSchema = z.object({
  showOnWeb: z.boolean(),
  /** Sección del carrusel (para el enlace "Ver sección →"). */
  idSection: z.number().nullable(),
  idSectionItem: z.number().nullable(),
})

export type CategoryWeb = z.infer<typeof categoryWebSchema>

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: categoryStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** null si el backend no mandó `web`. */
  web: categoryWebSchema.nullable(),
})

export type Category = z.infer<typeof categorySchema>
