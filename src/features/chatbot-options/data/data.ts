// Opciones fijas de las "Opciones de inicio" del chatbot. Los `value` son los que guarda el backend.

import { ExternalLink, MessageCircle, MessagesSquare, type LucideIcon } from 'lucide-react'
import type { ChatbotOptionAction } from '../model/chatbotoptionget.dto'

export const CHATBOT_OPTION_ACTIONS: { value: ChatbotOptionAction; label: string; description: string; icon: LucideIcon }[] = [
  { value: 'chat',     label: 'Abrir chat',          description: 'Abre la conversación con el asistente.', icon: MessagesSquare },
  { value: 'whatsapp', label: 'Ir a WhatsApp',       description: 'Abre WhatsApp con el número indicado.',  icon: MessageCircle },
  { value: 'url',      label: 'Abrir un enlace',     description: 'Lleva a una página del sitio o externa.', icon: ExternalLink },
]

export const getChatbotOptionAction = (value: string) =>
  CHATBOT_OPTION_ACTIONS.find((a) => a.value === value) ?? CHATBOT_OPTION_ACTIONS[0]

/** Filtro de la lista por el interruptor "Activa". */
export const CHATBOT_OPTION_STATES = [
  { value: 1, label: 'Activas' },
  { value: 0, label: 'Inactivas' },
]
