import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { MessagesDashboard } from '@/features/dashboard/ui/messages/messages-dashboard'

export const metadata: Metadata = { title: 'Mensajes y opiniones' }

export default function MessagesDashboardPage() {
  return (
    <>
      <Header fixed title='Mensajes y opiniones' />
      <main className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Mensajes y opiniones</h2>
          <p className='text-muted-foreground'>Formulario de contacto, testimonios y actividad del chatbot del sitio web</p>
        </div>
        <MessagesDashboard />
      </main>
    </>
  )
}
