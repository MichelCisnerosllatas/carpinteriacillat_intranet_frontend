import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ClientsBreadcrumb } from '@/features/clients/ui/clients-breadcrumb'
import { ClientDetail } from '@/features/clients/ui/detail/client-detail'

export const metadata: Metadata = { title: 'Clientes' }

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Cliente" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ClientsBreadcrumb currentPage="Detalle" showHeader={false} />
        <ClientDetail id={id} />
      </main>
    </>
  )
}
