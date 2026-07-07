import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanySocialNetworksBreadcrumb } from '@/features/company-social-networks/ui/company-social-networks-breadcrumb'
import { CompanySocialNetworkDetail } from '@/features/company-social-networks/ui/detail/company-social-network-detail'

export const metadata: Metadata = { title: 'Redes Sociales' }

export default async function CompanySocialNetworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Red Social" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanySocialNetworksBreadcrumb currentPage="Detalle" showHeader={false} />
        <CompanySocialNetworkDetail id={id} />
      </main>
    </>
  )
}
