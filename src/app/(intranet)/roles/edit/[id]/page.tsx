import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { RolesBreadcrumb } from '@/features/roles/ui/roles-breadcrumb'
import { RoleForm } from '@/features/roles/ui/form/role-form'

export const metadata: Metadata = { title: 'Editar Rol' }

export default async function RoleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <Header fixed title="Editar Rol" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <RolesBreadcrumb currentPage="Editar Rol" />
        <RoleForm mode="edit" id={id} />
      </main>
    </>
  )
}
