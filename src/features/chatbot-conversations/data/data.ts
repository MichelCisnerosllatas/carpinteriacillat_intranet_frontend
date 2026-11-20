import type { ChatbotConversationStatus } from '../model/chatbotconversationget.dto'

export const CHATBOT_CONVERSATION_STATUSES: { value: ChatbotConversationStatus; label: string; badge: string }[] = [
  { value: 'open',     label: 'Abierta',  badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
  { value: 'attended', label: 'Atendida', badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  { value: 'closed',   label: 'Cerrada',  badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300' },
]

export const getChatbotConversationStatus = (value: string) =>
  CHATBOT_CONVERSATION_STATUSES.find((s) => s.value === value) ?? CHATBOT_CONVERSATION_STATUSES[0]

/** Nombre a mostrar del visitante: su nombre o "Visitante anónimo #id". */
export const visitorDisplayName = (visitor: { id: number; name: string | null }) =>
  visitor.name?.trim() || `Visitante anónimo #${visitor.id}`

/**
 * Fecha de la API ("2026-11-14 10:30:00" o ISO) → "14/11/2026, 10:30". Devuelve '—' si viene null
 * o no se puede leer.
 */
export const formatChatDate = (value: string | null | undefined, withTime = true) => {
  if (!value) return '—'
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-PE', withTime
    ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Solo la hora ("10:30") para las burbujas del hilo. */
export const formatChatTime = (value: string | null | undefined) => {
  if (!value) return ''
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}
