import Link from 'next/link'
import type { Metadata } from 'next'
import { Lock, LogIn } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'

export const metadata: Metadata = { title: 'Error 401' }

export default function Error401Page() {
  return (
    <ErrorPage
      code="401"
      title="Necesitas iniciar sesión"
      description="Tu sesión terminó o no has iniciado sesión. Entra de nuevo para continuar."
      icon={<Lock className="size-10" />}
      actions={
        <>
          <Button asChild>
            <Link href="/sign-in">
              <LogIn className="mr-2 size-4" />
              Iniciar sesión
            </Link>
          </Button>
          <GoBackButton />
        </>
      }
    />
  )
}
