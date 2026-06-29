import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UserDevicesAccordionTable } from '@/features/user-devices/ui/list/user-devices-accordion-table'

export const metadata: Metadata = { title: 'Dispositivos y Sesiones' }

export default function UserDevicesPage() {
  return (
    <>
      <Header fixed title="Dispositivos y Sesiones" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dispositivos y Sesiones</h2>
          <p className="text-muted-foreground">
            Gestiona los dispositivos conectados y revoca sesiones activas
          </p>
        </div>
        <UserDevicesAccordionTable />
      </main>
    </>
  )
}
