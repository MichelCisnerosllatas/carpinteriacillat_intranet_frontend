import type { FurnitureWebRequestDto } from './furniture-web.dto'

export type FurniturePostRequestDto = {
  furniture_name: string
  furniture_title?: string | null
  furniture_description?: string
  furniture_largo?: number | null
  furniture_ancho?: number | null
  furniture_state: number
  furniture_order: number
  id_category: number
  id_typecolor: number
  id_typewood: number
  id_image?: number | null
  furniture_created_at: string
  /** Opcional: datos de la galería web. Si no se manda, el backend no toca la galería. */
  web?: FurnitureWebRequestDto
  /** Opcional: usar (true) o quitar (false) la portada en la tarjeta de su categoría. Si no se manda, no se toca. */
  show_cover_on_category_card?: boolean
  /** Opcional: mostrar (true) u ocultar (false) su tarjeta en «Restauración». Si no se manda, no se toca. */
  show_on_restoration?: boolean
}

export type FurniturePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_furniture: number }
  errors?: Record<string, string[]>
}
