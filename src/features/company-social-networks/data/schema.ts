import { z } from 'zod'

export const companySocialNetworkStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type CompanySocialNetworkStatus = z.infer<typeof companySocialNetworkStatusSchema>

export const companySocialNetworkSchema = z.object({
  id: z.number(),
  name: z.string(),
  link: z.string(),
  showOnWebsite: z.boolean(),
  order: z.number(),
  status: companySocialNetworkStatusSchema,
  statusLabel: z.string(),
  statusValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CompanySocialNetwork = z.infer<typeof companySocialNetworkSchema>
