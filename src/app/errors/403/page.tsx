import Link from 'next/link'
import type { Metadata } from 'next'
import { Home, ShieldOff } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'

export const metadata: Metadata = { title: 'Error 403' }

export default function Error403Page() {
  return (
    <ErrorPage
      code="403"
      title="No tienes permiso"
      description="Tu rol no tiene acceso a esta pantalla. Si crees que es un error, pide acceso a un administrador."
      icon={<ShieldOff className="size-10" />}
      actions={
        <>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              Ir al inicio
            </Link>
          </Button>
          <GoBackButton />
        </>
      }
    />
  )
}
