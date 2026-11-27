// Tipos para CREAR una alerta (POST /web-alert): lo que se envía y lo que responde la API.

import type { WebAlertApiItem } from './webalertget.dto'

/** Campos de la alerta que se envían al crear o editar. */
export type WebAlertBodyDto = {
  webalert_title: string | null
  webalert_subtitle: string | null
  webalert_style: string
  webalert_align: string
  webalert_show_icon: boolean
  webalert_trailing: string
  webalert_trailing_label: string | null
  webalert_link_url: string | null
  webalert_dismissible: boolean
  webalert_scroll_behavior: string
  /** `YYYY-MM-DD HH:mm:ss` o null (sin límite) */
  webalert_starts_at: string | null
  /** `YYYY-MM-DD HH:mm:ss` o null (sin límite) */
  webalert_ends_at: string | null
  /** 1 = activada, 0 = desactivada */
  webalert_state: number
}

export type WebAlertPostRequestDto = WebAlertBodyDto & {
  /** `YYYY-MM-DD HH:mm:ss` */
  webalert_created_at: string
}

export type WebAlertPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebAlertApiItem
  errors?: Record<string, string[]>
}
