// src/features/auth/ui/auth-session-provider.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { SessionExpired } from '@/shared/api/sessionExpired'
import { TokenStorage } from '@/features/auth/storage/token.storage'

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const loadLocalSession = useAuthStore((state) => state.loadLocalSession)
  const syncAccess = useAuthStore((state) => state.syncAccess)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    SessionExpired.setCallback(() => {
      TokenStorage.clearTokens()
      window.location.replace('/sign-in')
    })

    const init = async () => {
      // 1) Sesión local (sin red): con esto ya se puede pintar el intranet.
      const hasSession = await loadLocalSession()
      setReady(true)

      // 2) En segundo plano, se pide GET verify y su respuesta reemplaza la sesión guardada.
      //    Así un cambio de permisos se ve sin tener que volver a iniciar sesión.
      if (hasSession) {
        void syncAccess()
      }
    }

    init()

    // Al salir del intranet (ej. logout → /sign-in) se quita el callback: así un 401 en el
    // login (verify rechazado) muestra su mensaje en vez de recargar la página.
    return () => SessionExpired.setCallback(() => {})
  }, [loadLocalSession, syncAccess])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
