import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { RolesBreadcrumb } from '@/features/roles/ui/roles-breadcrumb'
import { RoleForm } from '@/features/roles/ui/form/role-form'

export const metadata: Metadata = { title: 'Crear Rol' }

export default function RoleCreatePage() {
  return (
    <>
      <Header fixed title="Crear Rol" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <RolesBreadcrumb currentPage="Crear Rol" />
        <RoleForm mode="create" />
      </main>
    </>
  )
}
