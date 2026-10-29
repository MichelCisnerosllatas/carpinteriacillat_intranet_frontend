import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebWorksTable } from '@/features/web-works/ui/list/web-works-table'
import { WebWorksPrimaryButtons } from '@/features/web-works/ui/web-works-primary-buttons'

export const metadata: Metadata = { title: 'Trabajos' }

export default async function WebWorksPage({ searchParams }: { searchParams: Promise<{ typework_key?: string }> }) {
  const { typework_key } = await searchParams
  return (
    <>
      <Header fixed title="Trabajos" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Trabajos</h2>
            <p className="text-muted-foreground">Galería de la web: fabricaciones y restauraciones</p>
          </div>
          <WebWorksPrimaryButtons />
        </div>
        {/* `?typework_key=` abre directo en la pestaña de ese tipo */}
        <WebWorksTable initialTypeKey={typework_key || undefined} />
      </main>
    </>
  )
}
