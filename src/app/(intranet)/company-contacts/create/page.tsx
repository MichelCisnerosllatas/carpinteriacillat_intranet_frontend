import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyContactsBreadcrumb } from '@/features/company-contacts/ui/company-contacts-breadcrumb'
import { CompanyContactForm } from '@/features/company-contacts/ui/form/company-contact-form'

export const metadata: Metadata = { title: 'Contactos' }

export default function CompanyContactCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Contacto" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanyContactsBreadcrumb currentPage="Nuevo Contacto" />
        <CompanyContactForm mode="create" />
      </main>
    </>
  )
}
