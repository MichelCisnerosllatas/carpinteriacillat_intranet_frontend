// Conversaciones del chatbot (DATA que generan los clientes en el sitio público).

import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type ChatbotConversationStatus = 'open' | 'attended' | 'closed'
export type ChatbotMessageRole = 'user' | 'assistant' | 'agent'
export type ChatbotMessageInputType = 'text' | 'voice'

export type ChatbotConversationVisitorApi = {
  id_chatbot_visitor: number
  name: string | null
  phone: string | null
  email: string | null
}

export type ChatbotConversationOptionApi = {
  id_chatbot_option: number
  title: string
}

export type ChatbotMessageApiItem = {
  id_chatbot_message: number
  role: ChatbotMessageRole
  content: string
  input_type: ChatbotMessageInputType
  created_at: string | null
}

/** Item del listado. */
export type ChatbotConversationApiItem = {
  id_chatbot_conversation: number
  uuid: string
  status: ChatbotConversationStatus
  page_url: string | null
  messages_count: number
  last_message_at: string | null
  created_at: string | null
  visitor: ChatbotConversationVisitorApi
  option: ChatbotConversationOptionApi | null
  /** Último mensaje (texto) para la vista rápida. */
  last_message: string | null
}

/** Detalle: lo mismo + el hilo completo (orden ascendente). */
export type ChatbotConversationDetailApiItem = ChatbotConversationApiItem & {
  messages: ChatbotMessageApiItem[]
}

export type ChatbotConversationListRequestDto = {
  /** Nombre/teléfono/email del visitante o contenido de los mensajes. */
  search?: string
  status?: ChatbotConversationStatus
  id_chatbot_option?: number
  id_chatbot_visitor?: number
  per_page?: number
  page?: number
}

export type ChatbotConversationListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotConversationApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ChatbotConversationGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotConversationDetailApiItem
}

export type ChatbotConversationStatusRequestDto = {
  status: ChatbotConversationStatus
}

export type ChatbotConversationStatusResponseDto = {
  success: boolean
  status: number
  message: string
  data?: ChatbotConversationApiItem
  errors?: Record<string, string[]>
}
