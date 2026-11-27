// src/app/page.tsx
'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { getHomeUrl } from '@/features/auth/lib/home-url'

export default function RootPage() {
  const router = useRouter()
  // Solo la sesión local: el layout del intranet ya pide GET verify al backend al entrar.
  const loadLocalSession = useAuthStore((state) => state.loadLocalSession)
  const loadingSplash = useAuthStore((state) => state.loadingSplash)

  useEffect(() => {
    const checkSession = async () => {
      await loadLocalSession()

      // Con sesión → su pantalla de inicio según los permisos de su rol (no siempre el dashboard).
      const { isAuthenticated, session } = useAuthStore.getState()
      router.replace(isAuthenticated ? getHomeUrl(session) : '/sign-in')
    }

    checkSession()
  }, [router, loadLocalSession])

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background">
      <Image
        src="/cillat/logo.png"
        alt="Logo"
        width={106}
        height={26}
        className="mb-6 animate-bounce"
        priority
      />

      <h1 className="text-2xl font-bold mb-4 text-foreground">
        Carpintería Cillat
      </h1>

      <div className="animate-pulse text-xl font-semibold text-muted-foreground">
        {loadingSplash ? 'Cargando...' : 'Redirigiendo...'}
      </div>
    </div>
  )
}
// import { redirect } from 'next/navigation'
// export default function RootPage() {
//   redirect('/splash')
// }
