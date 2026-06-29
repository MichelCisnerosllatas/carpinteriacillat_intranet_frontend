import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UsersBreadcrumb } from '@/features/users/ui/users-breadcrumb'
import { UserDetail } from '@/features/users/ui/detail/user-detail'

export const metadata: Metadata = { title: 'Detalle de Usuario' }

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <Header fixed title="Detalle de Usuario" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <UsersBreadcrumb currentPage="Detalle de Usuario" showHeader={false} />
        <UserDetail id={id} />
      </main>
    </>
  )
}
