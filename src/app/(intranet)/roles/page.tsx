import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { RolesPrimaryButtons } from '@/features/roles/ui/roles-primary-buttons'
import { RolesTable } from '@/features/roles/ui/roles-table'

export const metadata: Metadata = { title: 'Roles' }

export default function RolesPage() {
  return (
    <>
      <Header fixed title="Roles" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
            <p className="text-muted-foreground">Gestión de roles del sistema</p>
          </div>
          <RolesPrimaryButtons />
        </div>
        <RolesTable />
      </main>
    </>
  )
}
