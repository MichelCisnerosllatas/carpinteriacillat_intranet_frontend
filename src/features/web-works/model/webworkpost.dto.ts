import type { WebWorkApiItem } from './webworkget.dto'

/**
 * Foto de galería en el body de POST/PUT.
 * Con `id_web_work_image` → se actualiza esa fila; sin él → se crea.
 * El orden es el índice del arreglo + 1.
 */
export type WebWorkImageInputDto = {
  id_web_work_image?: number
  id_image: number
  webworkimage_caption: string | null
  webworkimage_state: number
}

/**
 * Par Antes/Después en el body de POST/PUT (solo si el tipo es `restoration`).
 * Con `id_web_work_pair` → se actualiza; sin él → se crea. Orden = índice + 1.
 */
export type WebWorkPairInputDto = {
  id_web_work_pair?: number
  id_image_before: number
  id_image_after: number
  webworkpair_caption: string | null
  webworkpair_state: number
}

/** Campos comunes del trabajo (POST/PUT). */
export type WebWorkBaseBodyDto = {
  id_typework: number
  id_furniture: number | null
  id_category: number | null
  id_typewood: number | null
  id_image: number | null
  webwork_title: string
  webwork_description: string | null
  webwork_style: string | null
  webwork_measures: string | null
  webwork_finish: string | null
  webwork_build_time: string | null
  webwork_location: string | null
  /** `YYYY-MM-DD` */
  webwork_delivered_at: string | null
  webwork_price_approx: number | null
  webwork_state: number
  /**
   * Si la clave viene → se SINCRONIZA (con id = update, sin id = create, las que faltan = delete).
   * Si NO viene → no se tocan.
   */
  images?: WebWorkImageInputDto[]
  /** Misma semántica que `images`. Con elementos solo se acepta si el tipo es `restoration`. */
  pairs?: WebWorkPairInputDto[]
}

export type WebWorkPostRequestDto = WebWorkBaseBodyDto & {
  /** `Y-m-d H:i:s` */
  webwork_created_at: string
}

export type WebWorkPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebWorkApiItem
  errors?: Record<string, string[]>
}
