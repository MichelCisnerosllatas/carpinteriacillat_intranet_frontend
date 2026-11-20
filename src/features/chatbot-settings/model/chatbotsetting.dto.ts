/**
 * `chatbot_setting` — SINGLETON (una sola fila GLOBAL, igual que `footer_setting`). Es el DISEÑO
 * y COMPORTAMIENTO del chatbot del sitio público: visibilidad, posición, colores, textos.
 * La DATA que generan los clientes (conversaciones, visitantes) vive en otras tablas/módulos
 * (features/chatbot-conversations, features/chatbot-visitors). Nunca se crea una segunda fila ni
 * se elimina la única — solo se actualiza (PATCH parcial).
 */
export type ChatbotPosition = 'bottom-right' | 'bottom-left'

export type ChatbotSettingApiItem = {
  id_chatbot_setting?: number | null
  /** Apaga el chatbot COMPLETO en el sitio público. */
  chatbot_state: boolean
  /** false = el botón flotante no se muestra en celulares. */
  show_on_mobile: boolean
  position: ChatbotPosition
  /** Separación en px desde el borde lateral. */
  offset_x: number
  /** Separación en px desde el borde inferior. */
  offset_y: number
  /** Color principal (hex): botón flotante, header, burbujas del cliente. */
  primary_color: string
  header_title: string
  header_subtitle: string | null
  /** Clase de Font Awesome (la web usa FA), ej. 'fa-solid fa-comments'. */
  launcher_icon: string
  /** Animación del botón flotante: 'none' | 'pulse' | 'bounce' | 'wiggle' | 'float'. */
  launcher_animation?: string
  welcome_message: string
  input_placeholder: string
  /** Muestra el botón de micrófono (voz → texto en el navegador). */
  allow_voice: boolean
  /** Segundos para abrirse solo. null = nunca. */
  auto_open_seconds: number | null
  /** true = pide nombre y teléfono antes de chatear. false = anónimo. */
  require_contact_data: boolean
  created_at?: string | null
  updated_at?: string | null
}

export type ChatbotSettingGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotSettingApiItem
}

export type ChatbotSettingUpdateRequestDto = Partial<Omit<ChatbotSettingApiItem, 'id_chatbot_setting' | 'created_at' | 'updated_at'>>

export type ChatbotSettingUpdateResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotSettingApiItem
  errors?: Record<string, string[]>
}
