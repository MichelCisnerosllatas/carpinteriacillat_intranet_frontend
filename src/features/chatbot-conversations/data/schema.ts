import { z } from 'zod'

export const chatbotMessageSchema = z.object({
  id: z.number(),
  role: z.enum(['user', 'assistant', 'agent']),
  content: z.string(),
  inputType: z.enum(['text', 'voice']),
  createdAt: z.string().nullable(),
})

export type ChatbotMessage = z.infer<typeof chatbotMessageSchema>

/** Conversación ya "traducida" desde la API (ver mapChatbotConversationFromApi). */
export const chatbotConversationSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  status: z.enum(['open', 'attended', 'closed']),
  pageUrl: z.string().nullable(),
  messagesCount: z.number(),
  lastMessageAt: z.string().nullable(),
  createdAt: z.string().nullable(),
  visitor: z.object({
    id: z.number(),
    name: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
  }),
  option: z.object({ id: z.number(), title: z.string() }).nullable(),
  lastMessage: z.string().nullable(),
})

export type ChatbotConversation = z.infer<typeof chatbotConversationSchema>

export type ChatbotConversationDetail = ChatbotConversation & { messages: ChatbotMessage[] }
