import Link from 'next/link'
import type { Metadata } from 'next'
import { Construction, Home } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'

export const metadata: Metadata = { title: 'Error 503' }

export default function Error503Page() {
  return (
    <ErrorPage
      code="503"
      title="Estamos en mantenimiento"
      description="El sistema no está disponible por ahora. Vuelve a intentarlo en unos minutos."
      icon={<Construction className="size-10" />}
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
