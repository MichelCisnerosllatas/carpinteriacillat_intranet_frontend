import { z } from 'zod'

export const proformaTemplateTextSchema = z.object({
  id: z.number(),
  templateId: z.number(),
  key: z.string(),
  title: z.string().nullable(),
  content: z.string().nullable(),
  visible: z.boolean(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProformaTemplateText = z.infer<typeof proformaTemplateTextSchema>
