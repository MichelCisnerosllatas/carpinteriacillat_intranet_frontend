import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type SectionApiItem = {
  id_section: number
  section_name: string
  /** Clave interna estable (ej. "home-contact") — solo lectura, la usa `SectionRenderer.tsx` del sitio web para elegir qué componente renderiza esta sección. No forma parte del formulario de edición. */
  section_key: string | null
  section_title: string | null
  section_subtitle: string | null
  section_description: string | null
  section_content: string | null
  section_variant: string | null
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
  /**
   * Config técnica de ESTA sección puntual (tabla `section_web_setting`, 1 a 1 con
   * `sections`, no con `type_sections`) — dos secciones que comparten el mismo
   * `typesection_key` (ej. dos "hero" en páginas distintas) tienen cada una SU PROPIA fila,
   * editable por separado. `null` = esta sección todavía no tiene fila de settings; el store
   * lo trata igual que "todo permitido/visible" (ver `useSectionListStore.mapFromApi`).
   */
  web_settings: {
    show_title: boolean
    show_subtitle: boolean
    show_description: boolean
    tab_info: boolean
    tab_images: boolean
    tab_buttons: boolean
    tab_items: boolean
    images_add: boolean
    images_reorder: boolean
    images_delete: boolean
    buttons_add: boolean
    buttons_reorder: boolean
    buttons_delete: boolean
    items_add: boolean
    items_reorder: boolean
    items_delete: boolean
  } | null
  type_section: {
    id_typesection: number
    typesection_key: string | null
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
