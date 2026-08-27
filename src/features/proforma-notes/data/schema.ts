import { z } from 'zod'

export const proformaNoteSchema = z.object({
  id: z.number(),
  proformaId: z.number(),
  text: z.string(),
  order: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProformaNote = z.infer<typeof proformaNoteSchema>
