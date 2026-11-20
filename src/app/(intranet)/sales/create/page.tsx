import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SalesBreadcrumb } from '@/features/sales/ui/sales-breadcrumb'
import { SalePosPage } from '@/features/sales/ui/pos/sale-pos-page'

export const metadata: Metadata = { title: 'Ventas' }

// `?proforma={id}` lo usa "Convertir en venta" desde proformas: la pantalla se precarga sola.
// Se lee aquí (Server Component) y se pasa como prop, así el componente cliente no necesita
// useSearchParams ni un Suspense extra.
export default async function SaleCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ proforma?: string }>
}) {
  const { proforma } = await searchParams
  const proformaId = proforma && Number(proforma) > 0 ? Number(proforma) : null
  return (
    <>
      <Header fixed title="Realizar Venta" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SalesBreadcrumb currentPage="Realizar Venta" />
        <SalePosPage key={proformaId ?? 'new'} mode="create" proformaId={proformaId} />
      </main>
    </>
  )
}
