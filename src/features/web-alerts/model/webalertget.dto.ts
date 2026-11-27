// Tipos de lo que RESPONDE la API al pedir alertas del sitio (listado y una sola alerta).
// Los nombres de los campos son exactamente los que manda el backend.

import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

/** Una alerta tal cual la manda la API (`WebAlertsResource`). */
export type WebAlertApiItem = {
  id_web_alert: number
  webalert_title: string | null
  webalert_subtitle: string | null
  /** promo · info · warning · success */
  webalert_style: string
  /** left · center · right */
  webalert_align: string
  webalert_show_icon: boolean
  /** none · arrow · button */
  webalert_trailing: string
  webalert_trailing_label: string | null
  webalert_link_url: string | null
  webalert_dismissible: boolean
  /** hide (se oculta al bajar) · sticky (se queda visible) */
  webalert_scroll_behavior: string
  /** `YYYY-MM-DD HH:mm:ss` o null */
  webalert_starts_at: string | null
  webalert_starts_at_formatted?: string | null
  /** `YYYY-MM-DD HH:mm:ss` o null */
  webalert_ends_at: string | null
  webalert_ends_at_formatted?: string | null
  webalert_order: number | null
  /** 1 = activada, 0 = desactivada */
  webalert_state: number
  /** Lo calcula el backend con su hora: showing · scheduled · expired · off */
  visibility_status: string
  webalert_created_at: string | null
  webalert_created_at_formatted?: string | null
  webalert_updated_at: string | null
  webalert_updated_at_formatted?: string | null
}

/** Filtros que acepta GET /web-alert */
export type WebAlertListRequestDto = {
  search?: string
  /** 1 = activadas, 0 = desactivadas */
  state?: number
  per_page?: number
  page?: number
}

export type WebAlertListResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebAlertApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type WebAlertGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebAlertApiItem
}
