import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ChatbotSettingsForm } from '@/features/chatbot-settings/ui/chatbot-settings-form'

export const metadata: Metadata = { title: 'Configuración del ChatBot' }

export default function ChatbotSettingsPage() {
  return (
    <>
      <Header fixed title="Configuración del ChatBot" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración del ChatBot</h2>
          <p className="text-muted-foreground">Diseño, comportamiento, visibilidad y posición del asistente del sitio web</p>
        </div>
        <ChatbotSettingsForm />
      </main>
    </>
  )
}
