import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotVisitorsTable } from '@/features/chatbot-visitors/ui/list/chatbot-visitors-table'

export const metadata: Metadata = { title: 'Visitantes del ChatBot' }

export default function ChatbotVisitorsPage() {
  return (
    <>
      <Header fixed title="Visitantes del ChatBot" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visitantes</h2>
          <p className="text-muted-foreground">Quién usó el chatbot del sitio web (anónimos o con datos de contacto)</p>
        </div>
        <ChatbotVisitorsTable />
      </main>
    </>
  )
}
