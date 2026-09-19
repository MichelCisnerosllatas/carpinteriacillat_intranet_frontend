import { z } from 'zod'

export const testimonyStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type TestimonyStatus = z.infer<typeof testimonyStatusSchema>

export const testimonySchema = z.object({
  id: z.number(),
  idSection: z.number(),
  // Solo viene resuelto vía el endpoint `_join` (lista y detalle) — en los endpoints planos
  // (post/put/patch/delete) no aplica.
  sectionName: z.string().optional(),
  idImage: z.number().nullable(),
  imageUrl: z.string().optional(),
  name: z.string(),
  role: z.string().nullable(),
  city: z.string().nullable(),
  email: z.string().nullable(),
  rating: z.number().nullable(),
  message: z.string(),
  isDelivered: z.boolean(),
  isVerified: z.boolean(),
  order: z.number().nullable(),
  status: testimonyStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  /** Solo viene informado en el listado — si esta fila cae dentro del `testimony_limit` configurado y realmente se ve en el carrusel del sitio web ahora mismo. */
  isVisibleOnWeb: z.boolean().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdAtFormatted: z.string().nullable(),
  updatedAtFormatted: z.string().nullable(),
})

export type Testimony = z.infer<typeof testimonySchema>
