import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type SectionImageApiItem = {
  id_sectionimage: number
  id_section: number
  id_image: number
  sectionimage_state: number
  sectionimage_created_at: string
  sectionimage_updated_at: string | null
}

export type SectionImageJoinApiItem = SectionImageApiItem & {
  section: { id_section: number; section_name: string }
  image: { id_image: number; image_name: string; image_url: string }
}

export type SectionImageListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type SectionImageListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionImageApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionImageJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionImageJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionImageGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionImageJoinApiItem
}
