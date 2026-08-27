import { z } from 'zod'

export const contactMessageStatusSchema = z.union([
  z.literal('nuevo'),
  z.literal('atendido'),
  z.literal('descartado'),
])
export type ContactMessageStatus = z.infer<typeof contactMessageStatusSchema>

export const contactMessageProjectTypeSchema = z.union([
  z.literal('cocina'),
  z.literal('closet_dormitorio'),
  z.literal('oficina'),
  z.literal('puertas_ventanas'),
  z.literal('restauracion'),
  z.literal('otro'),
])
export type ContactMessageProjectType = z.infer<typeof contactMessageProjectTypeSchema>

export const contactMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  projectType: contactMessageProjectTypeSchema.nullable(),
  message: z.string(),
  status: contactMessageStatusSchema,
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
  createdAtFormatted: z.string(),
  updatedAt: z.string(),
  updatedAtFormatted: z.string(),
})

export type ContactMessage = z.infer<typeof contactMessageSchema>
