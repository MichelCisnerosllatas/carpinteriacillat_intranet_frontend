// Visitantes del chatbot (DATA): cada navegador que abrió una conversación. Anónimos por defecto
// (identificados por `visitor_token`, un uuid guardado en el navegador); con nombre/teléfono si
// `chatbot_setting.require_contact_data` está encendido o si el cliente los dio.

import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type ChatbotVisitorApiItem = {
  id_chatbot_visitor: number
  visitor_token: string
  /** Usuario del sistema si inició sesión (Google) en la web. */
  id_user: number | null
  name: string | null
  phone: string | null
  email: string | null
  ip_address: string | null
  user_agent: string | null
  last_seen_at: string | null
  created_at: string | null
  conversations_count: number
}

export type ChatbotVisitorConversationApi = {
  id_chatbot_conversation: number
  status: string
  messages_count: number
  last_message_at: string | null
  created_at: string | null
  option_title: string | null
}

export type ChatbotVisitorDetailApiItem = ChatbotVisitorApiItem & {
  conversations: ChatbotVisitorConversationApi[]
}

export type ChatbotVisitorListRequestDto = {
  search?: string
  per_page?: number
  page?: number
}

export type ChatbotVisitorListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotVisitorApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ChatbotVisitorGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotVisitorDetailApiItem
}
