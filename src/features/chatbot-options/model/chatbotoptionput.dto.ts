// EDITAR una opción (PUT/PATCH /chatbot-options/{id}) y ORDENAR (POST /chatbot-options/reorder).

import type { ChatbotOptionApiItem } from './chatbotoptionget.dto'
import type { ChatbotOptionBodyDto } from './chatbotoptionpost.dto'

export type ChatbotOptionPutRequestDto = ChatbotOptionBodyDto

export type ChatbotOptionPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ChatbotOptionApiItem
  errors?: Record<string, string[]>
}

/** POST /chatbot-options/reorder → la API deja sort_order 1, 2, 3... según la posición de cada id. */
export type ChatbotOptionReorderRequestDto = {
  ids: number[]
}

export type ChatbotOptionReorderResponseDto = {
  success: boolean
  status: number
  message: string
  errors?: Record<string, string[]>
}
