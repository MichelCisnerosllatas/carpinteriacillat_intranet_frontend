import { z } from 'zod'

export const sectionItemStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionItemStatus = z.infer<typeof sectionItemStatusSchema>

export const sectionItemDetailStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionItemDetailStatus = z.infer<typeof sectionItemDetailStatusSchema>

/**
 * Forma mínima del detalle embebido (`details[]`) que trae la respuesta de section-item cuando
 * el backend cargó la relación (whenLoaded). El módulo `section-item-details` (CRUD completo de
 * estos registros) todavía no existe — no depender de él aquí, solo de esta forma laxa.
 */
export type SectionItemDetailSummary = {
  id: number
  title: string | null
  description: string | null
  order: number | null
  status: SectionItemDetailStatus
}

export const sectionItemSchema = z.object({
  id: z.number(),
  idSection: z.number(),
  type: z.string().nullable(),
  key: z.string().nullable(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  label: z.string().nullable(),
  value: z.string().nullable(),
  suffix: z.string().nullable(),
  icon: z.string().nullable(),
  link: z.string().nullable(),
  rating: z.number().nullable(),
  variant: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  order: z.number().nullable(),
  status: sectionItemStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdAtFormatted: z.string().nullable(),
  updatedAtFormatted: z.string().nullable(),
  // Config técnica de ESTE item (`web_settings`, tabla `section_web_setting`) — ver docblock de
  // `SectionItemApiItem.web_settings` (DTO). "Info" también es configurable ahora.
  tabInfo: z.boolean(),
  tabDetails: z.boolean(),
  detailsAdd: z.boolean(),
  detailsReorder: z.boolean(),
  detailsDelete: z.boolean(),
  // Laxo a propósito (ver SectionItemDetailSummary) — no se valida su forma con zod.
  details: z.array(z.any()).optional(),
})

export type SectionItem = Omit<z.infer<typeof sectionItemSchema>, 'details'> & {
  details?: SectionItemDetailSummary[]
}
