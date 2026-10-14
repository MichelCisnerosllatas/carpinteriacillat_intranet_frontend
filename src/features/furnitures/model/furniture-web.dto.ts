// src/features/furnitures/model/furniture-web.dto.ts
//
// Datos públicos de un mueble en la "Galería de trabajos" del sitio web (tabla `furniture_web`).
// Se separan de `furnitures` porque esa tabla es general del negocio y no se modifica.

/** Lo que devuelve el backend dentro de `web` en FurnitureJoinResource (o null si nunca se publicó). */
export type FurnitureWebApiItem = {
  id_furniture_web: number
  furnitureweb_title: string | null
  furnitureweb_style: string | null
  furnitureweb_measures: string | null
  furnitureweb_finish: string | null
  furnitureweb_build_time: string | null
  furnitureweb_location: string | null
  furnitureweb_delivered_at: string | null
  // Laravel puede mandar los decimal como string ("6800.00"), por eso se acepta ambos.
  furnitureweb_price_approx: number | string | null
  furnitureweb_order: number | null
  furnitureweb_state: number
}

/**
 * Objeto `web` que se manda al crear/editar un mueble.
 * - publish=true  → el backend crea/actualiza la fila y la deja visible (state 1).
 * - publish=false → si existe, la oculta (state 0) pero conserva los datos.
 * Si no se manda `web`, el backend no toca la galería.
 */
export type FurnitureWebRequestDto = {
  publish: boolean
  furnitureweb_title?: string | null
  furnitureweb_style?: string | null
  furnitureweb_measures?: string | null
  furnitureweb_finish?: string | null
  furnitureweb_build_time?: string | null
  furnitureweb_location?: string | null
  furnitureweb_delivered_at?: string | null
  furnitureweb_price_approx?: number | null
}

/** Respuesta de GET /v1/intranet/furniture-web/styles — estilos ya usados, para sugerencias. */
export type FurnitureWebStylesResponseDto = {
  success: boolean
  status: number
  message: string
  data: string[]
}
