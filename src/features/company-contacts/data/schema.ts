import { z } from 'zod'

export const companyContactTypeSchema = z.union([
  z.literal('phone'),
  z.literal('mobile'),
  z.literal('fax'),
  z.literal('whatsapp'),
])
export type CompanyContactTypeUi = z.infer<typeof companyContactTypeSchema>

export const companyContactStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type CompanyContactStatus = z.infer<typeof companyContactStatusSchema>

export const companyContactSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  phone: z.string(),
  type: companyContactTypeSchema,
  email: z.string().nullable(),
  isPrimary: z.boolean(),
  showOnWebsite: z.boolean(),
  order: z.number(),
  status: companyContactStatusSchema,
  statusLabel: z.string(),
  statusValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CompanyContact = z.infer<typeof companyContactSchema>
