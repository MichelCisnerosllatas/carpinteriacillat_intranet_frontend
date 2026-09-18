import { z } from 'zod'

export const sectionButtonStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionButtonStatus = z.infer<typeof sectionButtonStatusSchema>

export const sectionButtonSchema = z.object({
  id: z.number(),
  idSection: z.number(),
  label: z.string(),
  url: z.string().nullable(),
  icon: z.string().nullable(),
  variant: z.string().nullable(),
  // Discriminador estable sembrado solo por seeders (ej. "contact-form-submit") — solo
  // lectura, nunca se envía en create/update. Cuando trae valor, este botón ejecuta lógica
  // propia del frontend web en vez de navegar a `url`, así que el form debe deshabilitar el
  // campo URL para él (ver section-button-form.tsx).
  actionKey: z.string().nullable(),
  order: z.number().nullable(),
  status: sectionButtonStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdAtFormatted: z.string().nullable(),
  updatedAtFormatted: z.string().nullable(),
})

export type SectionButton = z.infer<typeof sectionButtonSchema>
