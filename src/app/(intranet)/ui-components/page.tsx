import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UIComponentsShowcase } from './_components/showcase'

export const metadata: Metadata = { title: 'UI Components' }

export default function UIComponentsPage() {
  return (
    <>
      <Header fixed title="UI Components Reference" />
      <main className="flex flex-col gap-8 p-6 pt-4">
        <p className="text-sm text-muted-foreground max-w-2xl">
          This page is a living reference of all global UI components available in this project.
          Every component comes from <code className="rounded bg-muted px-1 py-0.5 text-xs">src/shared/ui</code> (shadcn/ui).
          Import them from <code className="rounded bg-muted px-1 py-0.5 text-xs">@/shared/ui/[component]</code>.
        </p>
        <UIComponentsShowcase />
      </main>
    </>
  )
}
