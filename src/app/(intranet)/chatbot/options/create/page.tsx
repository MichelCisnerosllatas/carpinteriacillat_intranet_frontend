import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotOptionsBreadcrumb } from '@/features/chatbot-options/ui/chatbot-options-breadcrumb'
import { ChatbotOptionForm } from '@/features/chatbot-options/ui/form/chatbot-option-form'

export const metadata: Metadata = { title: 'Nueva opción del ChatBot' }

export default function ChatbotOptionCreatePage() {
  return (
    <>
      <Header fixed title="Nueva opción" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ChatbotOptionsBreadcrumb currentPage="Nueva opción" />
        <ChatbotOptionForm mode="create" />
      </main>
    </>
  )
}
