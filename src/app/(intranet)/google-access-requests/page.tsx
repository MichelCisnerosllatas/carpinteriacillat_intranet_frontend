import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { GoogleAccessRequestsTable } from '@/features/google-access-requests/ui/list/google-access-requests-table'

export const metadata: Metadata = { title: 'Solicitudes de acceso con Google' }

export default function GoogleAccessRequestsPage() {
  return (
    <>
      <Header fixed title="Solicitudes de acceso con Google" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Solicitudes de acceso con Google</h2>
            <p className="text-muted-foreground">Cuentas de Google que intentaron entrar sin estar registradas — apruébalas o recházalas</p>
          </div>
        </div>
        <GoogleAccessRequestsTable />
      </main>
    </>
  )
}
