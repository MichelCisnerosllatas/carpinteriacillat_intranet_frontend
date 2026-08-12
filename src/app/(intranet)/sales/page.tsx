import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/widgets/header/header'
import { Button } from '@/shared/ui/button'
import { ReceiptText } from 'lucide-react'
import { SalesTable } from '@/features/sales/ui/list/sales-table'

export const metadata: Metadata = { title: 'Ventas' }

export default function SalesPage() {
  return (
    <>
      <Header fixed title="Ventas" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ventas</h2>
            <p className="text-muted-foreground">Gestión de ventas a los clientes</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/sales/create">
              <ReceiptText size={18} />
              <span>Nueva Venta</span>
            </Link>
          </Button>
        </div>
        <SalesTable />
      </main>
    </>
  )
}
