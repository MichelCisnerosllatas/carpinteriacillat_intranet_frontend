import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

/**
 * El módulo `section-item-details` (CRUD completo de estos registros) todavía no existe —
 * esta forma es una inferencia mínima y laxa del objeto embebido que trae `section-item` cuando
 * el backend cargó la relación (whenLoaded), solo para pintar la pestaña "Detalles" del detalle
 * de item. Ajustar aquí cuando el módulo real se construya.
 */
export type SectionItemDetailApiItem = {
  id_section_item_detail: number
  sectionitemdetail_title: string | null
  sectionitemdetail_description: string | null
  sectionitemdetail_order: number | null
  sectionitemdetail_state: number
}

export type SectionItemApiItem = {
  id_section_item: number
  id_section: number
  sectionitem_type: string | null
  sectionitem_key: string | null
  sectionitem_title: string | null
  sectionitem_subtitle: string | null
  sectionitem_description: string | null
  sectionitem_label: string | null
  sectionitem_value: string | null
  sectionitem_suffix: string | null
  sectionitem_icon: string | null
  sectionitem_link: string | null
  sectionitem_rating: number | null
  sectionitem_variant: string | null
  sectionitem_latitude: number | null
  sectionitem_longitude: number | null
  sectionitem_order: number | null
  sectionitem_state: number
  sectionitem_created_at: string
  sectionitem_created_at_formatted: string | null
  sectionitem_updated_at: string | null
  sectionitem_updated_at_formatted: string | null
  created_at: string
  updated_at: string | null
  // Config técnica de ESTE item puntual (tabla `section_web_setting` backend, 1 a 1 con
  // `id_section_item`) — le dice al intranet si el tab "Info del item"/"Detalles" del detalle
  // de este item debe mostrarse y si se puede agregar/reordenar/eliminar sub-detalles. Solo
  // viene cuando el backend cargó la relación (whenLoaded); puede venir `null` si el item
  // todavía no tiene fila de settings.
  web_settings?: {
    tab_info: boolean
    tab_details: boolean
    details_add: boolean
    details_reorder: boolean
    details_delete: boolean
  } | null
  /** Solo viene cuando el backend cargó la relación (whenLoaded) — puede venir ausente o como []. */
  details?: SectionItemDetailApiItem[]
}

export type SectionItemListRequestDto = {
  id_section?: number
  type?: string
  search?: string
  state?: number
  per_page?: number
  page?: number
}

export type SectionItemListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionItemApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionItemGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionItemApiItem
}
