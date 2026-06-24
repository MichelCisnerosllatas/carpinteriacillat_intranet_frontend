import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UserDeviceDetail } from '@/features/user-devices/ui/user-device-detail'
import { UserDevicesBreadcrumb } from '@/features/user-devices/ui/user-devices-breadcrumb'

export const metadata: Metadata = { title: 'Detalle de Dispositivo' }

export default async function UserDeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <Header fixed title="Detalle de Dispositivo" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <UserDevicesBreadcrumb
          currentPage="Detalle de Dispositivo"
          parentPage="Dispositivos y Sesiones"
          backHref="/user-devices"
        />
        <UserDeviceDetail id={id} />
      </main>
    </>
  )
}
