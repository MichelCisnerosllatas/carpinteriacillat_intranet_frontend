import Link from 'next/link'
import type { Metadata } from 'next'
import { Home, SearchX } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'

export const metadata: Metadata = { title: 'Página no encontrada' }

/** Se muestra en cualquier URL que no existe (ej. /loquesea). */
export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Ups, esta pantalla no está en el taller"
      description="Puede que el enlace esté mal escrito o que la página se haya movido."
      icon={<SearchX className="size-10" />}
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
