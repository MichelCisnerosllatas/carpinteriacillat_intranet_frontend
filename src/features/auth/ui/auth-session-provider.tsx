// src/features/auth/ui/auth-session-provider.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { SessionExpired } from '@/shared/api/sessionExpired'
import { TokenStorage } from '@/features/auth/storage/token.storage'

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const verify = useAuthStore((state) => state.verify)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    SessionExpired.setCallback(() => {
      TokenStorage.clearTokens()
      window.location.replace('/sign-in')
    })

    const init = async () => {
      await verify()
      setReady(true)
    }

    init()
  }, [verify])

  if (!ready) {
    return null
  }

  return <>{children}</>
}