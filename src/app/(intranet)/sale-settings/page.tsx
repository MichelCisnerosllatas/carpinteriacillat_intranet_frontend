import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SaleSettingView } from '@/features/sale-settings/ui/sale-setting-view'

export const metadata: Metadata = { title: 'Configuración de Ventas' }

// Las metas mensuales ya no viven aquí: tienen su propia página /sale-goals.
export default function SaleSettingsPage() {
  return (
    <>
      <Header fixed title="Configuración de Ventas" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SaleSettingView />
      </main>
    </>
  )
}
