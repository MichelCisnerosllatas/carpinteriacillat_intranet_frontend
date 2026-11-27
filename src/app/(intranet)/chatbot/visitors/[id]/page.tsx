import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotVisitorsBreadcrumb } from '@/features/chatbot-visitors/ui/chatbot-visitors-breadcrumb'
import { ChatbotVisitorDetail } from '@/features/chatbot-visitors/ui/detail/chatbot-visitor-detail'

export const metadata: Metadata = { title: 'Visitante del ChatBot' }

export default async function ChatbotVisitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de visitante" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ChatbotVisitorsBreadcrumb currentPage="Visitante" />
        <ChatbotVisitorDetail id={id} />
      </main>
    </>
  )
}
