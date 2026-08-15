import { z } from 'zod'

export const companyBranchStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type CompanyBranchStatus = z.infer<typeof companyBranchStatusSchema>

export const companyBranchSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  schedule: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  status: companyBranchStatusSchema,
  statusLabel: z.string(),
  statusValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CompanyBranch = z.infer<typeof companyBranchSchema>
