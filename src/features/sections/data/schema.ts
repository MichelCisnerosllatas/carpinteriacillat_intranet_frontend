import { z } from 'zod'

export const sectionStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type SectionStatus = z.infer<typeof sectionStatusSchema>

export const sectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  /** Solo lectura — ver `SectionApiItem.section_key`. */
  key: z.string().nullable(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  variant: z.string().nullable(),
  idTypesection: z.number(),
  typesectionKey: z.string().nullable(),
  typesectionName: z.string(),
  typesectionDescription: z.string().nullable(),
  /**
   * Config técnica de ESTA sección puntual (`web_settings`, tabla `section_web_setting`) —
   * qué tabs mostrar en el detalle (ver `useTabQueryParam` en `SectionDetail`) y, para
   * Imágenes/Botones/Items, si se puede agregar/reordenar/eliminar filas (ver
   * `SectionDetailButtonsTab`/`SectionDetailItemsTab`). Dos secciones del mismo tipo pueden
   * tener valores distintos acá — no es config compartida por tipo.
   */
  tabInfo: z.boolean(),
  tabImages: z.boolean(),
  tabButtons: z.boolean(),
  tabItems: z.boolean(),
  imagesAdd: z.boolean(),
  imagesReorder: z.boolean(),
  imagesDelete: z.boolean(),
  buttonsAdd: z.boolean(),
  buttonsReorder: z.boolean(),
  buttonsDelete: z.boolean(),
  itemsAdd: z.boolean(),
  itemsReorder: z.boolean(),
  itemsDelete: z.boolean(),
  typesectionStateValue: z.number().nullable(),
  typesectionStateLabel: z.string().nullable(),
  typesectionStateBadge: z.string().nullable(),
  idNavigation: z.number().nullable(),
  navigationName: z.string().nullable(),
  navigationDescription: z.string().nullable(),
  navigationUrl: z.string().nullable(),
  navigationOrder: z.number().nullable(),
  navigationStateValue: z.number().nullable(),
  navigationStateLabel: z.string().nullable(),
  navigationStateBadge: z.string().nullable(),
  order: z.number().nullable(),
  status: sectionStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdAtFormatted: z.string().nullable(),
  updatedAtFormatted: z.string().nullable(),
})

export type Section = z.infer<typeof sectionSchema>
