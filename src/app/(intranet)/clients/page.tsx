import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Users2 } from 'lucide-react'
import { ClientsTable } from '@/features/clients/ui/list/clients-table'

export const metadata: Metadata = { title: 'Clientes' }

export default function ClientsPage() {
  return (
    <>
      <Header fixed title="Clientes" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground">Clientes comerciales que reciben proformas</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/clients/create"><Users2 size={18} /><span>Nuevo Cliente</span></Link>
          </Button>
        </div>
        <ClientsTable />
      </main>
    </>
  )
}
