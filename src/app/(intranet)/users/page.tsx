import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UsersPrimaryButtons } from '@/features/users/ui/users-primary-buttons'
import { UsersTable } from '@/features/users/ui/users-table'

export const metadata: Metadata = { title: 'Usuarios' }

export default function UsersPage() {
  return (
    <>
      <Header fixed title="Usuarios" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable />
      </main>
    </>
  )
}
