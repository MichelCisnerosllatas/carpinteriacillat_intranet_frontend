import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'

export const metadata: Metadata = { title: 'Settings — Profile' }

export default function SettingsProfilePage() {
  return (
    <>
      <Header fixed title="Settings — Profile" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-muted-foreground">Settings — Profile</h2>
            <p className="text-sm text-muted-foreground/60">
              This page is ready to build — add your content here.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
