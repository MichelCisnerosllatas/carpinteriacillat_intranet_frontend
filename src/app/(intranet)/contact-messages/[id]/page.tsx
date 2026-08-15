import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ContactMessagesBreadcrumb } from '@/features/contact-messages/ui/contact-messages-breadcrumb'
import { ContactMessageDetail } from '@/features/contact-messages/ui/detail/contact-message-detail'

export const metadata: Metadata = { title: 'Mensajes de Contacto' }

export default async function ContactMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Mensaje" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ContactMessagesBreadcrumb currentPage="Detalle" showHeader={false} />
        <ContactMessageDetail id={id} />
      </main>
    </>
  )
}
