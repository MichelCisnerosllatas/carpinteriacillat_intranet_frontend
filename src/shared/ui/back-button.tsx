'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { hasInAppHistory } from '@/shared/lib/navigation-history'

interface BackButtonProps {
  /** Ruta a la que ir si no hay una página anterior en el historial de la app (enlace directo, pestaña nueva). */
  fallbackHref: string
  /** Texto accesible y del tooltip. */
  label: string
  className?: string
}

/**
 * Botón "volver" para cabeceras de detalle/formulario.
 *
 * Si el usuario llegó navegando dentro de la app (hay una entrada previa en el historial),
 * usa `router.back()` para regresar de verdad a esa pantalla, preservando su página, filtros
 * y scroll (Next.js restaura esa entrada desde su caché en vez de recargar el listado desde cero).
 *
 * Si no hay historial dentro de la app (enlace directo, pestaña nueva), cae a
 * `fallbackHref` — normalmente el listado del módulo. Una recarga (F5) sigue funcionando
 * igual que antes de recargar, porque la línea base se guarda en sessionStorage.
 */
export function BackButton({ fallbackHref, label, className }: BackButtonProps) {
  const router = useRouter()

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasInAppHistory()) {
      event.preventDefault()
      router.back()
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" className={cn('size-8 shrink-0', className)} asChild>
          <Link href={fallbackHref} onClick={handleClick}>
            <ChevronLeft className="size-4" />
            <span className="sr-only">{label}</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
