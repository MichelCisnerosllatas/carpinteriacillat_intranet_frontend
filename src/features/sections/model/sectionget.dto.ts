import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type SectionApiItem = {
  id_section: number
  section_name: string
  section_title: string | null
  section_description: string | null
  section_content: string | null
  section_order: number | null
  section_state: number
  id_typesection: number
  id_navigation: number | null
  section_created_at: string
  section_updated_at: string | null
}

export type SectionJoinApiItem = SectionApiItem & {
  typesection: { id_typesection: number; typesection_name: string }
  navigation: { id_navigation: number; navigation_name: string } | null
}

export type SectionListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type SectionListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionJoinApiItem
}
