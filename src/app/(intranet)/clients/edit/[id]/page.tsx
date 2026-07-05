import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ClientsBreadcrumb } from '@/features/clients/ui/clients-breadcrumb'
import { ClientForm } from '@/features/clients/ui/form/client-form'

export const metadata: Metadata = { title: 'Clientes' }

export default async function ClientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Cliente" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ClientsBreadcrumb currentPage="Editar Cliente" />
        <ClientForm mode="edit" id={id} />
      </main>
    </>
  )
}
