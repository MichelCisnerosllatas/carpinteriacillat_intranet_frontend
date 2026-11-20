import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotConversationsTable } from '@/features/chatbot-conversations/ui/list/chatbot-conversations-table'

export const metadata: Metadata = { title: 'Conversaciones del ChatBot' }

export default function ChatbotConversationsPage() {
  return (
    <>
      <Header fixed title="Conversaciones del ChatBot" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Conversaciones</h2>
          <p className="text-muted-foreground">Lo que los clientes escribieron (o dijeron por voz) al chatbot del sitio web</p>
        </div>
        <ChatbotConversationsTable />
      </main>
    </>
  )
}
