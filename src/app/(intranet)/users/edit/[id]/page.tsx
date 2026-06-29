import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UsersBreadcrumb } from '@/features/users/ui/users-breadcrumb'
import { UserForm } from '@/features/users/ui/form/user-form'

export const metadata: Metadata = { title: 'Editar Usuario' }

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <Header fixed title="Editar Usuario" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <UsersBreadcrumb currentPage="Editar Usuario" />
        <UserForm mode="edit" id={id} />
      </main>
    </>
  )
}
