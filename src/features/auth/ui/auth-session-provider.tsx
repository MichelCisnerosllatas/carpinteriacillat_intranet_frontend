// src/features/auth/ui/auth-session-provider.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const verify = useAuthStore((state) => state.verify)
  const [ready, setReady] = useState(false)

  useEffect(() => {
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