// src/features/furnitures/data/furniture-form.schema.ts
//
// Schema Zod del formulario de muebles.
import { z } from 'zod'

export const furnitureFormSchema = z.object({
  furniture_name:        z.string().min(1, 'El nombre es requerido.').max(255),
  furniture_title:       z.string().max(255, 'Máximo 255 caracteres.').optional(),
  furniture_description: z.string().max(2000, 'Máximo 2000 caracteres.').optional(),
  furniture_largo:       z.number().nullable().optional(),
  furniture_ancho:       z.number().nullable().optional(),
  furniture_state:       z.number(),
  id_category:           z.number({ error: 'Seleccione la categoría.' }),
  id_typecolor:          z.number({ error: 'Seleccione el tipo de color.' }),
  id_typewood:           z.number({ error: 'Seleccione el tipo de madera.' }),
  id_image:              z.number().nullable().optional(),
})

export type FurnitureFormValues = z.infer<typeof furnitureFormSchema>
