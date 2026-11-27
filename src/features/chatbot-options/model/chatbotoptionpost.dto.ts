// CREAR una opción (POST /chatbot-options).

import type { ChatbotOptionAction, ChatbotOptionApiItem } from './chatbotoptionget.dto'

/** Campos que se envían al crear o editar. El orden (`sort_order`) se maneja en "Ordenar". */
export type ChatbotOptionBodyDto = {
  option_key: string
  title: string
  subtitle: string | null
  icon: string
  action: ChatbotOptionAction
  value: string | null
  state: boolean
}

export type ChatbotOptionPostRequestDto = ChatbotOptionBodyDto

export type ChatbotOptionPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotOptionApiItem
  errors?: Record<string, string[]>
}
