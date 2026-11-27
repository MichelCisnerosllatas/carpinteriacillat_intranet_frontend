/**
 * `testimony_web_setting` — SINGLETON: una única fila GLOBAL (no una por sección ni por
 * testimonio). Controla qué columnas de la tarjeta de testimonio se muestran en el sitio web
 * público, y cuántos testimonios como máximo. Tabla propia, separada de `section_web_setting`
 * (ver `TestimonyWebSettingController` en el backend). Nunca se crea una segunda fila ni se
 * elimina la única — solo se actualiza.
 */
export type TestimonyWebSettingApiItem = {
  /** Máximo de testimonios a mostrar en el SITIO WEB (no afecta al listado del intranet, que siempre muestra todos). `null` = todos. */
  testimony_limit: number | null
  show_photo: boolean
  show_rating: boolean
  show_city: boolean
  show_email: boolean
  show_delivered: boolean
  show_verified: boolean
}

export type TestimonyWebSettingGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: TestimonyWebSettingApiItem
}

export type TestimonyWebSettingUpdateRequestDto = {
  testimony_limit?: number | null
  show_photo?: boolean
  show_rating?: boolean
  show_city?: boolean
  show_email?: boolean
  show_delivered?: boolean
  show_verified?: boolean
}

export type TestimonyWebSettingUpdateResponseDto = {
  success: boolean
  status: number
  message: string
  data: TestimonyWebSettingApiItem
  errors?: Record<string, string[]>
}
