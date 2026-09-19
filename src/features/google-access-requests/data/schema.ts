import { z } from 'zod'

export const googleAccessRequestStatusSchema = z.union([
  z.literal('pending'),
  z.literal('approved'),
  z.literal('rejected'),
])
export type GoogleAccessRequestStatus = z.infer<typeof googleAccessRequestStatusSchema>

export const googleAccessRequestSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string(),
  photoUrl: z.string().nullable(),
  providerUid: z.string().nullable(),
  provider: z.string(),
  emailVerified: z.boolean(),
  status: googleAccessRequestStatusSchema,
  attempts: z.number(),
  lastAttemptAtFormatted: z.string().nullable(),
  reviewedAtFormatted: z.string().nullable(),
  reviewerEmail: z.string().nullable(),
  idUser: z.number().nullable(),
  createdAtFormatted: z.string(),
})

export type GoogleAccessRequest = z.infer<typeof googleAccessRequestSchema>
