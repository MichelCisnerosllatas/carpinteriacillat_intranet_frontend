import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { UsersProvider } from '@/features/users/components/users-provider'
import { UsersPrimaryButtons } from '@/features/users/components/users-primary-buttons'
import { UsersTable } from '@/features/users/components/users-table'
import { users } from '@/features/users/data/users'

export const metadata: Metadata = { title: 'Users' }

export default function UsersPage() {
  return (
    <UsersProvider>
      <Header fixed title="User List" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User List</h2>
            <p className="text-muted-foreground">Manage your users and their roles here.</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={users} />
      </main>
    </UsersProvider>
  )
}
