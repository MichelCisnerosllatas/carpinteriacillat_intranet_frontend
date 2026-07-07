import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanySocialNetworksBreadcrumb } from '@/features/company-social-networks/ui/company-social-networks-breadcrumb'
import { CompanySocialNetworkForm } from '@/features/company-social-networks/ui/form/company-social-network-form'

export const metadata: Metadata = { title: 'Redes Sociales' }

export default function CompanySocialNetworkCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Red Social" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanySocialNetworksBreadcrumb currentPage="Nueva Red Social" />
        <CompanySocialNetworkForm mode="create" />
      </main>
    </>
  )
}
