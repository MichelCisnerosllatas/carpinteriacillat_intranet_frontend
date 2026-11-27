import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotOptionsTable } from '@/features/chatbot-options/ui/list/chatbot-options-table'
import { ChatbotOptionsPrimaryButtons } from '@/features/chatbot-options/ui/chatbot-options-primary-buttons'

export const metadata: Metadata = { title: 'Opciones del ChatBot' }

export default function ChatbotOptionsPage() {
  return (
    <>
      <Header fixed title="Opciones del ChatBot" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Opciones de inicio</h2>
            <p className="text-muted-foreground">Lo que el cliente ve al abrir el chatbot: cada opción abre el chat, WhatsApp o un enlace</p>
          </div>
          <ChatbotOptionsPrimaryButtons />
        </div>
        <ChatbotOptionsTable />
      </main>
    </>
  )
}
