import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

/**
 * Igual que `section-buttons`, este recurso NO tiene endpoint `_join` — la API ya devuelve las
 * fechas de negocio formateadas (`sectionitemdetail_created_at_formatted` /
 * `sectionitemdetail_updated_at_formatted`) directamente en el recurso plano.
 */
export type SectionItemDetailApiItem = {
  id_section_item_detail: number
  id_section_item: number
  sectionitemdetail_title: string | null
  sectionitemdetail_description: string | null
  sectionitemdetail_order: number | null
  sectionitemdetail_state: number
  sectionitemdetail_created_at: string
  sectionitemdetail_created_at_formatted: string | null
  sectionitemdetail_updated_at: string | null
  sectionitemdetail_updated_at_formatted: string | null
  created_at: string
  updated_at: string | null
}

export type SectionItemDetailListRequestDto = {
  id_section_item?: number
  search?: string
  state?: number
  per_page?: number
  page?: number
}

export type SectionItemDetailListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionItemDetailApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionItemDetailGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionItemDetailApiItem
}
