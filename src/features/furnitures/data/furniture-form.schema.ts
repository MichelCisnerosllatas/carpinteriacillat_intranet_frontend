// src/features/furnitures/data/furniture-form.schema.ts
//
// Schema Zod del formulario de muebles. Vive aquí (y no dentro de furniture-form.tsx) porque
// lo usan dos componentes: el formulario y la tarjeta de la galería web (furniture-web-card.tsx).
import { z } from 'zod'
import type { FurnitureWebRequestDto } from '../model/furniture-web.dto'
import type { FurnitureWeb } from './schema'

// Campos de la "Galería de trabajos" del sitio web. Se guardan como texto ('' = vacío)
// porque así funcionan los <Input>; al enviar, los '' se convierten en null.
export const furnitureWebFormSchema = z.object({
  publish:                   z.boolean(),
  furnitureweb_style:        z.string().max(100, 'Máximo 100 caracteres.'),
  furnitureweb_measures:     z.string().max(100, 'Máximo 100 caracteres.'),
  furnitureweb_finish:       z.string().max(150, 'Máximo 150 caracteres.'),
  furnitureweb_build_time:   z.string().max(100, 'Máximo 100 caracteres.'),
  furnitureweb_location:     z.string().max(150, 'Máximo 150 caracteres.'),
  furnitureweb_delivered_at: z.string(),
  furnitureweb_price_approx: z.number().min(0, 'No puede ser negativo.').nullable(),
})

export type FurnitureWebFormValues = z.infer<typeof furnitureWebFormSchema>

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
  web:                   furnitureWebFormSchema.optional(),
  // Atajo: usar la portada en la tarjeta de su categoría (carrusel «Muebles a medida»)
  show_cover_on_category_card: z.boolean(),
  // Atajo: mostrar su tarjeta en «Restauración» (comparador antes/después)
  show_on_restoration: z.boolean(),
})

export type FurnitureFormValues = z.infer<typeof furnitureFormSchema>

/** Valores iniciales de la parte web: si el mueble ya tiene datos web se precargan. */
export function furnitureWebToFormValues(web: FurnitureWeb | null | undefined): FurnitureWebFormValues {
  return {
    publish:                   web?.state === 1,
    furnitureweb_style:        web?.style ?? '',
    furnitureweb_measures:     web?.measures ?? '',
    furnitureweb_finish:       web?.finish ?? '',
    furnitureweb_build_time:   web?.buildTime ?? '',
    furnitureweb_location:     web?.location ?? '',
    furnitureweb_delivered_at: web?.deliveredAt ?? '',
    furnitureweb_price_approx: web?.priceApprox ?? null,
  }
}

/** Convierte un texto vacío en null (el backend espera null, no ''). */
const emptyToNull = (value: string) => (value.trim() === '' ? null : value.trim())

/** Arma el objeto `web` que espera el backend a partir de lo que tiene el formulario. */
export function furnitureWebToRequest(web: FurnitureWebFormValues): FurnitureWebRequestDto {
  return {
    publish:                   web.publish,
    furnitureweb_style:        emptyToNull(web.furnitureweb_style),
    furnitureweb_measures:     emptyToNull(web.furnitureweb_measures),
    furnitureweb_finish:       emptyToNull(web.furnitureweb_finish),
    furnitureweb_build_time:   emptyToNull(web.furnitureweb_build_time),
    furnitureweb_location:     emptyToNull(web.furnitureweb_location),
    furnitureweb_delivered_at: emptyToNull(web.furnitureweb_delivered_at),
    furnitureweb_price_approx: web.furnitureweb_price_approx,
  }
}
