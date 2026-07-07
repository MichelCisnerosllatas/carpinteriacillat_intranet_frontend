import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Phone } from 'lucide-react'
import { CompanyContactsTable } from '@/features/company-contacts/ui/list/company-contacts-table'

export const metadata: Metadata = { title: 'Contactos' }

export default function CompanyContactsPage() {
  return (
    <>
      <Header fixed title="Contactos" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contactos</h2>
            <p className="text-muted-foreground">Teléfonos y contactos adicionales de la empresa</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/company-contacts/create"><Phone size={18} /><span>Nuevo Contacto</span></Link>
          </Button>
        </div>
        <CompanyContactsTable />
      </main>
    </>
  )
}
