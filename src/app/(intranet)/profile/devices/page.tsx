import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { MyDevicesList } from '@/features/user-devices/ui/my-devices-list'

export const metadata: Metadata = { title: 'Mis Dispositivos' }

export default function MyDevicesPage() {
  return (
    <>
      <Header fixed title="Mis Dispositivos" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mis dispositivos</h2>
          <p className="text-muted-foreground">
            Sesiones activas donde has iniciado sesión. Puedes cerrar cualquiera desde aquí.
          </p>
        </div>
        <div className="max-w-2xl">
          <MyDevicesList />
        </div>
      </main>
    </>
  )
}
