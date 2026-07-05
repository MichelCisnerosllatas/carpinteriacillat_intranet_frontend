import { z } from 'zod'

export const clientStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type ClientStatus = z.infer<typeof clientStatusSchema>

export const clientSchema = z.object({
  id: z.number(),
  idTypedoc: z.number().nullable(),
  typedocName: z.string().nullable(),
  businessName: z.string(),
  documentNumber: z.string().nullable(),
  address: z.string().nullable(),
  contactPerson: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  status: clientStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Client = z.infer<typeof clientSchema>
