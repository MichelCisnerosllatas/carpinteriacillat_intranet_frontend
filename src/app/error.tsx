'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RotateCcw, Wrench } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'

/**
 * Error inesperado FUERA del intranet (ej. en el login).
 * Next.js muestra esta pantalla cuando un componente lanza un error al dibujarse.
 */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorPage
      code="500"
      title="Algo salió mal"
      description="Ocurrió un error inesperado. Intenta de nuevo; si sigue pasando, avisa al equipo técnico."
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
