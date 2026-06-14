import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { RolesBreadcrumb } from '@/features/roles/ui/roles-breadcrumb'
import { RoleDetail } from '@/features/roles/ui/role-detail'

export const metadata: Metadata = { title: 'Detalle de Rol' }

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <Header fixed title="Detalle de Rol" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <RolesBreadcrumb currentPage="Detalle de Rol" showHeader={false} />
        <RoleDetail id={id} />
      </main>
    </>
  )
}
