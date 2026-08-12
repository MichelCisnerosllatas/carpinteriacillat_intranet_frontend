import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Tags } from 'lucide-react'
import { SaleDocumentTypesTable } from '@/features/sale-document-types/ui/list/sale-document-types-table'

export const metadata: Metadata = { title: 'Tipos de Comprobante de Venta' }

export default function SaleDocumentTypesPage() {
  return (
    <>
      <Header fixed title="Tipos de Comprobante de Venta" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tipos de Comprobante de Venta</h2>
            <p className="text-muted-foreground">Catálogo de tipos de comprobante de venta</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/sale-document-types/create"><Tags size={18} /><span>Nuevo Tipo</span></Link>
          </Button>
        </div>
        <SaleDocumentTypesTable />
      </main>
    </>
  )
}
