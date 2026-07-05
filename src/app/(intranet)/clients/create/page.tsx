import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ClientsBreadcrumb } from '@/features/clients/ui/clients-breadcrumb'
import { ClientForm } from '@/features/clients/ui/form/client-form'

export const metadata: Metadata = { title: 'Clientes' }

export default function ClientCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Cliente" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ClientsBreadcrumb currentPage="Nuevo Cliente" />
        <ClientForm mode="create" />
      </main>
    </>
  )
}
