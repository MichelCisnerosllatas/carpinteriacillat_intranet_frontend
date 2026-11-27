import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProfileView } from '@/features/profile'

export const metadata: Metadata = { title: 'Mi perfil' }

export default function ProfilePage() {
  return (
    <>
      <Header fixed title="Mi perfil" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mi perfil</h2>
          <p className="text-muted-foreground">
            Tus datos, tu rol, las sucursales donde trabajas y tu contraseña.
          </p>
        </div>
        <ProfileView />
      </main>
    </>
  )
}
