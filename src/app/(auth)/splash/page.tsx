// app/(auth)/splash/page.tsx
'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export default function SplashPage() {
  const router = useRouter()
  const {loadingSplash,verify } = useAuthStore();
  useEffect(() => {
    const checkSession = async () => {
      await verify();
      const { isAuthenticated } = useAuthStore.getState();
      router.replace(isAuthenticated ? '/dashboard' : '/sign-in');
    };

    checkSession();
  }, []);

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