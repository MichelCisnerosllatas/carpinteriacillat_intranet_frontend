import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ContactMessagesTable } from '@/features/contact-messages/ui/list/contact-messages-table'

export const metadata: Metadata = { title: 'Mensajes de Contacto' }

export default function ContactMessagesPage() {
  return (
    <>
      <Header fixed title="Mensajes de Contacto" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Mensajes de Contacto</h2>
            <p className="text-muted-foreground">Mensajes recibidos desde el formulario del sitio web</p>
          </div>
        </div>
        <ContactMessagesTable />
      </main>
    </>
  )
}
