import Link from 'next/link'
import type { Metadata } from 'next'
import { Home, Wrench } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'

export const metadata: Metadata = { title: 'Error 500' }

export default function Error500Page() {
  return (
    <ErrorPage
      code="500"
      title="Error del servidor"
      description="Algo falló de nuestro lado. Intenta de nuevo en unos minutos."
      icon={<Wrench className="size-10" />}
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
