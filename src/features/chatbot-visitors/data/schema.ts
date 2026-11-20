import { z } from 'zod'

export const chatbotVisitorSchema = z.object({
  id: z.number(),
  token: z.string(),
  userId: z.number().nullable(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  lastSeenAt: z.string().nullable(),
  createdAt: z.string().nullable(),
  conversationsCount: z.number(),
})

export type ChatbotVisitor = z.infer<typeof chatbotVisitorSchema>

export type ChatbotVisitorConversation = {
  id: number
  status: string
  messagesCount: number
  lastMessageAt: string | null
  createdAt: string | null
  optionTitle: string | null
}

export type ChatbotVisitorDetail = ChatbotVisitor & { conversations: ChatbotVisitorConversation[] }
