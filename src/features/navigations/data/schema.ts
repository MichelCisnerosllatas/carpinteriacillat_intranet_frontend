import { z } from 'zod'

export const navigationStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type NavigationStatus = z.infer<typeof navigationStatusSchema>

export const navigationSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  order: z.number(),
  status: navigationStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Navigation = z.infer<typeof navigationSchema>
