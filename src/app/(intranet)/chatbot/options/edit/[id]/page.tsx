import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotOptionsBreadcrumb } from '@/features/chatbot-options/ui/chatbot-options-breadcrumb'
import { ChatbotOptionForm } from '@/features/chatbot-options/ui/form/chatbot-option-form'

export const metadata: Metadata = { title: 'Editar opción del ChatBot' }

export default async function ChatbotOptionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar opción" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ChatbotOptionsBreadcrumb currentPage="Editar opción" />
        <ChatbotOptionForm mode="edit" id={id} />
      </main>
    </>
  )
}
