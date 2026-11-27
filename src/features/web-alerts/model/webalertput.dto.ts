// Tipos para EDITAR una alerta (PUT/PATCH /web-alert/{id}) y para guardar el orden (POST /web-alert/reorder).

import type { WebAlertApiItem } from './webalertget.dto'
import type { WebAlertBodyDto } from './webalertpost.dto'

export type WebAlertPutRequestDto = WebAlertBodyDto & {
  /** `YYYY-MM-DD HH:mm:ss` */
  webalert_updated_at: string
}

export type WebAlertPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebAlertApiItem
  errors?: Record<string, string[]>
}

/** POST /web-alert/reorder → la API deja el orden 1, 2, 3... según la posición de cada id. */
export type WebAlertReorderRequestDto = {
  ids: number[]
}

export type WebAlertReorderResponseDto = {
  success: boolean
  status: number
  message: string
  errors?: Record<string, string[]>
}
