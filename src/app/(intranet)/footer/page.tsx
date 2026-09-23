import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FooterSettingsTabs } from '@/features/footer/ui/footer-settings-tabs'

export const metadata: Metadata = { title: 'Footer del Sitio Web' }

export default function FooterGuidePage() {
  return (
    <>
      <Header fixed title="Footer del Sitio Web" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Footer del Sitio Web</h2>
          <p className="text-muted-foreground">Visibilidad y dónde se gestiona cada parte del pie de página público</p>
        </div>
        <FooterSettingsTabs />
      </main>
    </>
  )
}
