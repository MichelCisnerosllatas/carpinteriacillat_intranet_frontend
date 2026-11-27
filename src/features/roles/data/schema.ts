import { z } from 'zod'

export const roleStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type RoleStatus = z.infer<typeof roleStatusSchema>

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  /** Identificador fijo del rol, ej: 'superadmin'. */
  slug: z.string().nullable(),
  description: z.string().nullable(),
  /** true = rol del sistema (superadmin): no se edita, no se borra ni cambia de estado. */
  isSystem: z.boolean(),
  status: roleStatusSchema,
  statusLabel: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Role = z.infer<typeof roleSchema>
