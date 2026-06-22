import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type FurnitureApiItem = {
  id_furniture: number
  furniture_name: string
  furniture_description: string | null
  furniture_largo: number | null
  furniture_ancho: number | null
  furniture_state: number
  id_category: number
  id_typecolor: number
  id_typewood: number
  id_image: number | null
  furniture_created_at: string
  furniture_updated_at: string | null
}

export type FurnitureJoinApiItem = FurnitureApiItem & {
  category: { id_category: number; category_name: string }
  typecolor: { id_typecolor: number; typecolor_name: string }
  typewood:  { id_typewood: number; typewood_name: string }
  image:     { id_image: number; image_name: string; image_url: string } | null
}

export type FurnitureListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type FurnitureListResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type FurnitureJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type FurnitureGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureJoinApiItem
}
