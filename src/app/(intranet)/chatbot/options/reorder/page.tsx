import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotOptionsBreadcrumb } from '@/features/chatbot-options/ui/chatbot-options-breadcrumb'
import { ChatbotOptionsReorderList } from '@/features/chatbot-options/ui/reorder/chatbot-options-reorder-list'

export const metadata: Metadata = { title: 'Ordenar opciones del ChatBot' }

export default function ChatbotOptionsReorderPage() {
  return (
    <>
      <Header fixed title="Ordenar opciones" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ChatbotOptionsBreadcrumb currentPage="Ordenar" />
        <ChatbotOptionsReorderList />
      </main>
    </>
  )
}
