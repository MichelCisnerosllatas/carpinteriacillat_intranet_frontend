import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UsersBreadcrumb } from '@/features/users/ui/users-breadcrumb'
import { UserForm } from '@/features/users/ui/form/user-form'

export const metadata: Metadata = { title: 'Crear Usuario' }

export default function UserCreatePage() {
  return (
    <>
      <Header fixed title="Crear Usuario" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <UsersBreadcrumb currentPage="Crear Usuario" />
        <UserForm mode="create" />
      </main>
    </>
  )
}
