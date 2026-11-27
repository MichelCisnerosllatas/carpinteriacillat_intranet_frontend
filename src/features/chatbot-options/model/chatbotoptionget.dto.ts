// Lo que RESPONDE la API de opciones de inicio del chatbot (los ListTile de la primera pantalla).
// Nombres = columnas de `chatbot_option`.

import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type ChatbotOptionAction = 'chat' | 'whatsapp' | 'url'

export type ChatbotOptionApiItem = {
  id_chatbot_option: number
  /** Identificador estable que usa el bot para saber de qué trata la conversación ('assistant', 'quote'). */
  option_key: string
  title: string
  subtitle: string | null
  /** Clase Font Awesome, ej. 'fa-solid fa-robot'. */
  icon: string
  action: ChatbotOptionAction
  /** Número (whatsapp) o URL (url). null si action = chat. */
  value: string | null
  sort_order: number
  state: boolean
  created_at: string | null
  updated_at: string | null
}

export type ChatbotOptionListRequestDto = {
  search?: string
  /** 1 = activas, 0 = inactivas */
  state?: number
  per_page?: number
  page?: number
}

export type ChatbotOptionListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotOptionApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ChatbotOptionGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotOptionApiItem
}
