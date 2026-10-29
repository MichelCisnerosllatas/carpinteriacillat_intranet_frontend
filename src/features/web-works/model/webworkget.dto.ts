import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

/** Imagen resumida que manda la API (portada, foto antes/después). `url` ya viene absoluta. */
export type WebWorkImageRefApi = {
  id_image: number
  url: string | null
  name: string | null
}

/** Foto de galería del trabajo (`web_work_images`). */
export type WebWorkImageApiItem = {
  id_web_work_image: number
  id_image: number
  url: string | null
  name: string | null
  webworkimage_caption: string | null
  webworkimage_order: number | null
  webworkimage_state: number
}

/** Par Antes/Después (`web_work_pairs`). Solo restauraciones. */
export type WebWorkPairApiItem = {
  id_web_work_pair: number
  webworkpair_caption: string | null
  webworkpair_order: number | null
  webworkpair_state: number
  before: WebWorkImageRefApi | null
  after: WebWorkImageRefApi | null
}

/** `WebWorkResource` tal cual lo manda la API (ver contrato). */
export type WebWorkApiItem = {
  id_web_work: number
  id_typework: number
  id_furniture: number | null
  id_category: number | null
  id_typewood: number | null
  /** Portada. Si es null y hay fotos, la web usa la primera foto. */
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
  webwork_price_approx: number | string | null
  webwork_order: number | null
  /** 1 = visible en la web, 0 = oculto. */
  webwork_state: number
  webwork_created_at: string | null
  webwork_created_at_formatted?: string | null
  webwork_updated_at: string | null
  webwork_updated_at_formatted?: string | null
  created_at?: string | null
  updated_at?: string | null

  type: { id_typework: number; typework_key: string; typework_name: string } | null
  category: { id_category: number; category_name: string } | null
  wood: { id_typewood: number; typewood_name: string } | null
  furniture: { id_furniture: number; furniture_name: string; furniture_title: string | null } | null
  cover: WebWorkImageRefApi | null
  /** Solo en show, en create/update y en el listado con `include=media`. */
  images?: WebWorkImageApiItem[]
  /** Solo en show, en create/update y en el listado con `include=media`. */
  pairs?: WebWorkPairApiItem[]

  images_count?: number
  pairs_count?: number
  testimonies_count?: number
  rating_avg?: number | null
}

export type WebWorkListRequestDto = {
  search?: string
  /** 1 = visibles, 0 = ocultos. */
  state?: number
  id_typework?: number
  typework_key?: string
  id_category?: number
  id_furniture?: number
  /** `media` = cada item trae además `images` y `pairs`. */
  include?: 'media'
  per_page?: number
  page?: number
}

export type WebWorkListResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebWorkApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type WebWorkGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebWorkApiItem
}

/** GET /web-work/styles → estilos ya usados (para sugerencias). */
export type WebWorkStylesResponseDto = {
  success: boolean
  status: number
  message: string
  data: string[]
}
