import { redirect } from 'next/navigation'

// /chatbot no tiene pantalla propia: abre directo la configuración.
export default function ChatbotIndexPage() {
  redirect('/chatbot/settings')
}
