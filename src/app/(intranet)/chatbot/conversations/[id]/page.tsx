import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotConversationsBreadcrumb } from '@/features/chatbot-conversations/ui/chatbot-conversations-breadcrumb'
import { ChatbotConversationDetail } from '@/features/chatbot-conversations/ui/detail/chatbot-conversation-detail'

export const metadata: Metadata = { title: 'Conversación del ChatBot' }

export default async function ChatbotConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de conversación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ChatbotConversationsBreadcrumb currentPage="Conversación" />
        <ChatbotConversationDetail id={id} />
      </main>
    </>
  )
}
