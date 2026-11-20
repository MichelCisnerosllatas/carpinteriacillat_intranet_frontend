import type { DashboardPeriodDto } from './dashboard-common.dto'

// GET /v1/intranet/dashboard/messages — contrato §7.4 (Mensajes y opiniones)

export type MessagesKpisDto = {
  contact_total: number
  contact_new: number
  contact_attended_rate_pct: number | null
  testimonies_total: number
  testimonies_avg_rating: number | null
  chatbot_conversations: number
  chatbot_messages: number
  chatbot_visitors_with_contact: number
}

export type ContactByProjectTypeDto = { key: string; label: string; count: number }
export type ContactByStatusDto = { status: string; label: string; count: number }
export type ContactMonthlyDto = { month: string; label: string; count: number }
export type TestimoniesByRatingDto = { rating: number; label: string; count: number }
export type ChatbotByOptionDto = { option_key: string; title: string; count: number }
export type ChatbotByStatusDto = { status: string; label: string; count: number }
export type ChatbotDailyDto = { date: string; label: string; conversations: number; messages: number }
export type ChatbotInputTypeDto = { type: 'text' | 'voice'; label: string; count: number }

export type DashboardMessagesDto = {
  period: DashboardPeriodDto
  kpis: MessagesKpisDto
  contact_by_project_type: ContactByProjectTypeDto[]
  contact_by_status: ContactByStatusDto[]
  contact_monthly: ContactMonthlyDto[]
  testimonies_by_rating: TestimoniesByRatingDto[]
  chatbot_by_option: ChatbotByOptionDto[]
  chatbot_by_status: ChatbotByStatusDto[]
  chatbot_daily: ChatbotDailyDto[]
  chatbot_input_type: ChatbotInputTypeDto[]
}
