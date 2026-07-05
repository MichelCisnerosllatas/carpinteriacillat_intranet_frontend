import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Package } from 'lucide-react'
import { ProductsServicesTable } from '@/features/products-services/ui/list/products-services-table'

export const metadata: Metadata = { title: 'Productos y Servicios' }

export default function ProductsServicesPage() {
  return (
    <>
      <Header fixed title="Productos y Servicios" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Productos y Servicios</h2>
            <p className="text-muted-foreground">Catálogo de ítems facturables para proformas</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/products-services/create"><Package size={18} /><span>Nuevo Producto/Servicio</span></Link>
          </Button>
        </div>
        <ProductsServicesTable />
      </main>
    </>
  )
}
