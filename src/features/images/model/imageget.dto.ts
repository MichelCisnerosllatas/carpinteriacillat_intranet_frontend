import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'

export type ImageApiItem = {
  id_image: number
  image_name: string | null
  image_title: string | null
  image_alt: string | null
  image_patch: string
  image_type: string | null
  image_size: number | null
  image_width: number | null
  image_height: number | null
  image_created_at: string | null
  image_updated_at: string | null
  // Timestamps reales del registro — el back los devuelve al nivel raíz, no dentro
  // de image_created_at/image_updated_at (esos vienen null). Son los que hay que
  // usar para "más reciente primero".
  created_at?: string | null
  updated_at?: string | null
}

export type ImageListRequestDto = {
  per_page?: number
  page?: number
  search?: string
}

export type ImageListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ImageApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ImageGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ImageApiItem
}
