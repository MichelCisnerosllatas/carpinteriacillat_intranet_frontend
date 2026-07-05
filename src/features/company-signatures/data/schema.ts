import { z } from 'zod'

export const companySignatureStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type CompanySignatureStatus = z.infer<typeof companySignatureStatusSchema>

export const companySignatureSchema = z.object({
  id: z.number(),
  signerName: z.string(),
  position: z.string().nullable(),
  phone: z.string().nullable(),
  signatureImage: z.string().nullable(),
  status: companySignatureStatusSchema,
  statusLabel: z.string(),
  statusValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CompanySignature = z.infer<typeof companySignatureSchema>
