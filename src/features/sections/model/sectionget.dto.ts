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
  id_type_section: number
  id_navigation: number | null
  section_created_at: string
  section_updated_at: string | null
}

/**
 * El endpoint `_join` (indexJoin/showJoin) NO trae `id_type_section`/`id_navigation` planos —
 * los reemplaza por los objetos anidados `type_section`/`navigation` (ver SectionJoinResource en el backend).
 * Además trae las fechas de negocio ya formateadas (`section_created_at_format`/`section_updated_at_format`,
 * ojo: sin "ted" — nombre distinto al que usa el endpoint plano) y la info completa de cada relación.
 */
export type SectionJoinApiItem = Omit<SectionApiItem, 'id_type_section' | 'id_navigation'> & {
  section_created_at_format: string | null
  section_updated_at_format: string | null
  type_section: {
    id_typesection: number
    typesection_name: string
    typesection_description: string | null
    typesection_state: number
  }
  navigation: {
    id_navigation: number
    navigation_name: string
    navigation_description: string | null
    navigation_url: string | null
    navigation_order: number | null
    navigation_state: number
  } | null
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
