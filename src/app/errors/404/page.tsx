import Link from 'next/link'
import type { Metadata } from 'next'
import { Hammer, Home } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'

export const metadata: Metadata = { title: 'Error 404' }

export default function Error404Page() {
  return (
    <ErrorPage
      code="404"
      title="Esta página no existe"
      description="Puede que el enlace esté mal escrito o que la página se haya movido."
      icon={<Hammer className="size-10" />}
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
