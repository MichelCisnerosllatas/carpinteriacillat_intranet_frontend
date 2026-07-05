import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanySettingView } from '@/features/company-settings/ui/company-setting-view'

export const metadata: Metadata = { title: 'Configuración de la Empresa' }

export default function CompanySettingsPage() {
  return (
    <>
      <Header fixed title="Configuración de la Empresa" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <h2 className="text-lg font-semibold">Ficha de la empresa</h2>
        <CompanySettingView />
      </main>
    </>
  )
}
