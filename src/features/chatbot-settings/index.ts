// Configuración (DISEÑO + COMPORTAMIENTO) del chatbot del sitio público — singleton `chatbot_setting`.
export { useChatbotSettingStore } from './stores/useChatbotSettingStore'
export { chatbotSettingService } from './services/chatbotsetting.service'
export { CHATBOT_SETTING_ENDPOINTS } from './services/chatbotsetting.endpoint'
export { ChatbotSettingsForm } from './ui/chatbot-settings-form'
export type { ChatbotSettingApiItem, ChatbotPosition } from './model/chatbotsetting.dto'
