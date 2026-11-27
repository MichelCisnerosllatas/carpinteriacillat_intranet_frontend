'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RotateCcw, Wrench } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'

/**
 * Error inesperado DENTRO del intranet.
 * Se dibuja dentro del layout, así el sidebar sigue visible y el usuario puede ir a otra pantalla.
 */
export default function IntranetError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorPage
      fullScreen={false}
      code="500"
      title="Algo salió mal en esta pantalla"
      description="Ocurrió un error inesperado. Intenta de nuevo o vuelve al inicio."
      icon={<Wrench className="size-10" />}
      actions={
        <>
          <Button onClick={reset}>
            <RotateCcw className="mr-2 size-4" />
            Reintentar
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              Ir al inicio
            </Link>
          </Button>
        </>
      }
    />
  )
}
