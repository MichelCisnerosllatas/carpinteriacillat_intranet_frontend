import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyContactsBreadcrumb } from '@/features/company-contacts/ui/company-contacts-breadcrumb'
import { CompanyContactDetail } from '@/features/company-contacts/ui/detail/company-contact-detail'

export const metadata: Metadata = { title: 'Contactos' }

export default async function CompanyContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Contacto" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanyContactsBreadcrumb currentPage="Detalle" showHeader={false} />
        <CompanyContactDetail id={id} />
      </main>
    </>
  )
}
