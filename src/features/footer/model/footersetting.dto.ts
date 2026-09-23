/**
 * `footer_setting` — SINGLETON: una única fila GLOBAL (el footer es el mismo pie de página en
 * todo el sitio, no hay nada por sección/página que elegir). Controla si se muestra el footer
 * completo y cada una de sus columnas en el sitio web público. Tabla propia, separada de
 * `section_web_setting` (tabs/permisos del intranet) y de `company_settings`/
 * `company_social_networks` (esas son el CONTENIDO del footer — logo, redes — esta es solo la
 * VISIBILIDAD). Nunca se crea una segunda fila ni se elimina la única — solo se actualiza.
 */
export type FooterObjectFit = 'contain' | 'cover'

export type FooterSettingApiItem = {
  /** Logo propio del footer. `null` = usa el mismo logo que el header (`company_settings.logo`). */
  logo: string | null
  /** Alto en píxeles del logo en el sitio público. */
  logo_height: number
  /** Ancho en píxeles. `null` = automático, según la proporción real de la imagen. */
  logo_width: number | null
  /** 'contain' (nunca recorta) o 'cover' (llena el espacio, puede recortar). */
  logo_object_fit: FooterObjectFit
  /** Apaga el footer COMPLETO en el sitio público. */
  footer_state: boolean
  /** Columna logo + nombre + redes sociales. */
  show_brand: boolean
  /** Columna "Enlaces Rápidos". */
  show_quick_links: boolean
  /** Columna "Servicios". */
  show_services: boolean
  /** Columna "Accesos" (link a la Intranet). */
  show_access: boolean
}

export type FooterSettingGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: FooterSettingApiItem
}

export type FooterSettingUpdateRequestDto = {
  logo?: string | null
  logo_height?: number
  logo_width?: number | null
  logo_object_fit?: FooterObjectFit
  footer_state?: boolean
  show_brand?: boolean
  show_quick_links?: boolean
  show_services?: boolean
  show_access?: boolean
}

export type FooterSettingUpdateResponseDto = {
  success: boolean
  status: number
  message: string
  data: FooterSettingApiItem
  errors?: Record<string, string[]>
}
