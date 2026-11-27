import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

/**
 * A diferencia de `sections`/`sectionimages`, este recurso NO tiene endpoint `_join` — la API
 * ya devuelve las fechas de negocio formateadas (`sectionbutton_created_at_formatted` /
 * `sectionbutton_updated_at_formatted`) directamente en el recurso plano.
 */
export type SectionButtonApiItem = {
  id_section_button: number
  id_section: number
  sectionbutton_label: string
  sectionbutton_url: string | null
  sectionbutton_icon: string | null
  sectionbutton_variant: string | null
  sectionbutton_action_key: string | null
  sectionbutton_order: number | null
  sectionbutton_state: number
  sectionbutton_created_at: string
  sectionbutton_created_at_formatted: string | null
  sectionbutton_updated_at: string | null
  sectionbutton_updated_at_formatted: string | null
  created_at: string
  updated_at: string | null
}

export type SectionButtonListRequestDto = {
  id_section?: number
  search?: string
  state?: number
  per_page?: number
  page?: number
}

export type SectionButtonListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionButtonApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionButtonGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionButtonApiItem
}
