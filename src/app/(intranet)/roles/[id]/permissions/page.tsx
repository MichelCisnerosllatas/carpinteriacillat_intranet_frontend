import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { RolesBreadcrumb } from '@/features/roles/ui/roles-breadcrumb'
import { RolePermissionsView } from '@/features/permissions/ui/role-permissions-view'

export const metadata: Metadata = { title: 'Permisos del Rol' }

export default async function RolePermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <Header fixed title="Permisos del Rol" />
      <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0">
        <RolesBreadcrumb currentPage="Permisos" showHeader={false} />
        <RolePermissionsView roleId={Number(id)} />
      </main>
    </>
  )
}
