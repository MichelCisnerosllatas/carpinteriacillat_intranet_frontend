// Conversaciones del chatbot (DATA generada por los clientes en el sitio público). Solo lectura +
// cambio de estado y eliminación.

export {
  useChatbotConversationListStore, mapChatbotConversationFromApi, mapChatbotConversationDetailFromApi, mapChatbotMessageFromApi,
} from './stores/useChatbotConversationListStore'
export { useChatbotConversationDetailStore } from './stores/useChatbotConversationDetailStore'
export { useChatbotConversationStatusStore } from './stores/useChatbotConversationStatusStore'
export { useChatbotConversationDeleteStore } from './stores/useChatbotConversationDeleteStore'

export { chatbotConversationsService } from './services/chatbot-conversations.service'
export { CHATBOT_CONVERSATIONS_ENDPOINTS } from './services/chatbot-conversations.endpoint'

export { ChatbotConversationsTable } from './ui/list/chatbot-conversations-table'
export { ChatbotConversationDetail } from './ui/detail/chatbot-conversation-detail'
export { ChatbotConversationThread } from './ui/detail/chatbot-conversation-thread'
export { ChatbotConversationsBreadcrumb } from './ui/chatbot-conversations-breadcrumb'

export {
  CHATBOT_CONVERSATION_STATUSES, getChatbotConversationStatus, visitorDisplayName, formatChatDate, formatChatTime,
} from './data/data'
export type { ChatbotConversation, ChatbotConversationDetail as ChatbotConversationDetailType, ChatbotMessage } from './data/schema'
export type {
  ChatbotConversationApiItem, ChatbotConversationStatus, ChatbotMessageRole, ChatbotMessageInputType,
} from './model/chatbotconversationget.dto'
